import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { mockExtractListingFields, openAiExtractListingFields } from "@/lib/server/providers";
import { clientKey, safeError } from "@/lib/server/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const config = loadServerConfig();
  const { text = "" } = await request.json();
  const limit = checkUsageLimits("llm", clientKey(request), config.limits.llmDaily, config.limits.sessionLlm);

  if (!limit.allowed || !config.featureFlags.llmAnalysis || !config.providers.openAiApiKey) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: limit.allowed
        ? "LLM extraction disabled. Local fallback was used."
        : `${limit.reason === "session" ? "Session" : "Daily"} LLM limit reached. Local fallback was used.`,
      result: mockExtractListingFields(text),
    });
  }

  try {
    const result = await openAiExtractListingFields(
      text,
      config.providers.openAiApiKey,
      config.providers.openAiModel,
    );
    return NextResponse.json({ ok: true, fallback: false, result });
  } catch (error) {
    console.warn("llm.extract", safeError(error));
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "Live extraction failed. Local fallback was used.",
      result: mockExtractListingFields(text),
    });
  }
}
