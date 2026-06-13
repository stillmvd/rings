import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto_Flex } from "next/font/google";
import { Providers } from "@/components/providers";
import { MdRegistry } from "@/components/m3/MdRegistry";
import { getSetting } from "@/db/queries/settings";
import { DEFAULT_SEED, themeStyleSheet } from "@/lib/m3/dynamic-color";
import { SEED_BOOT_SCRIPT } from "@/lib/m3/seed-client";
import "./globals.css";

const robotoFlex = Roboto_Flex({
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Timeline",
  description: "Интерактивный таймлайн жизни",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const seed = getSetting("theme.seed") ?? DEFAULT_SEED;
  return (
    <html lang="ru" className={robotoFlex.variable} suppressHydrationWarning>
      <head>
        <style id="md-theme" dangerouslySetInnerHTML={{ __html: themeStyleSheet(seed) }} />
        {/* Перезаписывает md-theme сохранённым seed до paint — без вспышки дефолтной палитры. */}
        <script dangerouslySetInnerHTML={{ __html: SEED_BOOT_SCRIPT }} />
      </head>
      <body>
        <MdRegistry />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
