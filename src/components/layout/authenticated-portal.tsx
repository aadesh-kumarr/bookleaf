import "server-only";

import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/notifications";

/** Enforces portal role access and supplies shared unread state to the shell. */
export async function AuthenticatedPortal({
  requiredRole,
  children,
}: {
  requiredRole: Role;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== requiredRole) {
    redirect(user.role === "ADMIN" ? "/admin" : "/author");
  }

  const unreadCount = await getUnreadMessageCount(user);
  return (
    <PortalShell user={user} initialUnreadCount={unreadCount}>
      {children}
    </PortalShell>
  );
}
