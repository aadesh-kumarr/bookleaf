import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({ body: z.string().trim().min(2).max(8000), isInternal: z.boolean().default(false) });
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) return apiError("Authentication required.", 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Response cannot be empty.", 422);
  const { id } = await context.params;
  const ticket = await db.ticket.findFirst({
    where: { id, ...(user.role === "AUTHOR" ? { authorId: user.id } : {}) },
  });
  if (!ticket) return apiError("Ticket not found.", 404);
  if (user.role === "AUTHOR" && parsed.data.isInternal) return apiError("Internal notes are admin-only.", 403);
  if (user.role === "ADMIN" && ticket.assignedToId !== user.id) {
    return apiError("Assign this ticket to yourself before taking action.", 409);
  }
  const message = await db.message.create({
    data: { ticketId: id, senderId: user.id, body: parsed.data.body, isInternal: parsed.data.isInternal },
  });
  await db.ticket.update({
    where: { id },
    data: { status: user.role === "ADMIN" && !parsed.data.isInternal ? "IN_PROGRESS" : ticket.status },
  });
  return NextResponse.json({ message }, { status: 201 });
}
