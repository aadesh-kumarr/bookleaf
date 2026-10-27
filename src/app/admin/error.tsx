"use client";

import { PortalErrorState } from "@/components/layout/portal-error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PortalErrorState reset={reset} />;
}
