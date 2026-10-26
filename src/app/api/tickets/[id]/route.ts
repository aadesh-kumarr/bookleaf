import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { categories, priorities, statuses } from "@/lib/constants";
import { getRequestUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";

const updateSchema = z.object({ category: z.enum(categories).optional(), priority: z.enum(priorities).optional(), status: z.enum(statuses).optional(), assignToMe: z.boolean().optional() });
async function findTicket(id: string, user: { id: string; role: string }) {
  return db.ticket.findFirst({
    where: { id, ...(user.role === "AUTHOR" ? { authorId: user.id } : {}) },
    include: {
      book: true,
      author: { select: { id: true, name: true, email: true, phone: true, city: true } },
      assignedTo: { select: { id: true, name: true } },
      messages: {
        where: user.role === "AUTHOR" ? { isInternal: false } : {},
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, role: true } } },
      },
    },
  });
}
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) { const user = await getRequestUser(request); if (!user) return apiError("Authentication required.", 401); const { id } = await context.params; const ticket = await findTicket(id, user); return ticket ? NextResponse.json({ ticket }) : apiError("Ticket not found.", 404); }
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) return apiError("Authentication required.", 401);
  if (user.role !== "ADMIN") return apiError("Admin access required.", 403);
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid update.", 422, parsed.error.flatten());
  const { id } = await context.params;
  const exists = await db.ticket.findUnique({ where: { id } });
  if (!exists) return apiError("Ticket not found.", 404);

  const hasTicketAction = Boolean(parsed.data.category || parsed.data.priority || parsed.data.status);
  if (hasTicketAction && exists.assignedToId !== user.id) {
    return apiError("Assign this ticket to yourself before taking action.", 409);
  }

  const ticket = await db.ticket.update({
    where: { id },
    data: {
      category: parsed.data.category,
      priority: parsed.data.priority,
      status: parsed.data.status,
      assignedToId: parsed.data.assignToMe ? user.id : undefined,
      resolvedAt: parsed.data.status === "RESOLVED" ? new Date() : parsed.data.status ? null : undefined,
    },
  });
  return NextResponse.json({ ticket });
}
