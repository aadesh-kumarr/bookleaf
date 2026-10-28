import { Bot, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, labels, priorities, statuses } from "@/lib/constants";
import type { AdminTicket } from "@/features/admin/types";

/** Groups administrator triage controls, private notes, and author context. */
export function AdminTicketSidebar({
  ticket,
  internalNote,
  busy,
  onUpdate,
  onInternalNoteChange,
  onAddInternalNote,
}: {
  ticket: AdminTicket;
  internalNote: string;
  busy: string;
  onUpdate: (data: Record<string, unknown>) => void;
  onInternalNoteChange: (value: string) => void;
  onAddInternalNote: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <aside className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Triage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block text-sm font-semibold">
            Status
            <Select
              value={ticket.status}
              onChange={(event) => onUpdate({ status: event.target.value })}
              className="mt-2"
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {labels[value]}
                </option>
              ))}
            </Select>
          </label>
          <label className="block text-sm font-semibold">
            Priority
            <Select
              value={ticket.priority}
              onChange={(event) => onUpdate({ priority: event.target.value })}
              className="mt-2"
            >
              {priorities.map((value) => (
                <option key={value} value={value}>
                  {labels[value]}
                </option>
              ))}
            </Select>
          </label>
          <label className="block text-sm font-semibold">
            Category
            <Select
              value={ticket.category}
              onChange={(event) => onUpdate({ category: event.target.value })}
              className="mt-2"
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {labels[value]}
                </option>
              ))}
            </Select>
          </label>
          <div className="rounded-xl bg-brand-soft p-4 text-xs leading-5 text-brand-copy">
            <Bot className="mr-1 inline size-4" />
            AI suggested {labels[ticket.aiCategory]} at{" "}
            {labels[ticket.aiPriority]} priority (
            {Math.round((ticket.aiConfidence ?? 0.7) * 100)}% confidence). Admin
            overrides are preserved.
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Internal note</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={internalNote}
            onChange={(event) => onInternalNoteChange(event.target.value)}
            rows={5}
            placeholder="Visible only to the operations team."
          />
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={onAddInternalNote}
            disabled={busy === "note"}
          >
            <MessageSquareText size={16} />
            Add private note
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Author</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-semibold">{ticket.author.name}</p>
          <p className="text-text-muted">{ticket.author.email}</p>
          <p className="text-text-muted">{ticket.author.phone ?? "No phone"}</p>
          <p className="text-text-muted">
            {ticket.author.city ?? "City unavailable"}
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
