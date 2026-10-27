import { AuthenticatedPortal } from "@/components/layout/authenticated-portal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedPortal requiredRole="ADMIN">
      {children}
    </AuthenticatedPortal>
  );
}
