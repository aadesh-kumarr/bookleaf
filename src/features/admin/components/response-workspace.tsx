import { Bot, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/** Hosts editable AI-assisted drafting without sending responses automatically. */
export function AdminResponseWorkspace({
  draft,
  busy,
  onDraftChange,
  onGenerate,
  onSend,
}: {
  draft: string;
  busy: string;
  onDraftChange: (value: string) => void;
  onGenerate: React.MouseEventHandler<HTMLButtonElement>;
  onSend: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Card className="xl:sticky xl:bottom-4 xl:z-20 xl:shadow-floating">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">AI response workspace</CardTitle>
            <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
              Draft from policy and author context.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={onGenerate}
            disabled={busy === "ai"}
          >
            {busy === "ai" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Bot size={15} />
            )}{" "}
            {busy === "ai" ? "Drafting…" : "Generate draft"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="relative">
          <Textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            readOnly={busy === "ai"}
            aria-busy={busy === "ai"}
            rows={3}
            className="min-h-20 max-h-32 resize-y px-3 py-2.5 leading-5"
            placeholder="Generate a draft or write the response manually."
          />
          {busy === "ai" && !draft && (
            <div
              className="absolute inset-0 rounded-xl border border-border-brand-soft bg-surface px-3 py-3"
              role="status"
              aria-label="Generating AI draft"
            >
              <span className="sr-only">Generating AI draft</span>
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11px] text-text-caption" aria-live="polite">
            {busy === "ai"
              ? "Reading the ticket and drafting…"
              : "Review before sending."}
          </p>
          <Button
            size="sm"
            onClick={onSend}
            disabled={busy === "send" || busy === "ai"}
          >
            {busy === "send" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send size={14} />
            )}{" "}
            {busy === "send" ? "Sending…" : "Send response"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
