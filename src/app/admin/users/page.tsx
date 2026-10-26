import Link from "next/link";
import { BookOpen, ChevronRight, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";

export default async function UsersPage() {
  const users = await db.user.findMany({
    include: { _count: { select: { books: true, tickets: true, loginAudits: true } } },
    orderBy: { name: "asc" },
  });
  const ordered = [...users].sort((a, b) => Number(b.role === "ADMIN") - Number(a.role === "ADMIN"));
  const authorCount = users.filter((user) => user.role === "AUTHOR").length;

  return <>
    <div>
      <p className="text-sm font-semibold text-[#e04d61]">Account directory</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Users</h1>
      <p className="mt-3 text-[#746f75]">All author and admin accounts in one place. Admin profiles are list-only.</p>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <Card><CardContent className="flex items-center justify-between pt-6"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8a8388]">Total users</p><p className="mt-1 text-3xl font-semibold">{users.length}</p></div><UserRound className="text-[#e04d61]"/></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between pt-6"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8a8388]">Authors</p><p className="mt-1 text-3xl font-semibold">{authorCount}</p></div><BookOpen className="text-[#e04d61]"/></CardContent></Card>
      <Card><CardContent className="flex items-center justify-between pt-6"><div><p className="text-xs font-bold uppercase tracking-wider text-[#8a8388]">Admins</p><p className="mt-1 text-3xl font-semibold">{users.length-authorCount}</p></div><ShieldCheck className="text-[#e04d61]"/></CardContent></Card>
    </div>

    <Card className="mt-6">
      <CardHeader><CardTitle>User directory</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {ordered.map((user) => {
          const content = <>
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff0ed] font-semibold text-[#d9465a]">{user.name.slice(0,1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{user.name}</p><Badge variant={user.role === "ADMIN" ? "progress" : "default"}>{user.role === "ADMIN" ? "Admin" : "Author"}</Badge></div><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#817b80]"><span className="inline-flex items-center gap-1"><Mail size={13}/>{user.email}</span>{user.city&&<span className="inline-flex items-center gap-1"><MapPin size={13}/>{user.city}</span>}</div></div>
            <div className="hidden gap-6 text-right sm:flex"><div><p className="text-xs text-[#8a8388]">Books</p><p className="mt-1 font-semibold">{user._count.books}</p></div><div><p className="text-xs text-[#8a8388]">Tickets</p><p className="mt-1 font-semibold">{user._count.tickets}</p></div><div><p className="text-xs text-[#8a8388]">Joined</p><p className="mt-1 text-sm font-semibold">{formatDate(user.joinedDate??user.createdAt)}</p></div></div>
            {user.role === "AUTHOR" ? <ChevronRight className="shrink-0 text-[#9b9297]" size={19}/> : <span className="w-[19px] shrink-0" aria-hidden="true"/>}
          </>;
          const classes = "flex items-center gap-4 rounded-xl border border-[#eee5e5] p-4";
          return user.role === "AUTHOR"
            ? <Link key={user.id} href={`/admin/users/${user.id}`} className={`${classes} transition hover:border-[#f2a7b0] hover:bg-[#fffaf8]`}>{content}</Link>
            : <div key={user.id} className={`${classes} bg-[#faf8f8]`}>{content}</div>;
        })}
      </CardContent>
    </Card>
  </>;
}
