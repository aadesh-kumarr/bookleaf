import { AuthenticatedPortal } from "@/components/layout/authenticated-portal";

/** Wraps every administration route in the shared ADMIN authorization boundary. */
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
