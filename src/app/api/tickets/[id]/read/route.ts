import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { markTicketMessagesRead } from "@/lib/notifications";
import { notificationsUpdatedEvent } from "@/lib/realtime";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;

  const { id } = await context.params;
  const result = await markTicketMessagesRead(id, authorization.user);
  if (result.count > 0) {
    await notificationsUpdatedEvent(authorization.user.id);
  }
  return NextResponse.json({ ok: true });
}
