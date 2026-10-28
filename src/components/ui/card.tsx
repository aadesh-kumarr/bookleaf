import * as React from "react";
import { cn } from "@/lib/utils";
/** Provides the shared bordered surface used to group related information. */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}
/** Provides consistent spacing for a card's heading region. */
export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid gap-1.5 p-6", className)}
      {...props}
    />
  );
}
/** Applies the standard card heading hierarchy. */
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-lg font-semibold tracking-[-.025em]", className)}
      {...props}
    />
  );
}
/** Provides consistent spacing for a card's content region. */
export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  );
}
