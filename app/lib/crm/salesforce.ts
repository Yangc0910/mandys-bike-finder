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
  const authMode = salesforceAuthMode(env);
  if (authMode === "web_to_lead") return syncSalesforceWebToLead(lead, env);
  return syncSalesforceRestLead(lead, env);
}

async function syncSalesforceRestLead(lead: CrmLeadInput, env = process.env): Promise<CrmSyncResult> {
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

async function syncSalesforceWebToLead(lead: CrmLeadInput, env = process.env): Promise<CrmSyncResult> {
  const configError = salesforceWebToLeadConfigurationError(env);
  if (configError) {
    console.warn("crm.salesforce.web_to_lead_skipped", { message: configError });
    return { ok: true, status: "skipped", provider: "salesforce", message: configError };
  }

  const endpoint = String(env.SALESFORCE_WEB_TO_LEAD_URL || "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8").trim();
  const endpointUrl = safeParseUrl(endpoint);
  console.info("crm.salesforce.web_to_lead_request", {
    mode: "web_to_lead",
    endpointHost: endpointUrl?.host || "invalid",
    endpointPath: endpointUrl?.pathname || "invalid",
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: buildSalesforceWebToLeadPayload(lead, env),
    signal: AbortSignal.timeout(10_000),
  });
  const responseBody = truncateSafeResponseText(await response.text().catch(() => ""));
  const finalUrl = safeParseUrl(response.url || "");
  console.info("crm.salesforce.web_to_lead_response", {
    status: response.status,
    redirected: response.redirected,
    finalUrlHost: finalUrl?.host || "",
    finalUrlPath: finalUrl?.pathname || "",
    responseSnippet: responseBody,
  });

  if (!response.ok) {
    console.error("crm.salesforce.web_to_lead_failed", {
      status: response.status,
      redirected: response.redirected,
      finalUrlHost: finalUrl?.host || "",
      finalUrlPath: finalUrl?.pathname || "",
    });
    return {
      ok: false,
      status: "failed",
      provider: "salesforce",
      message: "Salesforce Web-to-Lead submission failed.",
    };
  }

  console.info("crm.salesforce.web_to_lead_submitted", { email: lead.email, status: response.status });
  return {
    ok: true,
    status: "synced",
    provider: "salesforce",
    message: "Lead submitted to Salesforce Web-to-Lead.",
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

function salesforceWebToLeadConfigurationError(env: NodeJS.ProcessEnv) {
  if (!String(env.SALESFORCE_WEB_TO_LEAD_OID || "").trim()) {
    return "Salesforce Web-to-Lead is not configured: missing SALESFORCE_WEB_TO_LEAD_OID.";
  }

  const webToLeadUrl = String(env.SALESFORCE_WEB_TO_LEAD_URL || "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8").trim();
  try {
    const url = new URL(webToLeadUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "Salesforce Web-to-Lead URL must be http or https.";
    }
  } catch {
    return "Salesforce Web-to-Lead URL is invalid.";
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

function buildSalesforceWebToLeadPayload(lead: CrmLeadInput, env: NodeJS.ProcessEnv) {
  const name = splitName(lead.recipientName, "Mandy Bike Finder User");
  const body = new URLSearchParams({
    encoding: "UTF-8",
    oid: String(env.SALESFORCE_WEB_TO_LEAD_OID || "").trim(),
    first_name: name.firstName,
    last_name: name.lastName,
    email: lead.email,
    company: "Mandy's Bike Finder",
    lead_source: lead.leadSource || "Mandy's Bike Finder",
    description: buildLeadDescription(lead, env),
  });
  return body;
}

function buildSalesforceLeadPayload(lead: CrmLeadInput, env: NodeJS.ProcessEnv) {
  const name = splitName(lead.recipientName, emailLocalPartName(lead.email));
  return {
    FirstName: name.firstName,
    LastName: name.lastName,
    Company: "Individual Parent",
    Email: lead.email,
    LeadSource: lead.leadSource || "Mandy's Bike Finder",
    Description: buildLeadDescription(lead, env),
  };
}

function splitName(recipientName: string | undefined, fallbackLastName: string) {
  const cleanName = String(recipientName || "").replace(/\s+/g, " ").trim();
  if (cleanName) {
    const parts = cleanName.split(" ");
    return {
      firstName: parts.length > 1 ? parts.slice(0, -1).join(" ") : "",
      lastName: parts.at(-1) || cleanName,
    };
  }

  return { firstName: "", lastName: fallbackLastName || "Mandy Bike Finder User" };
}

function buildLeadDescription(lead: CrmLeadInput, env: NodeJS.ProcessEnv) {
  const rows = [
    ["Product Interest", lead.productInterest || "Bike Scout"],
    ["Marketing Consent", lead.marketingConsent ? "true" : "false"],
    ["Email", lead.email],
    ["Recipient Name", lead.recipientName],
    ["Child Age", lead.childAge],
    ["Child Height", lead.childHeight],
    ["Bike Type", lead.bikeType],
    ["Asking Price", lead.askingPrice],
    ["Location", lead.location],
    ["Distance", lead.distance],
    ["Deal Score", lead.dealScore],
    ["Recommendation", lead.recommendation],
    ["Report ID", lead.reportId],
    ["Report Created At", lead.reportCreatedAt],
    ["App Base URL", lead.appBaseUrl || env.APP_BASE_URL],
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

function emailLocalPartName(email: string) {
  return email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Bike Finder Lead";
}

function salesforceAuthMode(env: NodeJS.ProcessEnv) {
  return String(env.SALESFORCE_AUTH_MODE || "web_to_lead").toLowerCase() === "rest" ? "rest" : "web_to_lead";
}

function safeParseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function truncateSafeResponseText(value: string) {
  if (!value) return "";
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .slice(0, 300);
}
