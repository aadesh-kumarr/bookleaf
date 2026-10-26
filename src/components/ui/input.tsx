import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({className,type,...props}:React.ComponentProps<"input">){return <input type={type} data-slot="input" className={cn("flex h-11 w-full rounded-xl border border-[#dfd3d4] bg-white px-4 py-2 text-sm outline-none transition placeholder:text-[#a1999e] focus:border-[#f15d6f] focus:ring-4 focus:ring-[#f15d6f]/10 disabled:opacity-50",className)} {...props}/>}
