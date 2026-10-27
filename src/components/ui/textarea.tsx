import * as React from "react";
import { cn } from "@/lib/utils";
export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-xl border border-border-input bg-surface px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-text-placeholder focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
