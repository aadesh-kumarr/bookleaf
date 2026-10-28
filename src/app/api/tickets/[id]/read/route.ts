import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { markTicketMessagesRead } from "@/lib/notifications";
import { notificationsUpdatedEvent, ticketReadEvent } from "@/lib/realtime";

/** Marks caller-visible incoming messages as read and refreshes notifications. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;

  const { id } = await context.params;
  const result = await markTicketMessagesRead(id, authorization.user);
  if (result.count > 0) {
    await Promise.all([
      notificationsUpdatedEvent(authorization.user),
      ticketReadEvent(id, authorization.user),
    ]);
  }
  return NextResponse.json({ ok: true });
}
