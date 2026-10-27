import { AdminQueue } from "@/features/admin/components/ticket-queue";
import { getAdminTickets } from "@/lib/admin-tickets";
import { serverConfig } from "@/config/server";

export default async function TicketQueuePage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    category?: string;
    days?: string;
  }>;
}) {
  const filters = await searchParams;
  const initialTickets = await getAdminTickets(filters);
  const key = `${filters.status ?? ""}-${filters.priority ?? ""}-${filters.category ?? ""}-${filters.days ?? ""}`;
  return (
    <AdminQueue
      key={key}
      initialTickets={initialTickets}
      initialStatus={filters.status}
      initialPriority={filters.priority}
      initialCategory={filters.category}
      initialDays={filters.days}
      aiEnabled={serverConfig.ai.enabled}
    />
  );
}
