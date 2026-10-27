import { AuthenticatedPortal } from "@/components/layout/authenticated-portal";

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
