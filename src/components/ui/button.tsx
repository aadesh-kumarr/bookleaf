import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-on-brand shadow-brand hover:bg-brand-hover",
        outline:
          "border border-border-input bg-surface text-text-strong hover:border-brand hover:bg-surface-warm",
        ghost: "text-text-body hover:bg-brand-soft hover:text-brand-ink",
        secondary: "bg-brand-soft text-brand-ink hover:bg-brand-soft-hover",
        destructive: "bg-danger-strong text-on-brand hover:bg-danger",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** Renders the shared accessible button variants used across interactive flows. */
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
