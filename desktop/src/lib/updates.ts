import { useSyncExternalStore } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";

type UpdateState = { update: Update | null; checkedAt: number | null };

let state: UpdateState = { update: null, checkedAt: null };
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export async function checkUpdate(): Promise<Update | null> {
  const update = await check();
  state = { update, checkedAt: Date.now() };
  listeners.forEach((l) => l());
  return update;
}

export const useUpdateState = () => useSyncExternalStore(subscribe, () => state);

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
