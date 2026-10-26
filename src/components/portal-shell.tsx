"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CircleHelp, LayoutDashboard, ListFilter, LogOut, MessageSquareText, Plus, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { clsx } from "clsx";

type User = { name: string; email: string; role: "AUTHOR" | "ADMIN"; authorCode?: string | null };

export function PortalShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const authorLinks = [
    { href: "/author", label: "Overview", icon: LayoutDashboard },
    { href: "/author/books", label: "My books", icon: BookOpen },
    { href: "/author/tickets", label: "My tickets", icon: MessageSquareText },
    { href: "/author/tickets/new", label: "New query", icon: Plus },
  ];
  const adminLinks = [
    { href: "/admin", label: "Ticket queue", icon: LayoutDashboard },
    { href: "/admin?status=OPEN", label: "Open tickets", icon: ListFilter },
    { href: "/admin?priority=CRITICAL", label: "Urgent", icon: CircleHelp },
    { href: "/admin/users", label: "Users", icon: Users },
  ];
  const links = user.role === "ADMIN" ? adminLinks : authorLinks;
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }

  function isActive(href: string) {
    const [targetPath, query = ""] = href.split("?");
    if (query) {
      if (pathname !== targetPath) return false;
      const expected = new URLSearchParams(query);
      return Array.from(expected.entries()).every(([key, value]) => searchParams.get(key) === value);
    }
    if (targetPath === "/author") return pathname === targetPath;
    if (targetPath === "/author/tickets/new") return pathname.startsWith(targetPath);
    if (targetPath === "/author/tickets") return pathname.startsWith(targetPath) && !pathname.startsWith("/author/tickets/new");
    if (targetPath === "/admin") return (pathname === "/admin" && searchParams.size === 0) || pathname.startsWith("/admin/tickets/");
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  return <div className="min-h-screen bg-[#fffaf8]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#eadfdf] bg-white px-5 py-7 lg:flex">
      <Brand/>
      <div className="mt-10 rounded-2xl bg-[#fff0ed] p-4"><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#c84a5b]">{user.role === "ADMIN" ? "Operations portal" : "Author portal"}</p><p className="mt-2 truncate font-semibold">{user.name}</p><p className="mt-1 truncate text-xs text-[#746f75]">{user.authorCode ?? user.email}</p></div>
      <nav className="mt-7 space-y-1">{links.map(({ href, label, icon: Icon }) => { const current = isActive(href); return <Link key={href} href={href} className={clsx("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition", current ? "bg-[#f15d6f] text-white shadow-[0_8px_22px_rgba(241,93,111,.22)]" : "text-[#655f64] hover:bg-[#fff3f1] hover:text-[#c94356]")}><Icon size={18}/>{label}</Link>; })}</nav>
      <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#746f75] hover:bg-[#fff3f1] hover:text-[#c94356]"><LogOut size={18}/>Sign out</button>
    </aside>
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#eadfdf] bg-white/90 px-5 backdrop-blur lg:hidden"><Brand/><button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-[#746f75]"><LogOut size={20}/></button></header>
    <main className="min-h-screen pb-20 lg:pb-0 lg:pl-64"><div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10 page-enter">{children}</div></main>
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-[#eadfdf] bg-white px-2 py-2 lg:hidden">{links.slice(0,4).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={clsx("flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold", isActive(href) ? "text-[#e24f63]" : "text-[#837c81]")}><Icon size={18}/>{label}</Link>)}</nav>
  </div>;
}
