import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { db } from "@/lib/db";
export async function GET(request: NextRequest) { const user = await getRequestUser(request); if (!user) return apiError("Authentication required.", 401); const books = await db.book.findMany({ where: user.role === "ADMIN" ? {} : { authorId: user.id }, orderBy: { title: "asc" } }); return NextResponse.json({ books: books.map((book) => ({ ...book, availableOn: JSON.parse(book.availableOn) })) }); }
