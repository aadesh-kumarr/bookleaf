import { AuthenticatedPortal } from "@/components/layout/authenticated-portal";

/** Wraps every author route in the shared AUTHOR authorization boundary. */
export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedPortal requiredRole="AUTHOR">
      {children}
    </AuthenticatedPortal>
  );
}
