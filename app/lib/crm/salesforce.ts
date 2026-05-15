import "server-only";

import type { CrmLeadInput, CrmSyncResult } from "@/lib/crm/types";

type SalesforceTokenResponse = {
  access_token?: string;
  instance_url?: string;
  error?: string;
  error_description?: string;
};

type SalesforceCreateResponse = {
  id?: string;
  success?: boolean;
  errors?: unknown[];
};

export async function syncSalesforceLead(lead: CrmLeadInput, env = process.env): Promise<CrmSyncResult> {
  const configError = salesforceConfigurationError(env);
  if (configError) {
    return { ok: false, status: "failed", provider: "salesforce", message: configError };
  }

  const token = await getSalesforceAccessToken(env);
  if (!token.access_token || !token.instance_url) {
    return {
      ok: false,
      status: "failed",
      provider: "salesforce",
      message: token.error_description || token.error || "Salesforce authentication failed.",
    };
  }

  const apiVersion = sanitizeApiVersion(env.SALESFORCE_API_VERSION || "60.0");
  const response = await fetch(`${token.instance_url}/services/data/v${apiVersion}/sobjects/Lead`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token.access_token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(buildSalesforceLeadPayload(lead, env)),
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json().catch(() => null)) as SalesforceCreateResponse | SalesforceCreateResponse[] | null;
  if (!response.ok) {
    console.error("crm.salesforce.lead_create_failed", { status: response.status, data });
    return {
      ok: false,
      status: "failed",
      provider: "salesforce",
      message: "Salesforce lead creation failed.",
    };
  }

  const created = Array.isArray(data) ? data[0] : data;
  console.info("crm.salesforce.lead_created", { id: created?.id, email: lead.email });
  return {
    ok: true,
    status: "synced",
    provider: "salesforce",
    externalId: created?.id,
    message: "Lead synced to Salesforce.",
  };
}

function salesforceConfigurationError(env: NodeJS.ProcessEnv) {
  const required = [
    "SALESFORCE_CLIENT_ID",
    "SALESFORCE_CLIENT_SECRET",
    "SALESFORCE_USERNAME",
    "SALESFORCE_PASSWORD",
    "SALESFORCE_SECURITY_TOKEN",
  ];
  const missing = required.filter((key) => !String(env[key] || "").trim());
  if (missing.length) return `Salesforce CRM is not configured: missing ${missing.join(", ")}.`;

  const loginUrl = String(env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com").trim();
  try {
    const url = new URL(loginUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "Salesforce login URL must be http or https.";
  } catch {
    return "Salesforce login URL is invalid.";
  }

  return "";
}

async function getSalesforceAccessToken(env: NodeJS.ProcessEnv): Promise<SalesforceTokenResponse> {
  const loginUrl = String(env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com").trim().replace(/\/$/, "");
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: String(env.SALESFORCE_CLIENT_ID || ""),
    client_secret: String(env.SALESFORCE_CLIENT_SECRET || ""),
    username: String(env.SALESFORCE_USERNAME || ""),
    password: `${String(env.SALESFORCE_PASSWORD || "")}${String(env.SALESFORCE_SECURITY_TOKEN || "")}`,
  });

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json().catch(() => null)) as SalesforceTokenResponse | null;
  if (!response.ok) {
    console.error("crm.salesforce.auth_failed", { status: response.status, error: data?.error });
  }
  return data || { error: "salesforce_auth_failed" };
}

function buildSalesforceLeadPayload(lead: CrmLeadInput, env: NodeJS.ProcessEnv) {
  const name = splitName(lead.recipientName, lead.email);
  return {
    FirstName: name.firstName,
    LastName: name.lastName,
    Company: "Individual Parent",
    Email: lead.email,
    LeadSource: lead.leadSource || "Mandy's Bike Finder",
    Description: buildLeadDescription(lead, env),
  };
}

function splitName(recipientName: string | undefined, email: string) {
  const cleanName = String(recipientName || "").replace(/\s+/g, " ").trim();
  if (cleanName) {
    const parts = cleanName.split(" ");
    return {
      firstName: parts.length > 1 ? parts.slice(0, -1).join(" ") : "",
      lastName: parts.at(-1) || cleanName,
    };
  }

  const fallback = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Bike Finder Lead";
  return { firstName: "", lastName: fallback || "Bike Finder Lead" };
}

function buildLeadDescription(lead: CrmLeadInput, env: NodeJS.ProcessEnv) {
  const rows = [
    ["Product interest", lead.productInterest || "Bike Scout"],
    ["Marketing consent", lead.marketingConsent ? "Yes" : "No"],
    ["Child age", lead.childAge],
    ["Child height", lead.childHeight],
    ["Bike type", lead.bikeType],
    ["Asking price", lead.askingPrice],
    ["Location", lead.location],
    ["Distance", lead.distance],
    ["Deal score", lead.dealScore],
    ["Recommendation", lead.recommendation],
    ["Report ID", lead.reportId],
    ["Report created at", lead.reportCreatedAt],
    ["App URL", lead.appBaseUrl || env.APP_BASE_URL],
  ];

  return rows
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n")
    .slice(0, 32000);
}

function sanitizeApiVersion(value: string) {
  return /^\d{2,3}\.\d$/.test(value) ? value : "60.0";
}
