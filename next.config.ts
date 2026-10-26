import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Authenticated portals are request-bound; opt out of static cache components.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
