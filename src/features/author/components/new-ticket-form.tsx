"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Paperclip, Send } from "lucide-react";
import { Select } from "@/components/ui/select";
import { getErrorMessage, requestJson } from "@/lib/api-client";

type Book = { id: string; title: string; status: string };

/** Collects and submits a validated author support request. */
export function NewTicketForm({ books }: { books: Book[] }) {
  const router = useRouter();
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = await requestJson<{ ticket: { id: string } }>(
        "/api/tickets",
        {
          method: "POST",
          json: { bookId: bookId || null, subject, description },
        },
      );
      router.push(`/author/tickets/${body.ticket.id}`);
      router.refresh();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not create ticket"));
    } finally {
      setLoading(false);
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
      <div className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold text-brand-strong">
          We’re here to help
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
          Raise a support query
        </h1>
        <p className="mt-3 text-text-muted">
          Share the full context once. We’ll classify it and route it to the
          right team.
        </p>
        <form
          onSubmit={submit}
          className="mt-8 space-y-6 rounded-2xl border border-border bg-surface p-5 shadow-card-sm sm:p-7"
        >
          <label className="block">
            <span className="text-sm font-semibold">Related book</span>
            <Select
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              className="mt-2"
            >
              <option value="">General / Account level</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} — {book.status}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              minLength={5}
              maxLength={140}
              required
              placeholder="A short summary of the issue"
              className="mt-2 w-full rounded-xl border border-border-input px-4 py-3.5 outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">What happened?</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={20}
              maxLength={5000}
              required
              rows={7}
              placeholder="Include dates, platforms, amounts, or production details that can help us investigate."
              className="mt-2 w-full resize-y rounded-xl border border-border-input px-4 py-3.5 leading-6 outline-none focus:border-brand"
            />
            <span className="mt-1 block text-right text-xs text-text-caption">
              {description.length}/5000
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Attachments (optional)</span>
            <span className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border-dashed bg-surface-soft px-4 py-4 text-sm text-text-muted transition hover:border-border-brand hover:bg-surface-warm">
              <Paperclip className="size-5 text-brand" />
              <span>
                {attachmentNames.length
                  ? `${attachmentNames.length} file${attachmentNames.length === 1 ? "" : "s"} selected`
                  : "Choose screenshots or supporting files"}
              </span>
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setAttachmentNames(
                    Array.from(event.target.files ?? [], (file) => file.name),
                  )
                }
              />
            </span>
            <span className="mt-1 block text-xs text-text-caption">
              UI preview only for this assignment; files are not uploaded.
            </span>
          </label>
          {error && (
            <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-on-brand disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="size-[17px] animate-spin" />
            ) : (
              <Send size={17} />
            )}{" "}
            {loading ? "Creating ticket…" : "Submit query"}
          </button>
        </form>
      </div>
    </>
  );
}
