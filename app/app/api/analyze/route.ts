import { NextResponse } from "next/server";

import { analyzeBike, localPriceReference } from "@/lib/analysis";
import { getCached, setCached } from "@/lib/server/cache";
import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { logEvent, trustedSearchReference } from "@/lib/server/providers";
import { clientKey, normalizeListingQuery, safeError } from "@/lib/server/utils";
import type { ChildProfile, Listing, PriceReference } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const config = loadServerConfig();
  const key = clientKey(request);
  const body = (await request.json()) as { child?: ChildProfile; listing?: Listing };
  const child = body.child || ({} as ChildProfile);
  const listing = body.listing || ({ title: "", description: "" } as Listing);
  const priceReference = await getPriceReference(config, key, listing);
  const analysis = analyzeBike(child, listing, priceReference);

  try {
    await logEvent(config.featureFlags.backendLogging ? config.providers.databaseUrl : "", "analysis", {
      overall_meter: analysis.overall.meter,
      listing_platform: listing.platform || "",
    });
  } catch (error) {
    console.warn("logging.analysis", safeError(error));
  }

  return NextResponse.json({
    ok: true,
    analysis,
    priceReference,
    apiStatus: {
      llm: config.featureFlags.llmAnalysis && config.providers.openAiApiKey ? "openai" : "mock",
      search: "fallback",
      email: "mock",
      logging: "mock",
    },
  });
}

async function getPriceReference(
  config: ReturnType<typeof loadServerConfig>,
  key: string,
  listing: Listing,
): Promise<PriceReference> {
  const cacheKey = normalizeListingQuery(listing);
  const cached = getCached<PriceReference>(cacheKey, config.limits.searchCacheTtlHours);
  if (cached) return { ...cached, cached: true, message: `${cached.message} Cached result used.` };

  const limit = checkUsageLimits("search", key, config.limits.searchDaily, config.limits.sessionSearch);
  if (
    !limit.allowed ||
    !config.featureFlags.liveSearch ||
    !config.providers.searchApiKey ||
    !config.providers.searchApiUrl
  ) {
    return localPriceReference(
      listing,
      limit.allowed
        ? "Live search disabled. Using local estimate."
        : `${limit.reason === "session" ? "Session" : "Daily"} live search limit reached. Using local estimate.`,
    );
  }

  try {
    const reference = await trustedSearchReference(
      listing,
      config.providers.searchApiKey,
      config.providers.searchApiUrl,
    );
    setCached(cacheKey, reference);
    return reference;
  } catch (error) {
    console.warn("search.reference", safeError(error));
    return localPriceReference(listing, "Live price check failed. Using local estimate.");
  }
}
