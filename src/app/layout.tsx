import type { Metadata } from "next";
import "./globals.css";
import { appConfig } from "@/config/app";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: appConfig.product.name,
    template: `%s · ${appConfig.product.name}`,
  },
  description: appConfig.product.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
