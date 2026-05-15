import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = loadServerConfig();
  const emailConfigured = Boolean(
    config.providers.resendApiKey &&
      config.providers.resendApiKey.startsWith("re_") &&
      config.providers.reportEmailFrom,
  );
  return NextResponse.json({
    ok: true,
    featureFlags: config.featureFlags,
    providers: {
      llm: config.featureFlags.llmAnalysis && config.providers.openAiApiKey ? "openai" : "mock",
      search: "fallback",
      email: config.featureFlags.emailReport ? (emailConfigured ? "resend" : "configuration_error") : "mock",
      crm: config.featureFlags.crmSync ? config.providers.crmProvider : "disabled",
      logging: "mock",
    },
    limits: config.limits,
  });
}
