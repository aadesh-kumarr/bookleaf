import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Inbox,
  TicketCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, labels } from "@/lib/constants";

type DashboardTicket = {
  id: string;
  reference: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: Date;
  assignedTo?: { name: string } | null;
  author: { name: string };
};

type Segment = { label: string; value: number; color: string };

function DonutChart({
  title,
  segments,
}: {
  title: string;
  segments: Segment[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += total ? (segment.value / total) * 100 : 0;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
          <div
            role="img"
            aria-label={`${title}: ${total} total tickets`}
            className="relative mx-auto size-44 rounded-full"
            style={{
              background: total
                ? `conic-gradient(${stops.join(",")})`
                : "var(--color-skeleton)",
            }}
          >
            <div className="absolute inset-8 grid place-items-center rounded-full bg-surface text-center shadow-inset">
              <div>
                <p className="text-3xl font-semibold">{total}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-caption">
                  Tickets
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="truncate text-text-body">
                    {segment.label}
                  </span>
                </span>
                <span className="font-semibold">
                  {segment.value}{" "}
                  <span className="font-normal text-text-placeholder">
                    · {total ? Math.round((segment.value / total) * 100) : 0}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard({
  tickets,
  userCount,
  bookCount,
  generatedAt,
}: {
  tickets: DashboardTicket[];
  userCount: number;
  bookCount: number;
  generatedAt: number;
}) {
  const unresolved = tickets.filter(
    (ticket) => !["RESOLVED", "CLOSED"].includes(ticket.status),
  );
  const urgent = unresolved.filter((ticket) =>
    ["CRITICAL", "HIGH"].includes(ticket.priority),
  );
  const unassigned = unresolved.filter((ticket) => !ticket.assignedTo);
  const resolved = tickets.filter((ticket) =>
    ["RESOLVED", "CLOSED"].includes(ticket.status),
  ).length;
  const resolutionRate = tickets.length
    ? Math.round((resolved / tickets.length) * 100)
    : 0;
  const averageAge = unresolved.length
    ? Math.round(
        unresolved.reduce(
          (sum, ticket) =>
            sum +
            (generatedAt - new Date(ticket.createdAt).getTime()) / 86400000,
          0,
        ) / unresolved.length,
      )
    : 0;
  const priorityColors: Record<string, string> = {
    CRITICAL: "var(--color-danger-strong)",
    HIGH: "var(--color-warning-strong)",
    MEDIUM: "var(--color-caution-strong)",
    LOW: "var(--color-chart-low)",
  };
  const categoryColors = [
    "var(--color-brand)",
    "var(--color-chart-violet)",
    "var(--color-note)",
    "var(--color-chart-sky)",
    "var(--color-success-strong)",
    "var(--color-neutral-status-strong)",
  ];
  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((priority) => ({
    label: labels[priority],
    value: tickets.filter((ticket) => ticket.priority === priority).length,
    color: priorityColors[priority],
  }));
  const categories = [
    "ROYALTY_PAYMENTS",
    "ISBN_METADATA",
    "PRINTING_QUALITY",
    "DISTRIBUTION_AVAILABILITY",
    "BOOK_STATUS_PRODUCTION",
    "GENERAL_INQUIRY",
  ].map((category, index) => ({
    label: labels[category],
    value: tickets.filter((ticket) => ticket.category === category).length,
    color: categoryColors[index],
  }));
  const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
    (status) => ({
      label: labels[status],
      value: tickets.filter((ticket) => ticket.status === status).length,
    }),
  );
  const maxStatus = Math.max(1, ...statuses.map((status) => status.value));
  const today = new Date(generatedAt);
  const inflow = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - offset));
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(
        date,
      ),
      value: tickets.filter((ticket) => {
        const created = new Date(ticket.createdAt);
        return created >= date && created < next;
      }).length,
    };
  });
  const maxInflow = Math.max(1, ...inflow.map((day) => day.value));
  const watchlist = [...urgent]
    .sort(
      (a, b) =>
        priorityRank(a.priority) - priorityRank(b.priority) ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-strong">
            Operations overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            Support dashboard
          </h1>
          <p className="mt-3 text-text-muted">
            Workload, risk, and queue health at a glance.
          </p>
        </div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-on-brand shadow-brand"
        >
          Open ticket queue
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Unresolved"
          value={unresolved.length}
          detail={`${urgent.length} need high attention`}
          icon={<TicketCheck size={20} />}
          href="/admin/tickets"
        />
        <Metric
          label="Unassigned"
          value={unassigned.length}
          detail="Awaiting an owner"
          icon={<Inbox size={20} />}
          href="/admin/tickets"
        />
        <Metric
          label="Resolution rate"
          value={`${resolutionRate}%`}
          detail={`${resolved} completed tickets`}
          icon={<AlertTriangle size={20} />}
        />
        <Metric
          label="Average open age"
          value={`${averageAge}d`}
          detail={`${userCount} users · ${bookCount} books`}
          icon={<Clock3 size={20} />}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DonutChart title="Tickets by priority" segments={priorities} />
        <DonutChart title="Tickets by category" segments={categories} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {statuses.map((status) => (
              <div key={status.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-text-body">
                    {status.label}
                  </span>
                  <span className="font-semibold">{status.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-progress-track">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-active"
                    style={{ width: `${(status.value / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket inflow · last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3 rounded-xl bg-surface-soft px-4 pb-3 pt-8">
              {inflow.map((day) => (
                <div
                  key={day.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold text-text-body">
                    {day.value}
                  </span>
                  <div
                    className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-brand-active to-brand-light transition-all"
                    style={{
                      height: `${Math.max(day.value ? 12 : 2, (day.value / maxInflow) * 100)}%`,
                    }}
                  />
                  <span className="text-[10px] font-semibold uppercase text-text-caption">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Priority watchlist</CardTitle>
              <p className="mt-1 text-sm text-text-muted">
                Oldest unresolved critical and high-priority tickets.
              </p>
            </div>
            <Link
              href="/admin/tickets"
              className="text-sm font-semibold text-brand-hover"
            >
              View queue
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {watchlist.length ? (
            watchlist.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="grid gap-3 rounded-xl border border-border-soft p-4 transition hover:border-border-brand hover:bg-page sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <StatusBadge value={ticket.priority} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-text-subtle">
                    {ticket.reference} · {ticket.author.name} ·{" "}
                    {ticket.assignedTo?.name ?? "Unassigned"}
                  </p>
                </div>
                <p className="text-xs text-text-subtle">
                  Opened {formatDate(ticket.createdAt)}
                </p>
              </Link>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-text-subtle">
              No urgent unresolved tickets.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function priorityRank(priority: string) {
  return priority === "CRITICAL"
    ? 0
    : priority === "HIGH"
      ? 1
      : priority === "MEDIUM"
        ? 2
        : 3;
}

function Metric({
  label,
  value,
  detail,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <Card className="h-full transition hover:border-border-brand">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-text-muted">{detail}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-strong">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
