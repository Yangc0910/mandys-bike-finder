import { NextResponse } from "next/server";

import {
  localBikeCoachResponse,
  normalizeBikeCoachIntent,
  suggestedBikeCoachPrompts,
  type BikeCoachContext,
} from "@/lib/assistant";
import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { openAiBikeCoachResponse } from "@/lib/server/providers";
import { clientKey, safeError } from "@/lib/server/utils";

export const dynamic = "force-dynamic";

type AssistantPayload = {
  intent?: string;
  message?: string;
  context?: BikeCoachContext;
};

export async function POST(request: Request) {
  const config = loadServerConfig();
  const key = clientKey(request);
  const payload = (await request.json()) as AssistantPayload;
  const intent = normalizeBikeCoachIntent(payload.intent || payload.message || "next_step");
  const message = String(payload.message || "").slice(0, 600);
  const context = compactContext(payload.context || {});
  const missingInputs = context.missingInputs || [];
  const prompts = suggestedBikeCoachPrompts(Boolean(context.analysis), missingInputs);
  const limit = checkUsageLimits(
    "guided-assistant",
    key,
    config.limits.guidedAssistantDaily,
    config.limits.guidedAssistantSession,
  );

  if (!limit.allowed || !config.featureFlags.llmAnalysis || !config.providers.openAiApiKey) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      provider: "local",
      intent,
      message: localBikeCoachResponse(intent, context, message),
      statusMessage: limit.allowed
        ? "Guided assistant is using basic local guidance."
        : "I can still help with basic guidance, but detailed AI explanations are temporarily limited.",
      suggestedPrompts: prompts,
      nextAction: nextAction(intent, missingInputs, Boolean(context.analysis)),
    });
  }

  try {
    const assistantMessage = await openAiBikeCoachResponse(config.providers.openAiApiKey, config.providers.openAiModel, {
      intent,
      message,
      context,
    });
    return NextResponse.json({
      ok: true,
      fallback: false,
      provider: "openai",
      intent,
      message: assistantMessage || localBikeCoachResponse(intent, context, message),
      suggestedPrompts: prompts,
      nextAction: nextAction(intent, missingInputs, Boolean(context.analysis)),
    });
  } catch (error) {
    console.warn("llm.assistant", safeError(error));
    return NextResponse.json({
      ok: true,
      fallback: true,
      provider: "local",
      intent,
      message: localBikeCoachResponse(intent, context, message),
      statusMessage: "I can explain the workflow, but detailed AI explanation is not available right now.",
      suggestedPrompts: prompts,
      nextAction: nextAction(intent, missingInputs, Boolean(context.analysis)),
    });
  }
}

function compactContext(context: BikeCoachContext): BikeCoachContext {
  return {
    child: context.child,
    listing: context.listing,
    analysis: context.analysis || null,
    sellerMessage: String(context.sellerMessage || "").slice(0, 800),
    missingInputs: Array.isArray(context.missingInputs) ? context.missingInputs.map((item) => String(item).slice(0, 80)) : [],
  };
}

function nextAction(intent: string, missingInputs: string[], hasAnalysis: boolean) {
  if (missingInputs.length) return `Add ${missingInputs[0]}`;
  if (!hasAnalysis) return "Run Check this bike";
  if (intent === "draft_seller_message" || intent === "suggest_seller_questions") return "Contact the seller if the bike still looks promising";
  return "Review seller questions";
}
