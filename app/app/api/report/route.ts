import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { logEvent, openAiReportSummary, reportMetadata } from "@/lib/server/providers";
import { buildReport } from "@/lib/server/report";
import { clientKey, safeError } from "@/lib/server/utils";
import type { AnalysisResult, ChildProfile, Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type ReportPayload = {
  child: ChildProfile;
  listing: Listing;
  analysis: AnalysisResult;
  email: string;
  message?: string;
  recipientName?: string;
  note?: string;
};

export async function POST(request: Request) {
  const config = loadServerConfig();
  const payload = (await request.json()) as ReportPayload;
  const key = clientKey(request);
  const summary = await maybeReportSummary(config, key, payload);
  const report = buildReport({ ...payload, summary });

  try {
    await logEvent(
      config.featureFlags.backendLogging ? config.providers.databaseUrl : "",
      "report",
      reportMetadata(payload),
    );
  } catch (error) {
    console.warn("logging.report", safeError(error));
  }

  return NextResponse.json({ ok: true, report });
}

async function maybeReportSummary(
  config: ReturnType<typeof loadServerConfig>,
  key: string,
  payload: ReportPayload,
) {
  const limit = checkUsageLimits("llm", `${key}:report-summary`, config.limits.llmDaily, config.limits.sessionLlm);
  if (!limit.allowed || !config.featureFlags.llmAnalysis || !config.providers.openAiApiKey) return "";
  try {
    return await openAiReportSummary(config.providers.openAiApiKey, config.providers.openAiModel, payload);
  } catch (error) {
    console.warn("llm.reportSummary", safeError(error));
    return "";
  }
}
