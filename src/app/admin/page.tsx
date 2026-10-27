import { AdminDashboard } from "@/features/admin/components/dashboard";
import { getAdminTickets } from "@/lib/admin-tickets";
import { db } from "@/lib/db";
export default async function AdminPage() {
  const [tickets, userCount, bookCount, clock] = await Promise.all([
    getAdminTickets(),
    db.user.count(),
    db.book.count(),
    db.$queryRaw<Array<{ now: Date }>>`SELECT NOW() AS now`,
  ]);
  return (
    <AdminDashboard
      tickets={tickets}
      userCount={userCount}
      bookCount={bookCount}
      generatedAt={clock[0].now.getTime()}
    />
  );
}
