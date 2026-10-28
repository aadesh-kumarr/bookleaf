import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
/** Clears the caller's session cookie without exposing token contents. */
export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
