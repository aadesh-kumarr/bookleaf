/**
 * Single source of truth for product, runtime, AI, auth, UI, and theme settings.
 * Secrets remain in environment variables; this file only reads their names.
 */
export const appConfig = {
  product: {
    name: "BookLeaf Author Care",
    shortName: "Author Care",
    description: "Author support and communication portal for BookLeaf Publishing.",
    locale: "en-IN",
    currency: "INR",
  },
  auth: {
    cookieName: "bookleaf_session",
    sessionDays: 7,
    secureCookies: process.env.AUTH_COOKIE_SECURE === "true",
    demo: {
      author: { email: "priya.sharma@email.com", password: "bookleaf123" },
      admin: { email: "admin@bookleaf.test", password: "admin123" },
    },
  },
  ai: {
    provider: "openai",
    classificationModel: process.env.OPENAI_CLASSIFICATION_MODEL || "gpt-5.4-nano",
    responseModel: process.env.OPENAI_RESPONSE_MODEL || "gpt-5.4-mini",
    reasoningEffort: "none" as const,
    classificationMaxTokens: 120,
    responseMaxTokens: 200,
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },
  realtime: {
    strategy: "polling",
    intervalMs: 5_000,
  },
  features: {
    attachments: false,
    aiClassification: true,
    aiDrafts: true,
    internalNotes: true,
  },
  theme: {
    colors: {
      primary: "#f15d6f",
      primaryDark: "#d9465a",
      blush: "#fff0ed",
      peach: "#ffe1da",
      ink: "#252429",
      muted: "#746f75",
      line: "#eadfdf",
      paper: "#fffdfc",
    },
    radius: "0.75rem",
  },
} as const;

export type AppConfig = typeof appConfig;
