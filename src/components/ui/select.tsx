import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders a consistently styled native select with an accessible indicator. */
export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className={cn("group relative block w-full", className)}>
      <select
        data-slot="select"
        className="peer h-11 w-full cursor-pointer appearance-none rounded-xl border border-border-input bg-gradient-to-b from-surface to-surface-subtle px-3.5 pr-11 text-sm font-medium text-text-strong shadow-field outline-none transition duration-200 hover:border-border-brand hover:bg-surface-warm focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled disabled:opacity-70"
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-1.5 right-1.5 grid w-8 place-items-center rounded-lg border border-border-soft bg-surface text-brand-icon shadow-control transition group-hover:border-border-brand-soft peer-focus:border-border-brand peer-focus:bg-brand-wash peer-disabled:bg-transparent peer-disabled:text-text-disabled">
        <ChevronDown className="size-4" strokeWidth={2.25} />
      </span>
    </span>
  );
}
