"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Bot,
  CircleHelp,
  LayoutDashboard,
  ListFilter,
  LogOut,
  MessageSquareText,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { clsx } from "clsx";
import { useState } from "react";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { requestJson } from "@/lib/api-client";

type User = {
  name: string;
  email: string;
  role: "AUTHOR" | "ADMIN";
  authorCode?: string | null;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  showsUnread?: boolean;
};

const authorLinks: NavigationItem[] = [
  { href: "/author", label: "Overview", icon: LayoutDashboard },
  { href: "/author/books", label: "My books", icon: BookOpen },
  {
    href: "/author/tickets",
    label: "My tickets",
    icon: MessageSquareText,
    showsUnread: true,
  },
  { href: "/author/tickets/new", label: "New query", icon: Plus },
];

const adminLinks: NavigationItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/tickets",
    label: "Ticket queue",
    icon: MessageSquareText,
    showsUnread: true,
  },
  {
    href: "/admin/tickets?status=OPEN",
    label: "Open tickets",
    icon: ListFilter,
  },
  {
    href: "/admin/tickets?priority=URGENT",
    label: "Urgent",
    icon: CircleHelp,
  },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/ai-settings", label: "AI settings", icon: Bot },
];

function NavigationLink({
  item,
  current,
  unreadCount,
  mobile = false,
}: {
  item: NavigationItem;
  current: boolean;
  unreadCount: number;
  mobile?: boolean;
}) {
  const Icon = item.icon;

  if (mobile) {
    return (
      <Link
        href={item.href}
        className={clsx(
          "relative flex min-w-12 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[9px] font-semibold",
          current ? "text-brand-active" : "text-text-subtle",
        )}
      >
        <span className="relative">
          <Icon size={18} />
          {item.showsUnread && unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 size-2.5 rounded-full border-2 border-on-brand bg-brand" />
          )}
        </span>
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
        current
          ? "bg-brand text-on-brand shadow-brand"
          : "text-text-body hover:bg-brand-wash hover:text-brand-ink",
      )}
    >
      <Icon size={18} />
      {item.label}
      {item.showsUnread && unreadCount > 0 && (
        <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold leading-4 text-on-brand">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

export function PortalShell({
  user,
  initialUnreadCount,
  children,
}: {
  user: User;
  initialUnreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const links = user.role === "ADMIN" ? adminLinks : authorLinks;

  useRealtimeEvents((event) => {
    if (
      event.type !== "realtime.connected" &&
      event.type !== "notifications.updated" &&
      event.type !== "ticket.updated"
    ) {
      return;
    }
    void requestJson<{ unreadCount: number }>("/api/notifications", {
      cache: "no-store",
    })
      .then((result) => setUnreadCount(result.unreadCount))
      .catch(() => undefined);
  });
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    const [targetPath, query = ""] = href.split("?");
    if (query) {
      if (pathname !== targetPath) return false;
      const expected = new URLSearchParams(query);
      return Array.from(expected.entries()).every(
        ([key, value]) => searchParams.get(key) === value,
      );
    }
    if (targetPath === "/author") return pathname === targetPath;
    if (targetPath === "/author/tickets/new")
      return pathname.startsWith(targetPath);
    if (targetPath === "/author/tickets")
      return (
        pathname.startsWith(targetPath) &&
        !pathname.startsWith("/author/tickets/new")
      );
    if (targetPath === "/admin") return pathname === "/admin";
    if (targetPath === "/admin/tickets")
      return pathname.startsWith("/admin/tickets") && searchParams.size === 0;
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  return (
    <div className="min-h-screen bg-page">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-surface px-5 py-7 lg:flex">
        <Brand />
        <div className="mt-10 rounded-2xl bg-brand-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-brand-ink">
            {user.role === "ADMIN" ? "Operations portal" : "Author portal"}
          </p>
          <p className="mt-2 truncate font-semibold">{user.name}</p>
          <p className="mt-1 truncate text-xs text-text-muted">
            {user.authorCode ?? user.email}
          </p>
        </div>
        <nav className="mt-7 space-y-1">
          {links.map((item) => (
            <NavigationLink
              key={item.href}
              item={item}
              current={isActive(item.href)}
              unreadCount={unreadCount}
            />
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-text-muted hover:bg-brand-wash hover:text-brand-ink"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur lg:hidden">
        <Brand />
        <button
          onClick={logout}
          aria-label="Sign out"
          className="rounded-lg p-2 text-text-muted"
        >
          <LogOut size={20} />
        </button>
      </header>
      <main className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10 page-enter">
          {children}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-surface px-2 py-2 lg:hidden">
        {links.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            current={isActive(item.href)}
            unreadCount={unreadCount}
            mobile
          />
        ))}
      </nav>
    </div>
  );
}
