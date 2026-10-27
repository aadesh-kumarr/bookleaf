import { AuthorTickets } from "@/features/author/components/tickets-list";
import { getCurrentUser } from "@/lib/auth";
import { getTicketsForUser } from "@/lib/tickets";
export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const tickets = await getTicketsForUser(user);
  return <AuthorTickets initialTickets={tickets} />;
}
