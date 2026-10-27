import { NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { db } from "@/lib/db";
export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) return authorization.response;
  const { user } = authorization;
  const books = await db.book.findMany({
    where: user.role === "ADMIN" ? {} : { authorId: user.id },
    orderBy: { title: "asc" },
  });
  return NextResponse.json({
    books: books.map((book) => ({
      ...book,
      availableOn: JSON.parse(book.availableOn),
    })),
  });
}
