import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createLocalStore } from "./localStore";

export const closeToTrayStore = createLocalStore<"1" | "0">("trail.closeToTray", "1");

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
