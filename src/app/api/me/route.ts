import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
/** Returns the minimal authenticated profile required by the client. */
export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;
  return NextResponse.json({ user: authorization.user });
}
