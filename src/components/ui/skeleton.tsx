import * as React from "react";
import { cn } from "@/lib/utils";

/** Renders an accessible visual placeholder while server data is loading. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg bg-skeleton", className)}
      {...props}
    />
  );
}
