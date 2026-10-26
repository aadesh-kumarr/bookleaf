import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";
import { classifyTicket } from "@/lib/ai";

const createSchema = z.object({ bookId: z.string().nullable().optional(), subject: z.string().trim().min(5).max(140), description: z.string().trim().min(20).max(5000) });
function reference() { return `BL-${Date.now().toString(36).toUpperCase().slice(-6)}`; }

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return apiError("Authentication required.", 401);
  const tickets = await db.ticket.findMany({
    where: user.role === "ADMIN" ? {} : { authorId: user.id },
    include: {
      book: { select: { id: true, title: true } },
      author: { select: { name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      messages: {
        where: user.role === "ADMIN" ? {} : { isInternal: false },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true, role: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request); if (!user) return apiError("Authentication required.", 401); if (user.role !== "AUTHOR") return apiError("Only authors can create tickets.", 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return apiError("Please check the ticket details.", 422, parsed.error.flatten());
  if (parsed.data.bookId) { const book = await db.book.findFirst({ where: { id: parsed.data.bookId, authorId: user.id } }); if (!book) return apiError("Book not found for this account.", 404); }
  const analysis = await classifyTicket(parsed.data.subject, parsed.data.description);
  const ticket = await db.ticket.create({ data: { reference: reference(), authorId: user.id, bookId: parsed.data.bookId || null, subject: parsed.data.subject, description: parsed.data.description, category: analysis.category, aiCategory: analysis.category, priority: analysis.priority, aiPriority: analysis.priority, aiConfidence: analysis.confidence }, include: { book: true } });
  return NextResponse.json({ ticket, classificationSource: analysis.source }, { status: 201 });
}
