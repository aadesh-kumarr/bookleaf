import { Clock3, MessageSquareText, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatTime } from "@/lib/constants";
import type { AdminTicket } from "@/features/admin/types";

/** Presents the original query and chronological public/internal timeline. */
export function AdminTicketConversation({ ticket }: { ticket: AdminTicket }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Author’s query</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-7 text-text-body">
            {ticket.description}
          </p>
          {ticket.book && (
            <div className="mt-5 grid gap-3 rounded-xl bg-surface-warm p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-text-caption">Book</p>
                <p className="mt-1 font-semibold">{ticket.book.title}</p>
              </div>
              <div>
                <p className="text-xs text-text-caption">Current stage</p>
                <p className="mt-1 font-semibold">{ticket.book.status}</p>
              </div>
              <div>
                <p className="text-xs text-text-caption">Royalty pending</p>
                <p className="mt-1 font-semibold">
                  {formatCurrency(ticket.book.royaltyPending)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Conversation timeline</CardTitle>
          <p className="mt-1 text-sm text-text-muted">
            A chronological record of the ticket and every follow-up.
          </p>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto pr-3 ticket-scrollbar">
          <div className="relative pr-3">
            <div
              aria-hidden="true"
              className="absolute bottom-5 left-[15px] top-5 w-px bg-border-timeline"
            />
            <div className="space-y-5">
              <div className="relative grid grid-cols-[2rem_1fr] gap-3">
                <span className="relative z-10 grid size-8 place-items-center rounded-full border-4 border-on-brand bg-brand text-on-brand shadow-control">
                  <MessageSquareText size={13} />
                </span>
                <div className="rounded-xl border border-border-brand-soft bg-surface-soft p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-semibold">Ticket opened</p>
                      <p className="mt-0.5 text-xs text-text-subtle">
                        {ticket.author.name} · Author
                      </p>
                    </div>
                    <time
                      dateTime={new Date(ticket.createdAt).toISOString()}
                      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-text-subtle"
                    >
                      <Clock3 size={13} />
                      {formatDate(ticket.createdAt)} · {formatTime(ticket.createdAt)}
                    </time>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-text-body">
                    Original query submitted: {ticket.subject}
                  </p>
                </div>
              </div>
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className="relative grid grid-cols-[2rem_1fr] gap-3"
                >
                  <span
                    className={`relative z-10 grid size-8 place-items-center rounded-full border-4 border-on-brand shadow-control ${message.isInternal ? "bg-note text-on-brand" : message.sender.role === "ADMIN" ? "bg-brand-strong text-on-brand" : "bg-text-body text-on-brand"}`}
                  >
                    {message.isInternal ? (
                      <StickyNote size={13} />
                    ) : (
                      <MessageSquareText size={13} />
                    )}
                  </span>
                  <div
                    className={`rounded-xl border p-4 ${message.isInternal ? "border-note-border bg-note-soft" : message.sender.role === "ADMIN" ? "border-border-brand-soft bg-surface-soft" : "border-border-muted bg-surface"}`}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-semibold">
                          {message.isInternal
                            ? "Internal note"
                            : message.sender.role === "ADMIN"
                              ? "Support response"
                              : "Author reply"}
                        </p>
                        <p className="mt-0.5 text-xs text-text-subtle">
                          {message.sender.name} ·{" "}
                          {message.isInternal
                            ? "Operations only"
                            : message.sender.role === "ADMIN"
                              ? "BookLeaf team"
                              : "Author"}
                        </p>
                      </div>
                      <time
                        dateTime={new Date(message.createdAt).toISOString()}
                        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-text-subtle"
                      >
                        <Clock3 size={13} />
                        {formatDate(message.createdAt)} ·{" "}
                        {formatTime(message.createdAt)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-body">
                      {message.body}
                    </p>
                  </div>
                </div>
              ))}
              {ticket.messages.length === 0 && (
                <p className="ml-11 rounded-xl border border-dashed border-border-dashed bg-canvas px-4 py-5 text-center text-sm text-text-subtle">
                  No follow-up activity yet.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
