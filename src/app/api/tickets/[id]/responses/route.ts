import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { authorizeRequest } from "@/lib/authorization";
import { db } from "@/lib/db";
import { markTicketMessagesRead } from "@/lib/notifications";
import {
  notificationsUpdatedEvent,
  publishRealtimeEvent,
  ticketUpdatedEvent,
} from "@/lib/realtime";

const schema = z.object({
  body: z.string().trim().min(2).max(8000),
  isInternal: z.boolean().default(false),
});
/** Adds an authorized public response or administrator-only internal note. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;
  const { user } = authorization;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Response cannot be empty.", 422);
  const { id } = await context.params;
  const ticket = await db.ticket.findFirst({
    where: { id, ...(user.role === "AUTHOR" ? { authorId: user.id } : {}) },
  });
  if (!ticket) return apiError("Ticket not found.", 404);
  if (user.role === "AUTHOR" && parsed.data.isInternal)
    return apiError("Internal notes are admin-only.", 403);
  if (user.role === "ADMIN" && ticket.assignedToId !== user.id) {
    return apiError(
      "Assign this ticket to yourself before taking action.",
      409,
    );
  }
  const { message, readCount } = await db.$transaction(async (transaction) => {
    const readResult = await markTicketMessagesRead(id, user, transaction);
    const createdMessage = await transaction.message.create({
      data: {
        ticketId: id,
        senderId: user.id,
        body: parsed.data.body,
        isInternal: parsed.data.isInternal,
        readAt: parsed.data.isInternal ? new Date() : null,
      },
    });
    await transaction.ticket.update({
      where: { id },
      data: {
        status:
          user.role === "ADMIN" && !parsed.data.isInternal
            ? "IN_PROGRESS"
            : ticket.status,
      },
    });
    return { message: createdMessage, readCount: readResult.count };
  });
  if (readCount > 0) await notificationsUpdatedEvent(user);
  if (parsed.data.isInternal) {
    await publishRealtimeEvent({
      audience: { roles: ["ADMIN"] },
      event: { type: "ticket.updated", ticketId: id },
    });
  } else {
    await ticketUpdatedEvent(id, ticket.authorId);
  }
  return NextResponse.json({ message }, { status: 201 });
}
