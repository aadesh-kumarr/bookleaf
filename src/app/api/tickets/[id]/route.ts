import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { categories, priorities, statuses } from "@/lib/constants";
import { apiError } from "@/lib/api";
import { authorizeRequest } from "@/lib/authorization";
import { db } from "@/lib/db";
import { getTicketForUser } from "@/lib/tickets";
import { ticketUpdatedEvent } from "@/lib/realtime";

const updateSchema = z.object({
  category: z.enum(categories).optional(),
  priority: z.enum(priorities).optional(),
  status: z.enum(statuses).optional(),
  assignToMe: z.boolean().optional(),
});
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;

  const { id } = await context.params;
  const ticket = await getTicketForUser(id, authorization.user);
  return ticket
    ? NextResponse.json({ ticket })
    : apiError("Ticket not found.", 404);
}
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeRequest(request, "ADMIN");
  if (!authorization.ok) return authorization.response;
  const { user } = authorization;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError("Invalid update.", 422, parsed.error.flatten());
  const { id } = await context.params;
  const exists = await db.ticket.findUnique({ where: { id } });
  if (!exists) return apiError("Ticket not found.", 404);

  const hasTicketAction = Boolean(
    parsed.data.category || parsed.data.priority || parsed.data.status,
  );
  if (hasTicketAction && exists.assignedToId !== user.id) {
    return apiError(
      "Assign this ticket to yourself before taking action.",
      409,
    );
  }

  const ticket = await db.ticket.update({
    where: { id },
    data: {
      category: parsed.data.category,
      priority: parsed.data.priority,
      status: parsed.data.status,
      assignedToId: parsed.data.assignToMe ? user.id : undefined,
      resolvedAt:
        parsed.data.status === "RESOLVED"
          ? new Date()
          : parsed.data.status
            ? null
            : undefined,
    },
  });
  await ticketUpdatedEvent(ticket.id, exists.authorId);
  return NextResponse.json({ ticket });
}
