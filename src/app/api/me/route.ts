import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;
  return NextResponse.json({ user: authorization.user });
}
