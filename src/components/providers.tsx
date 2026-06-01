"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      themes={["light", "dark"]}
    >
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
