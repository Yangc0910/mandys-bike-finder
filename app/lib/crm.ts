import "server-only";

import { syncSalesforceLead } from "@/lib/crm/salesforce";
import type { CrmLeadInput, CrmSyncResult } from "@/lib/crm/types";

export async function syncLeadToCrm(lead: CrmLeadInput, env = process.env): Promise<CrmSyncResult> {
  if (!lead.marketingConsent) {
    return {
      ok: true,
      status: "skipped",
      provider: "none",
      message: "CRM sync skipped because marketing consent was not provided.",
    };
  }

  if (!booleanFromEnv(env.ENABLE_CRM_SYNC)) {
    return {
      ok: true,
      status: "skipped",
      provider: "none",
      message: "CRM sync is disabled.",
    };
  }

  const provider = String(env.CRM_PROVIDER || "salesforce").toLowerCase();
  if (provider !== "salesforce") {
    console.warn("crm.unsupported_provider", { provider });
    return {
      ok: false,
      status: "failed",
      provider: "salesforce",
      message: `Unsupported CRM provider: ${provider}.`,
    };
  }

  try {
    const result = await syncSalesforceLead(lead, env);
    if (!result.ok) console.warn("crm.sync_failed", { provider: result.provider, message: result.message });
    return result;
  } catch (error) {
    console.error("crm.sync_exception", error);
    return {
      ok: false,
      status: "failed",
      provider: "salesforce",
      message: "CRM sync failed.",
    };
  }
}

function booleanFromEnv(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}
