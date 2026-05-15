export function loadServerConfig(env = process.env) {
  const llmDaily = numberFromEnv(env.DAILY_LLM_LIMIT, 10);
  const sessionLlmRaw = numberFromEnv(env.PER_SESSION_LLM_LIMIT, 10);
  const sessionLlm = Math.max(sessionLlmRaw, Math.min(llmDaily, 10));

  return {
    featureFlags: {
      liveSearch: booleanFromEnv(env.ENABLE_LIVE_SEARCH),
      llmAnalysis: booleanFromEnv(env.ENABLE_LLM_ANALYSIS),
      emailReport: booleanFromEnv(env.ENABLE_EMAIL_REPORT),
      backendLogging: booleanFromEnv(env.ENABLE_BACKEND_LOGGING),
      crmSync: booleanFromEnv(env.ENABLE_CRM_SYNC),
    },
    limits: {
      searchDaily: numberFromEnv(env.DAILY_SEARCH_LIMIT, 25),
      llmDaily,
      emailDaily: numberFromEnv(env.DAILY_EMAIL_LIMIT, 10),
      searchCacheTtlHours: numberFromEnv(env.SEARCH_CACHE_TTL_HOURS, 24),
      sessionLlm,
      sessionSearch: numberFromEnv(env.PER_SESSION_SEARCH_LIMIT, 8),
      sessionEmail: numberFromEnv(env.PER_SESSION_EMAIL_LIMIT, 3),
    },
    providers: {
      openAiApiKey: env.OPENAI_API_KEY || "",
      openAiModel: env.OPENAI_MODEL || "gpt-5.4-mini",
      searchApiKey: env.SEARCH_API_KEY || "",
      searchApiUrl: env.SEARCH_API_URL || "",
      resendApiKey: env.RESEND_API_KEY || "",
      reportEmailFrom: env.REPORT_EMAIL_FROM || "",
      reportEmailReplyTo: env.REPORT_EMAIL_REPLY_TO || "",
      appBaseUrl: env.APP_BASE_URL || "",
      databaseUrl: env.DATABASE_URL || "",
      crmProvider: env.CRM_PROVIDER || "salesforce",
      salesforceAuthMode: env.SALESFORCE_AUTH_MODE || "web_to_lead",
      salesforceClientId: env.SALESFORCE_CLIENT_ID || "",
      salesforceUsername: env.SALESFORCE_USERNAME || "",
      salesforceLoginUrl: env.SALESFORCE_LOGIN_URL || "https://login.salesforce.com",
      salesforceApiVersion: env.SALESFORCE_API_VERSION || "60.0",
      salesforceWebToLeadUrl: env.SALESFORCE_WEB_TO_LEAD_URL || "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8",
    },
  };
}

function booleanFromEnv(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

function numberFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
