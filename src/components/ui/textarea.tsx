import * as React from "react";
import { cn } from "@/lib/utils";
export function Textarea({className,...props}:React.ComponentProps<"textarea">){return <textarea data-slot="textarea" className={cn("min-h-24 w-full rounded-xl border border-[#dfd3d4] bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a1999e] focus:border-[#f15d6f] focus:ring-4 focus:ring-[#f15d6f]/10 disabled:opacity-50",className)} {...props}/>}
