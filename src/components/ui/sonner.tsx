"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border-border !bg-surface !text-ink !shadow-toast",
          error: "!border-border-brand-soft",
          success: "!border-success-border",
          description: "!text-text-muted",
        },
      }}
      {...props}
    />
  );
}
