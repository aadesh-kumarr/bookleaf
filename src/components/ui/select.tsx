import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className={cn("group relative block w-full", className)}>
      <select
        data-slot="select"
        className="peer h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#e3d6d7] bg-gradient-to-b from-white to-[#fffafa] px-3.5 pr-11 text-sm font-medium text-[#4f484d] shadow-[0_1px_2px_rgba(63,32,38,.04)] outline-none transition duration-200 hover:border-[#efabb4] hover:bg-[#fff8f7] focus:border-[#f15d6f] focus:bg-white focus:ring-4 focus:ring-[#f15d6f]/10 disabled:cursor-not-allowed disabled:bg-[#f8f4f4] disabled:text-[#aaa1a5] disabled:opacity-70"
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-1.5 right-1.5 grid w-8 place-items-center rounded-lg border border-[#f0e3e4] bg-white text-[#d94f62] shadow-sm transition group-hover:border-[#efc3c9] peer-focus:border-[#f3a6b0] peer-focus:bg-[#fff3f1] peer-disabled:bg-transparent peer-disabled:text-[#aaa1a5]">
        <ChevronDown className="size-4" strokeWidth={2.25} />
      </span>
    </span>
  );
}
