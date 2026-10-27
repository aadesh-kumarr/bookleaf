import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-border-input bg-surface px-4 py-2 text-sm outline-none transition placeholder:text-text-placeholder focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
