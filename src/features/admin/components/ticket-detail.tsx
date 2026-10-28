"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { AdminResponseWorkspace } from "@/features/admin/components/response-workspace";
import { AdminTicketConversation } from "@/features/admin/components/ticket-conversation";
import { AdminTicketSidebar } from "@/features/admin/components/ticket-sidebar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage, requestJson } from "@/lib/api-client";
import { formatDate } from "@/lib/constants";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import type { AdminTicket } from "@/features/admin/types";

/** Coordinates assignment, triage, notes, AI drafting, and public responses. */
export function AdminTicketDetail({
  id,
  initialTicket,
  currentUserId,
}: {
  id: string;
  initialTicket: AdminTicket;
  currentUserId: string;
}) {
  const [ticket, setTicket] = useState<AdminTicket>(initialTicket);
  const [draft, setDraft] = useState("");
  const [internal, setInternal] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    void fetch(`/api/tickets/${id}/read`, { method: "POST" });
  }, [id]);

  async function load() {
    const result = await requestJson<{ ticket: AdminTicket }>(
      `/api/tickets/${id}`,
      { cache: "no-store" },
    );
    setTicket(result.ticket);
  }

  useRealtimeEvents((event) => {
    if (
      event.type === "realtime.connected" ||
      (event.type === "ticket.updated" && event.ticketId === id)
    ) {
      void Promise.all([
        load(),
        fetch(`/api/tickets/${id}/read`, { method: "POST" }),
      ]).catch(() => undefined);
    }
  });

  const canAct = Boolean(
    ticket?.assignedTo?.id && ticket.assignedTo.id === currentUserId,
  );
  function shake(element?: HTMLElement | null) {
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    element.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-7px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 380, easing: "ease-out" },
    );
  }

  function requireAssignment(action: () => void, element?: HTMLElement | null) {
    if (!canAct) {
      shake(element);
      toast.error("Assign this ticket to yourself first", {
        description: "Ticket actions are locked until assignment.",
      });
      return;
    }
    action();
  }

  async function update(data: Record<string, unknown>) {
    setBusy("update");
    try {
      await requestJson(`/api/tickets/${id}`, {
        method: "PATCH",
        json: data,
      });
      if (data.assignToMe) toast.success("Ticket assigned to you");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update ticket"));
    } finally {
      setBusy("");
    }
  }

  async function generate() {
    setBusy("ai");
    setDraft("");
    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        toast.error(result?.error?.message ?? "Unable to generate draft");
        return;
      }
      if (!response.body) throw new Error("Streaming response unavailable");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let nextDraft = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        nextDraft += decoder.decode(value, { stream: true });
        setDraft(nextDraft);
      }
      nextDraft += decoder.decode();
      setDraft(nextDraft);
      if (!nextDraft.trim()) toast.error("The AI returned an empty draft");
    } catch {
      toast.error("Unable to generate draft right now");
    } finally {
      setBusy("");
    }
  }

  async function send(body: string, isInternal: boolean) {
    if (!body.trim()) return;
    setBusy(isInternal ? "note" : "send");
    try {
      await requestJson(`/api/tickets/${id}/responses`, {
        method: "POST",
        json: { body, isInternal },
      });
      if (isInternal) {
        setInternal("");
        toast.success("Internal note added");
      } else {
        setDraft("");
        toast.success("Response sent to author");
      }
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save response"));
    } finally {
      setBusy("");
    }
  }

  function sendResponse(event: React.MouseEvent<HTMLButtonElement>) {
    requireAssignment(() => {
      if (!draft.trim()) {
        toast.error("Write or generate a response first");
        return;
      }
      void send(draft, false);
    }, event.currentTarget);
  }

  function addInternalNote(event: React.MouseEvent<HTMLButtonElement>) {
    requireAssignment(() => {
      if (!internal.trim()) {
        toast.error("Write an internal note first");
        return;
      }
      void send(internal, true);
    }, event.currentTarget);
  }

  return (
    <>
      <Link
        href="/admin/tickets"
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted"
      >
        <ArrowLeft size={17} />
        Back to queue
      </Link>
      <div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={ticket.priority} />
            <StatusBadge value={ticket.status} />
            <span className="text-xs font-semibold text-text-caption">
              {ticket.reference}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
            {ticket.subject}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {ticket.author.name} · Opened {formatDate(ticket.createdAt)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => update({ assignToMe: true })}
          disabled={busy === "update" || canAct}
        >
          {canAct ? <Check size={17} /> : null}
          {canAct
            ? "Assigned to you"
            : ticket.assignedTo
              ? `Take over from ${ticket.assignedTo.name}`
              : "Assign to me"}
        </Button>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <AdminTicketConversation ticket={ticket} />
          <AdminResponseWorkspace
            draft={draft}
            busy={busy}
            onDraftChange={setDraft}
            onGenerate={(event) =>
              requireAssignment(() => void generate(), event.currentTarget)
            }
            onSend={sendResponse}
          />
        </div>
        <AdminTicketSidebar
          ticket={ticket}
          internalNote={internal}
          busy={busy}
          onUpdate={(data) => requireAssignment(() => void update(data))}
          onInternalNoteChange={setInternal}
          onAddInternalNote={addInternalNote}
        />
      </div>
    </>
  );
}
