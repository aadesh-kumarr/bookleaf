import { NextResponse } from "next/server";

/** Produces the consistent JSON error envelope returned by Route Handlers. */
export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { message, details } }, { status });
}
