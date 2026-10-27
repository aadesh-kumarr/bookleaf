import { NewTicketForm } from "@/features/author/components/new-ticket-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewTicketPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const books = await db.book.findMany({
    where: { authorId: user.id },
    select: { id: true, title: true, status: true },
    orderBy: { title: "asc" },
  });
  return <NewTicketForm books={books} />;
}
