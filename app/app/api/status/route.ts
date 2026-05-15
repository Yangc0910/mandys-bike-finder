import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = loadServerConfig();
  const resendConfigured = Boolean(
    config.providers.resendApiKey &&
      config.providers.resendApiKey.startsWith("re_") &&
      config.providers.reportEmailFrom,
  );
  const crmProvider = config.featureFlags.crmSync ? String(config.providers.crmProvider || "").trim() : "";
  const salesforceAuthMode = String(config.providers.salesforceAuthMode || "web_to_lead").trim().toLowerCase() || "web_to_lead";
  const salesforceWebToLeadOidConfigured = Boolean(String(process.env.SALESFORCE_WEB_TO_LEAD_OID || "").trim());
  const salesforceWebToLeadUrlConfigured = Boolean(String(config.providers.salesforceWebToLeadUrl || "").trim());
  const appBaseUrlConfigured = Boolean(String(config.providers.appBaseUrl || "").trim());

  return NextResponse.json({
    ok: true,
    crmSyncEnabled: config.featureFlags.crmSync,
    crmProvider: crmProvider || "none",
    salesforceAuthMode,
    salesforceWebToLeadOidConfigured,
    salesforceWebToLeadUrlConfigured,
    emailReportEnabled: config.featureFlags.emailReport,
    resendConfigured,
    appBaseUrlConfigured,
  });
}
