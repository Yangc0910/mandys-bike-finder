import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { localNegotiationMessage, openAiGenerateMessage } from "@/lib/server/providers";
import { clientKey, safeError } from "@/lib/server/utils";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type MessagePayload = {
  goal: string;
  tone: string;
  listing: Listing;
  options: { targetOffer?: string; pickupTiming?: string; reason?: string };
};

export async function POST(request: Request) {
  const config = loadServerConfig();
  const payload = (await request.json()) as MessagePayload;
  const limit = checkUsageLimits("llm", clientKey(request), config.limits.llmDaily, config.limits.sessionLlm);

  if (!limit.allowed || !config.featureFlags.llmAnalysis || !config.providers.openAiApiKey) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      provider: "mock",
      statusMessage: limit.allowed
        ? "LLM message generation disabled. Local fallback was used."
        : `${limit.reason === "session" ? "Session" : "Daily"} LLM limit reached. Local fallback was used.`,
      message: localNegotiationMessage(payload),
    });
  }

  try {
    const message = await openAiGenerateMessage(
      config.providers.openAiApiKey,
      config.providers.openAiModel,
      payload,
    );
    return NextResponse.json({ ok: true, fallback: false, provider: "openai", message });
  } catch (error) {
    console.warn("llm.message", safeError(error));
    return NextResponse.json({
      ok: true,
      fallback: true,
      provider: "mock",
      statusMessage: "Live message generation failed. Local fallback was used.",
      message: localNegotiationMessage(payload),
    });
  }
}
