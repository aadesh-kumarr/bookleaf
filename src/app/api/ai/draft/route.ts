import { NextRequest } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";
import { streamDraftResponse } from "@/lib/ai";
const schema = z.object({ ticketId: z.string() });
export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return apiError("Authentication required.", 401);
  if (user.role !== "ADMIN") return apiError("Admin access required.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Ticket ID is required.", 422);
  const ticket = await db.ticket.findUnique({
    where: { id: parsed.data.ticketId },
    include: {
      author: true,
      book: true,
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        select: {
          body: true,
          createdAt: true,
          sender: { select: { name: true, role: true } },
        },
      },
    },
  });
  if (!ticket) return apiError("Ticket not found.", 404);
  if (ticket.assignedToId !== user.id) {
    return apiError("Assign this ticket to yourself before taking action.", 409);
  }
  const stream = streamDraftResponse({
    category: ticket.category,
    subject: ticket.subject,
    description: ticket.description,
    authorName: ticket.author.name,
    book: ticket.book ? {
      title: ticket.book.title,
      status: ticket.book.status,
      royaltyPending: ticket.book.royaltyPending,
      lastRoyaltyPayoutDate: ticket.book.lastRoyaltyPayoutDate,
    } : null,
    conversation: ticket.messages,
  });
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) controller.enqueue(encoder.encode(chunk));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
