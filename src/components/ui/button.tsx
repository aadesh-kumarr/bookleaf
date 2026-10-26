import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-4 focus-visible:ring-[#f15d6f]/15 disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-[#f15d6f] text-white shadow-[0_10px_24px_rgba(241,93,111,.20)] hover:bg-[#d9465a]",
      outline: "border border-[#dfd3d4] bg-white text-[#39353a] hover:border-[#f15d6f] hover:bg-[#fff7f5]",
      ghost: "text-[#655f64] hover:bg-[#fff0ed] hover:text-[#c94356]",
      secondary: "bg-[#fff0ed] text-[#c94356] hover:bg-[#ffe1da]",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    },
    size: { default: "h-11 px-5", sm: "h-9 rounded-lg px-3", lg: "h-12 px-6", icon: "size-10" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export function Button({ className, variant, size, asChild=false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}/>;
}
export { buttonVariants };
