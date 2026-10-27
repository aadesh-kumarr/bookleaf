import "server-only";

export const serverConfig = {
  auth: {
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Host-bookleaf_session"
        : "bookleaf_session",
    sessionDays: 7,
    secureCookies: process.env.NODE_ENV === "production",
  },
  ai: {
    provider: "openai",
    classificationModel:
      process.env.OPENAI_CLASSIFICATION_MODEL || "gpt-5.4-nano",
    responseModel: process.env.OPENAI_RESPONSE_MODEL || "gpt-5.4-mini",
    reasoningEffort: "none" as const,
    classificationMaxTokens: 120,
    responseMaxTokens: 200,
    logUsage: process.env.AI_USAGE_LOGGING === "true",
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },
} as const;
