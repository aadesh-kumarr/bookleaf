/**
 * Browser-safe product settings.
 * Server configuration and environment variables live in config/server.ts.
 */
/** Exposes browser-safe product metadata without server secrets. */
export const appConfig = {
  product: {
    name: "BookLeaf Author Care",
    description:
      "Author support and communication portal for BookLeaf Publishing.",
  },
} as const;
