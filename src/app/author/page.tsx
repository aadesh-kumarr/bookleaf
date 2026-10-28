import Link from "next/link";
import {
  BookOpen,
  ReceiptIndianRupee,
  MessageSquareText,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge as TicketBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/constants";

/** Loads the signed-in author's book, royalty, and ticket overview. */
export default async function AuthorDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [books, tickets] = await Promise.all([
    db.book.findMany({
      where: { authorId: user.id },
      orderBy: { publicationDate: "desc" },
    }),
    db.ticket.findMany({
      where: { authorId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);
  const pending = books.reduce((sum, book) => sum + book.royaltyPending, 0);
  const sold = books.reduce((sum, book) => sum + book.totalCopiesSold, 0);
  const active = tickets.filter(
    (ticket) => !["RESOLVED", "CLOSED"].includes(ticket.status),
  ).length;
  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">
            Good to see you, {user.name.split(" ")[0]}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            Your publishing snapshot
          </h1>
          <p className="mt-3 text-text-muted">
            Books, earnings, and support conversations in one calm place.
          </p>
        </div>
        <Link
          href="/author/tickets/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-on-brand shadow-brand"
        >
          Raise a query <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Books"
          value={String(books.length)}
          detail={`${books.filter((b) => b.status.includes("Published")).length} published & live`}
          icon={<BookOpen size={20} />}
        />
        <StatCard
          label="Copies sold"
          value={sold.toLocaleString("en-IN")}
          detail="Across all platforms"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Royalty pending"
          value={formatCurrency(pending)}
          detail="Subject to payout cycle"
          icon={<ReceiptIndianRupee size={20} />}
        />
        <StatCard
          label="Active tickets"
          value={String(active)}
          detail="Open or in progress"
          icon={<MessageSquareText size={20} />}
        />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-.025em]">
                Your books
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Latest titles and production stages
              </p>
            </div>
            <Link
              href="/author/books"
              className="text-sm font-semibold text-brand-hover"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-border-soft">
            {books.slice(0, 4).map((book) => (
              <div key={book.id} className="flex items-center gap-4 py-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft font-semibold text-brand-hover">
                  {book.title.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{book.title}</p>
                  <p className="mt-1 text-xs text-text-subtle">
                    {book.genre} · {book.id}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      book.status.includes("Published")
                        ? "resolved"
                        : "progress"
                    }
                  >
                    {book.status}
                  </Badge>
                  <p className="mt-1 text-xs text-text-subtle">
                    {book.totalCopiesSold} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-.025em]">
                Recent support
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Updates from Author Care
              </p>
            </div>
            <Link
              href="/author/tickets"
              className="text-sm font-semibold text-brand-hover"
            >
              All tickets
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {tickets.length ? (
              tickets.map((ticket) => (
                <Link
                  href={`/author/tickets/${ticket.id}`}
                  key={ticket.id}
                  className="block rounded-xl border border-border-soft p-4 transition hover:border-border-brand"
                >
                  <div className="flex justify-between gap-3">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {ticket.subject}
                    </p>
                    <TicketBadge value={ticket.status} />
                  </div>
                  <p className="mt-2 text-xs text-text-subtle">
                    {ticket.reference} · Updated {formatDate(ticket.updatedAt)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyState
                title="No support tickets"
                text="When you need us, raise a query and the team will follow up here."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
