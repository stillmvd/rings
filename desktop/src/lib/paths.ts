import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

let mediaDir: string | null = null;

export async function initPaths(): Promise<void> {
  mediaDir = await join(await appDataDir(), "media");
}

export function mediaSrc(relPath: string): string {
  if (!mediaDir) return "";
  return convertFileSrc(`${mediaDir}\\${relPath}`);
}
