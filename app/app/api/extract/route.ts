import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import {
  mockExtractListingFields,
  openAiExtractListingFields,
  openAiExtractListingFieldsFromImage,
} from "@/lib/server/providers";
import { clientKey, safeError } from "@/lib/server/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const config = loadServerConfig();
  const { text = "", imageDataUrl = "", imageMimeType = "", imageSizeBytes = 0 } = await request.json();
  const isScreenshotRequest = Boolean(imageDataUrl);

  if (isScreenshotRequest) {
    const type = String(imageMimeType || "");
    const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
    if (!allowedTypes.has(type)) {
      return NextResponse.json({
        ok: true,
        fallback: true,
        statusMessage: "Unsupported screenshot format. Please upload jpg, jpeg, png, or webp.",
      });
    }
    if (Number(imageSizeBytes) > 5 * 1024 * 1024) {
      return NextResponse.json({
        ok: true,
        fallback: true,
        statusMessage: "Screenshot file is too large. Please upload an image under 5 MB.",
      });
    }
  }

  if (!config.featureFlags.llmAnalysis || !config.providers.openAiApiKey) {
    const disabledMessage = isScreenshotRequest
      ? "AI screenshot extraction is currently disabled. Please enter the listing details manually."
      : "LLM extraction disabled. Local fallback was used.";
    console.info("llm.extract.fallback.disabled", {
      mode: isScreenshotRequest ? "screenshot" : "text",
      llmAnalysisEnabled: config.featureFlags.llmAnalysis,
      hasApiKey: Boolean(config.providers.openAiApiKey),
    });
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: disabledMessage,
      result: isScreenshotRequest ? null : mockExtractListingFields(text),
    });
  }

  const limit = checkUsageLimits("llm", clientKey(request), config.limits.llmDaily, config.limits.sessionLlm);
  if (!limit.allowed) {
    const limitMessage = limit.reason === "daily"
      ? "Daily AI extraction limit reached. You can use AI extraction up to 10 times per day. Please enter the listing details manually or try again tomorrow."
      : isScreenshotRequest
        ? "Session AI extraction limit reached. Please enter the listing details manually or start a new session."
        : "Session LLM limit reached. Local fallback was used.";
    console.info("llm.extract.fallback.limit", {
      mode: isScreenshotRequest ? "screenshot" : "text",
      reason: limit.reason,
      session: limit.session,
      daily: limit.daily,
    });
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: limitMessage,
      result: isScreenshotRequest ? null : mockExtractListingFields(text),
    });
  }

  try {
    const result = isScreenshotRequest
      ? await openAiExtractListingFieldsFromImage(
          imageDataUrl,
          config.providers.openAiApiKey,
          config.providers.openAiModel,
        )
      : await openAiExtractListingFields(
          text,
          config.providers.openAiApiKey,
          config.providers.openAiModel,
        );
    console.info("llm.extract.success", {
      mode: isScreenshotRequest ? "screenshot" : "text",
      provider: result?.provider || "unknown",
      confidence: (result as { confidence?: string })?.confidence || "n/a",
    });
    return NextResponse.json({ ok: true, fallback: false, result });
  } catch (error) {
    console.warn("llm.extract", safeError(error));
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: isScreenshotRequest
        ? "AI extraction could not read enough listing details. Please enter the details manually."
        : "Live extraction failed. Local fallback was used.",
      result: isScreenshotRequest ? null : mockExtractListingFields(text),
    });
  }
}
