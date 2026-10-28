import { notFound } from "next/navigation";
import { AdminTicketDetail } from "@/features/admin/components/ticket-detail";
import { getCurrentUser } from "@/lib/auth";
import { getTicketForUser } from "@/lib/tickets";
/** Loads an administrator-visible ticket or returns the App Router 404 state. */
export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) return null;
  const ticket = await getTicketForUser(id, user);
  if (!ticket) notFound();
  return (
    <AdminTicketDetail id={id} initialTicket={ticket} currentUserId={user.id} />
  );
}
