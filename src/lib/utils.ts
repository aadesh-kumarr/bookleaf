import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
/** Combines conditional Tailwind classes while resolving conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
