import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/constants";

export default async function BooksPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const books = await db.book.findMany({
    where: { authorId: user.id },
    orderBy: { title: "asc" },
  });
  return (
    <>
      <div>
        <p className="text-sm font-semibold text-brand-strong">Your catalog</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
          My books
        </h1>
        <p className="mt-3 text-text-muted">
          Sales, royalty, production, and distribution details from your
          publishing catalog.
        </p>
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        {books.map((book) => {
          const platforms = JSON.parse(book.availableOn) as string[];
          return (
            <article
              key={book.id}
              className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card-sm"
            >
              <div className="flex gap-4 border-b border-border-soft p-5 sm:p-6">
                <div className="grid h-20 w-14 shrink-0 place-items-center rounded-md bg-gradient-to-br from-brand to-brand-deep px-1 text-center text-[9px] font-bold uppercase tracking-wider text-on-brand shadow-book">
                  {book.title}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{book.title}</h2>
                    <Badge
                      variant={
                        book.status.includes("Published")
                          ? "resolved"
                          : "progress"
                      }
                    >
                      {book.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{book.genre}</p>
                  <p className="mt-2 text-xs text-text-caption">
                    ISBN {book.isbn} · {formatDate(book.publicationDate)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-border-soft sm:grid-cols-4">
                {[
                  ["MRP", formatCurrency(book.mrp)],
                  ["Copies sold", book.totalCopiesSold.toLocaleString("en-IN")],
                  ["Earned", formatCurrency(book.totalRoyaltyEarned)],
                  ["Pending", formatCurrency(book.royaltyPending)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-surface p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-text-caption">
                      {label}
                    </p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {platforms.length ? (
                    platforms.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-neutral-soft px-3 py-1 text-xs font-medium text-text-body"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-text-caption">
                      Distribution begins after production is complete.
                    </span>
                  )}
                </div>
                <p className="mt-4 text-xs text-text-subtle">
                  Print partner: {book.printPartner ?? "To be assigned"} · Last
                  payout: {formatDate(book.lastRoyaltyPayoutDate)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
