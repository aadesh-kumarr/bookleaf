import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, MessageSquareText, ReceiptIndianRupee, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { Badge as StatusBadge, EmptyState, StatCard } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, labels } from "@/lib/constants";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      books: { orderBy: { title: "asc" } },
      tickets: { orderBy: { updatedAt: "desc" }, include: { book: { select: { title: true } } } },
      loginAudits: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!user || user.role === "ADMIN") redirect("/admin/users");

  const copies = user.books.reduce((sum, book) => sum + book.totalCopiesSold, 0);
  const earned = user.books.reduce((sum, book) => sum + book.totalRoyaltyEarned, 0);
  const pending = user.books.reduce((sum, book) => sum + book.royaltyPending, 0);

  return <>
    <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-[#746f75]"><ArrowLeft size={17}/>Back to users</Link>
    <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><div className="flex items-center gap-2"><p className="text-sm font-semibold text-[#e04d61]">Author profile</p><StatusBadge value="AUTHOR"/></div><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{user.name}</h1><p className="mt-3 text-[#746f75]">{user.authorCode} · {user.email} · {user.city??"City unavailable"}</p></div>
      <p className="text-sm text-[#817b80]">Joined {formatDate(user.joinedDate??user.createdAt)}</p>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Books" value={String(user.books.length)} detail={`${user.books.filter(book=>book.status.includes("Published")).length} published`} icon={<BookOpen size={20}/>}/>
      <StatCard label="Copies sold" value={copies.toLocaleString("en-IN")} detail="Across catalog" icon={<TrendingUp size={20}/>}/>
      <StatCard label="Royalty earned" value={formatCurrency(earned)} detail={`${formatCurrency(pending)} pending`} icon={<ReceiptIndianRupee size={20}/>}/>
      <StatCard label="Support tickets" value={String(user.tickets.length)} detail={`${user.tickets.filter(ticket=>!["RESOLVED","CLOSED"].includes(ticket.status)).length} active`} icon={<MessageSquareText size={20}/>}/>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle>Books</CardTitle></CardHeader><CardContent className="space-y-3">{user.books.map(book=><div key={book.id} className="rounded-xl border border-[#eee5e5] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{book.title}</p><p className="mt-1 text-xs text-[#817b80]">{book.id} · {book.genre}</p></div><Badge variant={book.status.includes("Published")?"resolved":"progress"}>{book.status}</Badge></div><div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div><p className="text-xs text-[#8a8388]">Copies</p><p className="mt-1 font-semibold">{book.totalCopiesSold}</p></div><div><p className="text-xs text-[#8a8388]">Earned</p><p className="mt-1 font-semibold">{formatCurrency(book.totalRoyaltyEarned)}</p></div><div><p className="text-xs text-[#8a8388]">Pending</p><p className="mt-1 font-semibold">{formatCurrency(book.royaltyPending)}</p></div></div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Support tickets</CardTitle></CardHeader><CardContent className="space-y-3">{user.tickets.length?user.tickets.map(ticket=><Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="block rounded-xl border border-[#eee5e5] p-4 transition hover:border-[#f2a7b0] hover:bg-[#fffaf8]"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{ticket.subject}</p><div className="flex gap-2"><StatusBadge value={ticket.priority}/><StatusBadge value={ticket.status}/></div></div><p className="mt-2 text-xs text-[#817b80]">{ticket.reference} · {ticket.book?.title??"Account level"} · Updated {formatDate(ticket.updatedAt)}</p></Link>):<EmptyState title="No support tickets" text="This author has not raised a support query yet."/>}</CardContent></Card>
      </div>
      <aside className="space-y-6">
        <Card><CardHeader><CardTitle>Contact details</CardTitle></CardHeader><CardContent><dl className="space-y-4 text-sm"><div><dt className="text-xs uppercase tracking-wider text-[#8a8388]">Email</dt><dd className="mt-1 font-medium">{user.email}</dd></div><div><dt className="text-xs uppercase tracking-wider text-[#8a8388]">Phone</dt><dd className="mt-1 font-medium">{user.phone??"Not available"}</dd></div><div><dt className="text-xs uppercase tracking-wider text-[#8a8388]">City</dt><dd className="mt-1 font-medium">{user.city??"Not available"}</dd></div></dl></CardContent></Card>
        <Card><CardHeader><CardTitle>Recent login activity</CardTitle></CardHeader><CardContent className="space-y-3">{user.loginAudits.length?user.loginAudits.map(audit=><div key={audit.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#eee5e5] p-3"><div><p className="text-sm font-semibold">{audit.success?"Successful login":"Failed attempt"}</p><p className="mt-1 text-xs text-[#817b80]">{audit.reason?labels[audit.reason]??audit.reason.replaceAll("_"," "):"Authenticated"}</p></div><p className="text-xs text-[#817b80]">{formatDate(audit.createdAt)}</p></div>):<p className="py-5 text-center text-sm text-[#817b80]">No login activity recorded yet.</p>}</CardContent></Card>
      </aside>
    </div>
  </>;
}
