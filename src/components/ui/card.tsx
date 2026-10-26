import * as React from "react";
import { cn } from "@/lib/utils";
export function Card({className,...props}:React.ComponentProps<"div">){return <div data-slot="card" className={cn("rounded-2xl border border-[#eadfdf] bg-white shadow-[0_12px_40px_rgba(63,32,38,.05)]",className)} {...props}/>}
export function CardHeader({className,...props}:React.ComponentProps<"div">){return <div data-slot="card-header" className={cn("grid gap-1.5 p-6",className)} {...props}/>}
export function CardTitle({className,...props}:React.ComponentProps<"h3">){return <h3 data-slot="card-title" className={cn("text-lg font-semibold tracking-[-.025em]",className)} {...props}/>}
export function CardDescription({className,...props}:React.ComponentProps<"p">){return <p data-slot="card-description" className={cn("text-sm text-[#746f75]",className)} {...props}/>}
export function CardContent({className,...props}:React.ComponentProps<"div">){return <div data-slot="card-content" className={cn("px-6 pb-6",className)} {...props}/>}
export function CardFooter({className,...props}:React.ComponentProps<"div">){return <div data-slot="card-footer" className={cn("flex items-center px-6 pb-6",className)} {...props}/>}
