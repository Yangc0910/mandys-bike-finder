import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { logEvent, openAiReportSummary, reportMetadata, sendEmailReport, simulatedEmailReport } from "@/lib/server/providers";
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
  const emailLimit = checkUsageLimits("email", key, config.limits.emailDaily, config.limits.sessionEmail);

  let emailResult;
  if (
    !emailLimit.allowed ||
    !config.featureFlags.emailReport ||
    !config.providers.emailApiKey ||
    !config.providers.emailApiUrl ||
    !config.providers.emailFrom
  ) {
    emailResult = simulatedEmailReport(
      payload.email,
      report,
      emailLimit.allowed
        ? "Email report disabled or missing server-side email configuration."
        : `${emailLimit.reason === "session" ? "Session" : "Daily"} email limit reached.`,
    );
  } else {
    try {
      emailResult = await sendEmailReport({
        apiKey: config.providers.emailApiKey,
        apiUrl: config.providers.emailApiUrl,
        from: config.providers.emailFrom,
        email: payload.email,
        subject: "Mandy's Bike Finder report",
        report,
      });
    } catch (error) {
      console.warn("email.send", safeError(error));
      emailResult = simulatedEmailReport(payload.email, report, "Email sending failed. Report preview was generated instead.");
    }
  }

  try {
    await logEvent(
      config.featureFlags.backendLogging ? config.providers.databaseUrl : "",
      "report",
      reportMetadata(payload),
    );
  } catch (error) {
    console.warn("logging.report", safeError(error));
  }

  return NextResponse.json({ ok: true, report, emailResult });
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
