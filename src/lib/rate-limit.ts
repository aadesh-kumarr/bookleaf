import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

type RateLimitId = "auth-login" | "ai-draft" | "ticket-create";

const policies: Record<RateLimitId, { limit: number; windowSeconds: number }> = {
  "auth-login": { limit: 10, windowSeconds: 60 },
  "ai-draft": { limit: 10, windowSeconds: 60 },
  "ticket-create": { limit: 5, windowSeconds: 600 },
};

const fixedWindowScript = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
return { count, redis.call("TTL", KEYS[1]) }
`;

function requestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(address).digest("hex").slice(0, 32);
}

/** Applies fail-closed Redis limits to costly or sensitive mutations. */
export async function enforceRateLimit(
  request: Request,
  rateLimitId: RateLimitId,
  rateLimitKey?: string,
) {
  if (process.env.NODE_ENV !== "production") return null;

  const redis = getRedisClient();
  if (!redis) {
    console.error("Redis is required for production rate limiting.");
    return NextResponse.json(
      { error: { message: "This operation is temporarily unavailable." } },
      { status: 503, headers: { "Retry-After": "60" } },
    );
  }

  const policy = policies[rateLimitId];
  const subject = rateLimitKey ?? requestFingerprint(request);
  const key = `bookleaf:rate-limit:v1:${rateLimitId}:${subject}`;

  try {
    const [count, ttl] = (await redis.eval(
      fixedWindowScript,
      1,
      key,
      policy.windowSeconds,
    )) as [number, number];

    if (count > policy.limit) {
      const retryAfter = Math.max(ttl, 1);
      return NextResponse.json(
        { error: { message: "Too many requests. Please try again later." } },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }
  } catch (error) {
    console.error(`Unable to enforce rate limit '${rateLimitId}'.`, error);
    return NextResponse.json(
      { error: { message: "This operation is temporarily unavailable." } },
      { status: 503, headers: { "Retry-After": "60" } },
    );
  }

  return null;
}
