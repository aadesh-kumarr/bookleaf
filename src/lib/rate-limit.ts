import "server-only";

import { checkRateLimit } from "@vercel/firewall";
import { NextResponse } from "next/server";

type RateLimitId = "auth-login" | "ai-draft" | "ticket-create";

/** Applies fail-closed Vercel Firewall limits to costly or sensitive mutations. */
export async function enforceRateLimit(
  request: Request,
  rateLimitId: RateLimitId,
  rateLimitKey?: string,
) {
  if (process.env.NODE_ENV !== "production") return null;

  try {
    const result = await checkRateLimit(rateLimitId, {
      request,
      rateLimitKey,
      timeout: 1_000,
    });

    if (result.error === "not-found") {
      console.error(`Vercel Firewall rate limit '${rateLimitId}' is not configured.`);
      return NextResponse.json(
        { error: { message: "This operation is temporarily unavailable." } },
        { status: 503, headers: { "Retry-After": "60" } },
      );
    }

    if (result.rateLimited) {
      return NextResponse.json(
        { error: { message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  } catch (error) {
    console.error(`Unable to check rate limit '${rateLimitId}'.`, error);
    return NextResponse.json(
      { error: { message: "This operation is temporarily unavailable." } },
      { status: 503, headers: { "Retry-After": "60" } },
    );
  }

  return null;
}
