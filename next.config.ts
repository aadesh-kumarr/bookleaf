import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Authenticated portals are request-bound; opt out of static cache components.
  cacheComponents: false,
  partialPrefetching: false,
  serverExternalPackages: ["ioredis", "ws"],
};

export default nextConfig;
