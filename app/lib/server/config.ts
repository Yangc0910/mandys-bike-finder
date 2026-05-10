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
      emailApiKey: env.EMAIL_API_KEY || "",
      emailApiUrl: env.EMAIL_API_URL || "",
      emailFrom: env.EMAIL_FROM || "",
      databaseUrl: env.DATABASE_URL || "",
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
