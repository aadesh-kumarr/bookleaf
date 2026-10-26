import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants=cva("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",{variants:{variant:{default:"bg-[#f7f2f2] text-[#655e63]",critical:"bg-red-100 text-red-700",high:"bg-orange-100 text-orange-700",medium:"bg-amber-100 text-amber-700",low:"bg-slate-100 text-slate-600",open:"bg-[#fff0ed] text-[#c74256]",progress:"bg-blue-100 text-blue-700",resolved:"bg-emerald-100 text-emerald-700",closed:"bg-slate-200 text-slate-600"}},defaultVariants:{variant:"default"}});
export function Badge({className,variant,...props}:React.ComponentProps<"span">&VariantProps<typeof badgeVariants>){return <span data-slot="badge" className={cn(badgeVariants({variant}),className)} {...props}/>}
export {badgeVariants};
