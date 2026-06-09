import "server-only";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MEDIA_DIR = path.join(process.cwd(), "data", "media");
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type SaveMediaResult = { ok: true; relPath: string } | { ok: false; error: string };

function ensureMediaDir(): void {
  mkdirSync(MEDIA_DIR, { recursive: true });
}

export function getMediaFilePath(relPath: string): string | null {
  const base = path.basename(relPath);
  if (!base || base !== relPath || base.startsWith(".")) return null;
  return path.join(MEDIA_DIR, base);
}

export async function saveMediaFile(file: File): Promise<SaveMediaResult> {
  const ext = ALLOWED_EXT[file.type];
  if (!ext) return { ok: false, error: "Неподдерживаемый формат (jpg, png, webp)" };
  if (file.size <= 0) return { ok: false, error: "Пустой файл" };
  if (file.size > MAX_MEDIA_BYTES) return { ok: false, error: "Файл больше 10 МБ" };

  ensureMediaDir();
  const name = `${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(MEDIA_DIR, name), buf);
  return { ok: true, relPath: name };
}

export function deleteMediaFile(relPath: string): void {
  const full = getMediaFilePath(relPath);
  if (full && existsSync(full)) rmSync(full, { force: true });
}
