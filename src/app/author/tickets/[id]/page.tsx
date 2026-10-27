import { notFound } from "next/navigation";
import { TicketDetail } from "@/features/author/components/ticket-detail";
import { getCurrentUser } from "@/lib/auth";
import { getTicketForUser } from "@/lib/tickets";
export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) return null;
  const ticket = await getTicketForUser(id, user);
  if (!ticket) notFound();
  return <TicketDetail id={id} initialTicket={ticket} />;
}
