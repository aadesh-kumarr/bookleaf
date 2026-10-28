"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/constants";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { requestJson } from "@/lib/api-client";

type AuthorTicket = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  updatedAt: string | Date;
  book?: { title: string } | null;
  messages: {
    readAt: string | Date | null;
    isInternal: boolean;
    sender: { role: string };
  }[];
};
/** Displays searchable author tickets and refreshes them after realtime events. */
export function AuthorTickets({
  initialTickets,
}: {
  initialTickets: AuthorTicket[];
}) {
  const [tickets, setTickets] = useState<AuthorTicket[]>(initialTickets);
  const [query, setQuery] = useState("");
  useRealtimeEvents((event) => {
    if (event.type !== "realtime.connected" && event.type !== "ticket.updated") {
      return;
    }
    void requestJson<{ tickets: AuthorTicket[] }>("/api/tickets", {
      cache: "no-store",
    })
      .then((result) => setTickets(result.tickets))
      .catch(() => undefined);
  });
  const visible = tickets.filter((t) =>
    `${t.subject} ${t.reference} ${t.book?.title ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">
            Support history
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            My tickets
          </h1>
          <p className="mt-3 text-text-muted">
            New team responses appear automatically in real time.
          </p>
        </div>
        <Link
          href="/author/tickets/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-on-brand"
        >
          <Plus size={18} />
          Raise a query
        </Link>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-4 shadow-card-sm sm:p-6">
        <label className="flex max-w-md items-center gap-3 rounded-xl border border-border-input px-4 py-3">
          <Search size={18} className="text-text-placeholder" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="mt-5 space-y-3">
          {visible.length ? (
            visible.map((t) => {
              const unread = t.messages.filter(
                (message) =>
                  message.readAt === null &&
                  !message.isInternal &&
                  message.sender.role === "ADMIN",
              ).length;
              return (
                <Link
                  key={t.id}
                  href={`/author/tickets/${t.id}`}
                  className="grid gap-4 rounded-xl border border-border-soft p-4 transition hover:border-border-brand hover:bg-page sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{t.subject}</p>
                      {unread > 0 && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-on-brand">
                          {unread} new
                        </span>
                      )}
                      <StatusBadge value={t.status} />
                      <StatusBadge value={t.priority} />
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-text-muted">
                      {t.description}
                    </p>
                    <p className="mt-2 text-xs text-text-caption">
                      {t.reference} ·{" "}
                      {t.book?.title ?? "General / Account level"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-text-caption">
                      Updated {formatDate(t.updatedAt)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-brand-hover">
                      {t.messages.length} responses
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <EmptyState
              title="No matching tickets"
              text="Try another search, or raise a new query for the Author Care team."
            />
          )}
        </div>
      </div>
    </>
  );
}
