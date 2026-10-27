import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { getUnreadMessageCount } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;

  const unreadCount = await getUnreadMessageCount(authorization.user);
  return NextResponse.json({ unreadCount });
}
