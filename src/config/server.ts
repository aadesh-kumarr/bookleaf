import "server-only";

/** Centralizes server-only authentication and AI runtime configuration. */
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
    reasoningEffort: "none" as const,
    classificationMaxTokens: 120,
    responseMaxTokens: 200,
    logUsage: process.env.AI_USAGE_LOGGING !== "false",
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },
} as const;
