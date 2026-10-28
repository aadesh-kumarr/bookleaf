"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Clock3, Filter, Search, TicketCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  categories,
  labels,
  priorities,
  statuses,
  formatDate,
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { requestJson } from "@/lib/api-client";

type Ticket = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  aiCategory: string;
  aiPriority: string;
  aiConfidence: number | null;
  author: { name: string; email: string };
  book?: { id: string; title: string } | null;
  assignedTo?: { name: string } | null;
  _count: { messages: number };
};
const priorityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
/** Provides filterable, realtime operations triage across all support tickets. */
export function AdminQueue({
  initialTickets,
  initialStatus = "",
  initialPriority = "",
  initialCategory = "",
  initialDays = "",
  aiEnabled,
}: {
  initialTickets: Ticket[];
  initialStatus?: string;
  initialPriority?: string;
  initialCategory?: string;
  initialDays?: string;
  aiEnabled: boolean;
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [category, setCategory] = useState(initialCategory);
  const [days, setDays] = useState(initialDays);
  const isFirstLoad = useRef(true);

  const load = useCallback(
    async (showLoading = false, signal?: AbortSignal) => {
      if (showLoading) setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (priority) params.set("priority", priority);
        if (category) params.set("category", category);
        if (days) params.set("days", days);
        const result = await requestJson<{ tickets: Ticket[] }>(
          `/api/admin/tickets?${params}`,
          { cache: "no-store", signal },
        );
        setTickets(result.tickets);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [category, days, priority, status],
  );

  useEffect(() => {
    if (isFirstLoad.current) isFirstLoad.current = false;
    else void load(true);
  }, [load]);

  useRealtimeEvents((event) => {
    if (event.type === "realtime.connected" || event.type === "ticket.updated") {
      void load(false);
    }
  });
  const visible = useMemo(
    () =>
      tickets
        .filter((t) =>
          `${t.subject} ${t.reference} ${t.author.name} ${t.book?.title ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort(
          (a, b) =>
            priorityRank[a.priority as keyof typeof priorityRank] -
              priorityRank[b.priority as keyof typeof priorityRank] ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [tickets, query],
  );
  const unresolved = tickets.filter(
    (t) => !["RESOLVED", "CLOSED"].includes(t.status),
  ).length;
  const urgent = tickets.filter(
    (t) =>
      ["CRITICAL", "HIGH"].includes(t.priority) &&
      !["RESOLVED", "CLOSED"].includes(t.status),
  ).length;
  const unassigned = tickets.filter((t) => !t.assignedTo).length;
  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">
            Operations workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            Ticket queue
          </h1>
          <p className="mt-3 text-text-muted">
            AI-assisted triage, with every decision under human control.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-ink">
          <Bot size={17} />
          {aiEnabled ? "AI connected" : "Smart fallback active"}
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
                Unresolved
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-9 w-12" />
              ) : (
                <p className="mt-1 text-3xl font-semibold">{unresolved}</p>
              )}
            </div>
            <TicketCheck className="text-brand-strong" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
                High attention
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-9 w-12" />
              ) : (
                <p className="mt-1 text-3xl font-semibold">{urgent}</p>
              )}
            </div>
            <Clock3 className="text-warning-strong" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
                Unassigned
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-9 w-12" />
              ) : (
                <p className="mt-1 text-3xl font-semibold">{unassigned}</p>
              )}
            </div>
            <Filter className="text-text-muted" />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All support requests</CardTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_160px_180px_205px_150px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-text-placeholder" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search author, book, ticket…"
                className="pl-9"
              />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((v) => (
                <option key={v} value={v}>
                  {labels[v]}
                </option>
              ))}
            </Select>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All priorities</option>
              <option value="URGENT">Urgent (Critical + High)</option>
              {priorities.map((v) => (
                <option key={v} value={v}>
                  {labels[v]}
                </option>
              ))}
            </Select>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((v) => (
                <option key={v} value={v}>
                  {labels[v]}
                </option>
              ))}
            </Select>
            <Select value={days} onChange={(e) => setDays(e.target.value)}>
              <option value="">Any date</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TicketRowsSkeleton rows={5} />
          ) : (
            <div className="space-y-3">
              {visible.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
                  className="grid gap-4 rounded-xl border border-border-soft p-4 transition hover:border-border-brand hover:bg-page lg:grid-cols-[1fr_190px_145px] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={t.priority} />
                      <StatusBadge value={t.status} />
                      {t._count.messages > 0 && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-on-brand">
                          {t._count.messages} new
                        </span>
                      )}
                      <span className="text-xs font-semibold text-text-caption">
                        {t.reference}
                      </span>
                    </div>
                    <p className="mt-2 truncate font-semibold">{t.subject}</p>
                    <p className="mt-1 truncate text-sm text-text-muted">
                      {t.author.name} · {t.book?.title ?? "Account level"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-caption">
                      Classification
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {labels[t.category]}
                    </p>
                    <p className="mt-1 text-[11px] text-text-placeholder">
                      AI {Math.round((t.aiConfidence ?? 0.7) * 100)}% confidence
                    </p>
                  </div>
                  <div className="lg:text-right">
                    <p className="text-xs text-text-caption">
                      Opened {formatDate(t.createdAt)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-brand-hover">
                      {t.assignedTo?.name ?? "Unassigned"}
                    </p>
                  </div>
                </Link>
              ))}
              {visible.length === 0 && (
                <div className="py-14 text-center text-sm text-text-subtle">
                  No tickets match these filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
