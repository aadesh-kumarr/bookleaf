"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/constants";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { getErrorMessage, requestJson } from "@/lib/api-client";
import { toast } from "sonner";
type AuthorTicketDetail = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string | Date;
  book?: { title: string } | null;
  messages: {
    id: string;
    body: string;
    createdAt: string | Date;
    sender: { name: string; role: string };
  }[];
};
export function TicketDetail({
  id,
  initialTicket,
}: {
  id: string;
  initialTicket: AuthorTicketDetail;
}) {
  const [ticket, setTicket] = useState<AuthorTicketDetail>(initialTicket);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const latestMessageId = useRef(initialTicket.messages.at(-1)?.id);
  async function markRead(signal?: AbortSignal) {
    await fetch(`/api/tickets/${id}/read`, { method: "POST", signal });
  }
  async function load(signal?: AbortSignal) {
    const result = await requestJson<{ ticket: AuthorTicketDetail }>(
      `/api/tickets/${id}`,
      { cache: "no-store", signal },
    );
    const nextTicket = result.ticket;
    const nextMessageId = nextTicket.messages.at(-1)?.id;
    setTicket(nextTicket);
    if (nextMessageId && nextMessageId !== latestMessageId.current) {
      latestMessageId.current = nextMessageId;
      await markRead(signal);
    }
  }
  useEffect(() => {
    void fetch(`/api/tickets/${id}/read`, { method: "POST" });
  }, [id]);
  useRealtimeEvents((event) => {
    if (
      event.type === "realtime.connected" ||
      (event.type === "ticket.updated" && event.ticketId === id)
    ) {
      void load();
    }
  });
  async function reply(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await requestJson(`/api/tickets/${id}/responses`, {
        method: "POST",
        json: { body, isInternal: false },
      });
      setBody("");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send your reply"));
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <Link
        href="/author/tickets"
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted"
      >
        <ArrowLeft size={17} />
        Back to tickets
      </Link>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section>
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={ticket.status} />
              <StatusBadge value={ticket.priority} />
              <span className="text-xs text-text-caption">{ticket.reference}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">
              {ticket.subject}
            </h1>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-text-body">
              {ticket.description}
            </p>
            <p className="mt-5 text-xs text-text-caption">
              Raised {formatDate(ticket.createdAt)} ·{" "}
              {ticket.book?.title ?? "General / Account level"}
            </p>
          </div>
          <div className="mt-5 space-y-4">
            {ticket.messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border p-5 ${m.sender.role === "AUTHOR" ? "ml-8 border-border bg-surface" : "mr-8 border-border-brand-soft bg-brand-wash"}`}
              >
                <div className="flex justify-between gap-4">
                  <p className="text-sm font-semibold">
                    {m.sender.name}{" "}
                    <span className="font-normal text-text-caption">
                      · {m.sender.role === "ADMIN" ? "BookLeaf Support" : "You"}
                    </span>
                  </p>
                  <p className="text-xs text-text-caption">
                    {formatDate(m.createdAt)}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-body">
                  {m.body}
                </p>
              </div>
            ))}
            {ticket.messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border-dashed bg-surface-soft p-6 text-center text-sm text-text-muted">
                Your ticket is in the queue. A response will appear here
                automatically.
              </div>
            )}
          </div>
          <form
            onSubmit={reply}
            className="mt-5 rounded-2xl border border-border bg-surface p-4"
          >
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={2}
              rows={4}
              placeholder="Add more context or reply to the team…"
              className="w-full resize-none border-0 p-2 outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand"
              >
                <Send size={16} />
                {sending ? "Sending…" : "Send reply"}
              </button>
            </div>
          </form>
        </section>
        <aside className="h-fit rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Ticket details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-text-caption">
                Category
              </dt>
              <dd className="mt-1 font-medium">
                {ticket.category.replaceAll("_", " ")}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-text-caption">
                Response updates
              </dt>
              <dd className="mt-1 leading-6 text-text-body">
                New responses appear automatically through a live connection.
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
