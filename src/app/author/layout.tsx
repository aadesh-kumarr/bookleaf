import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";
export default async function AuthorLayout({ children }: { children: React.ReactNode }) { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== "AUTHOR") redirect("/admin"); return <PortalShell user={user}>{children}</PortalShell>; }
