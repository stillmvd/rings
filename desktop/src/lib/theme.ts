import { useEffect } from "react";
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
