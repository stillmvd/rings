import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { createLocalStore } from "./localStore";

export const closeToTrayStore = createLocalStore<"1" | "0">("rings.closeToTray", "1");

export type TrayIconPref = "white" | "black";
export const trayIconStore = createLocalStore<TrayIconPref>("rings.trayIcon", "white");

export function useApplyTrayIcon() {
  const pref = trayIconStore.use();
  useEffect(() => {
    invoke("set_tray_icon", { dark: pref === "black" }).catch(() => {});
  }, [pref]);
}

export function useCloseToTray() {
  useEffect(() => {
    const win = getCurrentWindow();
    const unlisten = win.onCloseRequested(async (e) => {
      if (closeToTrayStore.get() === "1") {
        e.preventDefault();
        await win.hide();
      }
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);
}
