import { useEffect, useState } from "react";
import { createLocalStore } from "./localStore";

export type ThemePref = "system" | "light" | "dark";

export const themeStore = createLocalStore<ThemePref>("rings.theme", "system");

export function useApplyTheme() {
  const pref = themeStore.use();
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      const light = pref === "light" || (pref === "system" && mq.matches);
      document.documentElement.dataset.theme = light ? "light" : "dark";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);
}

// Разрешённая тема (для перерисовки canvas при смене), читается из data-theme.
export function useResolvedTheme(): "light" | "dark" {
  const read = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
  const [theme, setTheme] = useState<"light" | "dark">(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}
