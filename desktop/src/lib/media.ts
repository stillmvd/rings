import { invoke } from "@tauri-apps/api/core";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function filterAcceptedImages(list: FileList | File[]): File[] {
  return Array.from(list).filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type));
}

// Пишет файл в appDataDir/media через Rust-команду, возвращает относительное имя (в БД).
export async function writeMediaFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `${crypto.randomUUID()}.${ext}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  return invoke<string>("save_media", { name, data: Array.from(buf) });
}

export async function deleteMediaFile(relPath: string): Promise<void> {
  await invoke("delete_media", { name: relPath });
}
