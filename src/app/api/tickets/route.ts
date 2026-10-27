import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { authorizeRequest } from "@/lib/authorization";
import { db } from "@/lib/db";
import { classifyTicket } from "@/lib/ai";
import { getTicketsForUser } from "@/lib/tickets";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ticketUpdatedEvent } from "@/lib/realtime";

const createSchema = z.object({
  bookId: z.string().nullable().optional(),
  subject: z.string().trim().min(5).max(140),
  description: z.string().trim().min(20).max(5000),
});
function reference() {
  return `BL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;

  const tickets = await getTicketsForUser(authorization.user);
  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, "AUTHOR");
  if (!authorization.ok) return authorization.response;
  const { user } = authorization;

  const rateLimitResponse = await enforceRateLimit(
    request,
    "ticket-create",
    user.id,
  );
  if (rateLimitResponse) return rateLimitResponse;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return apiError(
      "Please check the ticket details.",
      422,
      parsed.error.flatten(),
    );
  if (parsed.data.bookId) {
    const book = await db.book.findFirst({
      where: { id: parsed.data.bookId, authorId: user.id },
    });
    if (!book) return apiError("Book not found for this account.", 404);
  }
  const analysis = await classifyTicket(
    parsed.data.subject,
    parsed.data.description,
  );
  const ticket = await db.ticket.create({
    data: {
      reference: reference(),
      authorId: user.id,
      bookId: parsed.data.bookId || null,
      subject: parsed.data.subject,
      description: parsed.data.description,
      category: analysis.category,
      aiCategory: analysis.category,
      priority: analysis.priority,
      aiPriority: analysis.priority,
      aiConfidence: analysis.confidence,
    },
    include: { book: true },
  });
  await ticketUpdatedEvent(ticket.id, user.id);
  return NextResponse.json(
    { ticket, classificationSource: analysis.source },
    { status: 201 },
  );
}
