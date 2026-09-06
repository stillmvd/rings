import { check, type Update } from "@tauri-apps/plugin-updater";

let cached: Update | null = null;
let lastCheckAt: number | null = null;

export async function checkUpdate(): Promise<Update | null> {
  cached = await check();
  lastCheckAt = Date.now();
  return cached;
}

export const cachedUpdate = () => cached;
export const lastCheck = () => lastCheckAt;

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} МБ`;
}

export function formatProgress(downloaded: number, total: number | null): string {
  if (total === null || total <= 0) return formatBytes(downloaded);
  return `${formatBytes(downloaded)} из ${formatBytes(total)}`;
}

export function describeUpdateError(err: unknown): string {
  const text = String(err instanceof Error ? err.message : err).toLowerCase();
  if (/signature|подпис|minisign|verif|base64|decod|encod|public key|pubkey/.test(text))
    return "Подпись обновления не совпала, файл не принят";
  if (/network|dns|connect|timed out|timeout|resolve|sending request|os error/.test(text))
    return "Нет сети или сервер обновлений недоступен";
  if (/404|not found/.test(text)) return "Списка версий пока нет";
  return "Не удалось проверить обновления";
}
