import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-neutral-soft text-text-body",
        critical: "bg-danger-muted text-danger",
        high: "bg-warning-soft text-warning",
        medium: "bg-caution-soft text-caution",
        low: "bg-neutral-status-soft text-neutral-status",
        open: "bg-brand-soft text-brand-ink",
        progress: "bg-info-soft text-info",
        resolved: "bg-success-soft text-success",
        closed: "bg-neutral-status-muted text-neutral-status",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;
export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
