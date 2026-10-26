"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return <Sonner
    position="top-center"
    toastOptions={{
      classNames: {
        toast: "!rounded-xl !border-[#eadfdf] !bg-white !text-[#252429] !shadow-[0_14px_40px_rgba(63,32,38,.14)]",
        error: "!border-[#f3c4ca]",
        success: "!border-emerald-200",
        description: "!text-[#746f75]",
      },
    }}
    {...props}
  />;
}
