import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";

/** Loads the administrator's searchable author and staff directory. */
export default async function UsersPage() {
  const users = await db.user.findMany({
    include: {
      _count: { select: { books: true, tickets: true, loginAudits: true } },
    },
    orderBy: { name: "asc" },
  });
  const ordered = [...users].sort(
    (a, b) => Number(b.role === "ADMIN") - Number(a.role === "ADMIN"),
  );
  const authorCount = users.filter((user) => user.role === "AUTHOR").length;

  return (
    <>
      <div>
        <p className="text-sm font-semibold text-brand-strong">
          Account directory
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
          Users
        </h1>
        <p className="mt-3 text-text-muted">
          All author and admin accounts in one place. Admin profiles are
          list-only.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
                Total users
              </p>
              <p className="mt-1 text-3xl font-semibold">{users.length}</p>
            </div>
            <UserRound className="text-brand-strong" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
                Authors
              </p>
              <p className="mt-1 text-3xl font-semibold">{authorCount}</p>
            </div>
            <BookOpen className="text-brand-strong" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-caption">
                Admins
              </p>
              <p className="mt-1 text-3xl font-semibold">
                {users.length - authorCount}
              </p>
            </div>
            <ShieldCheck className="text-brand-strong" />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>User directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ordered.map((user) => {
            const content = (
              <>
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft font-semibold text-brand-hover">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{user.name}</p>
                    <Badge
                      variant={user.role === "ADMIN" ? "progress" : "default"}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Author"}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={13} />
                      {user.email}
                    </span>
                    {user.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {user.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden gap-6 text-right sm:flex">
                  <div>
                    <p className="text-xs text-text-caption">Books</p>
                    <p className="mt-1 font-semibold">{user._count.books}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-caption">Tickets</p>
                    <p className="mt-1 font-semibold">{user._count.tickets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-caption">Joined</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(user.joinedDate ?? user.createdAt)}
                    </p>
                  </div>
                </div>
                {user.role === "AUTHOR" ? (
                  <ChevronRight className="shrink-0 text-text-placeholder" size={19} />
                ) : (
                  <span className="w-[19px] shrink-0" aria-hidden="true" />
                )}
              </>
            );
            const classes =
              "flex items-center gap-4 rounded-xl border border-border-soft p-4";
            return user.role === "AUTHOR" ? (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className={`${classes} transition hover:border-border-brand hover:bg-page`}
              >
                {content}
              </Link>
            ) : (
              <div key={user.id} className={`${classes} bg-surface-disabled`}>
                {content}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
