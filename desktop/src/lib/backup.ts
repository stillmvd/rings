import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir, documentDir, join } from "@tauri-apps/api/path";
import { relaunch } from "@tauri-apps/plugin-process";
import { createLocalStore } from "./localStore";
import { getDb } from "@/db/database";

export type BackupInterval = "day" | "week";

export const backupEnabledStore = createLocalStore<"1" | "0">("trail.backup.enabled", "0");
// Путь абсолютный: перенос старого значения увёл бы бэкапы в папку с прежним именем,
// которую Rust молча пересоздал бы. Сбрасываем на дефолт.
export const backupDirStore = createLocalStore<string>("trail.backup.dir", "", false);
export const backupIntervalStore = createLocalStore<BackupInterval>("trail.backup.interval", "week");
export const backupKeepStore = createLocalStore<string>("trail.backup.keep", "5");
export const backupLastStore = createLocalStore<string>("trail.backup.last", "");

const INTERVAL_MS: Record<BackupInterval, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

// Папка по умолчанию — в Документах, а не в AppData: бэкап рядом с боевой БД теряется
// вместе с ней. Rust создаёт её при первом архиве.
export async function defaultBackupDir(): Promise<string> {
  return join(await documentDir(), "Trail", "backups");
}

export async function resolveBackupDir(): Promise<string> {
  return backupDirStore.get() || (await defaultBackupDir());
}

export async function runBackup(destDir: string, keep: number): Promise<string> {
  const snapshot = await join(await appDataDir(), `backup-snapshot-${Date.now()}.db`);
  const db = await getDb();
  // VACUUM INTO не принимает плейсхолдеры — путь подставляем строкой, экранируя кавычки.
  await db.execute(`VACUUM INTO '${snapshot.replace(/'/g, "''")}'`);

  const dest = await join(destDir, `timeline-backup-${stamp(new Date())}.zip`);
  const created = await invoke<string>("create_backup", { dbSnapshot: snapshot, dest, keep });
  backupLastStore.set(String(Date.now()));
  return created;
}

export async function restoreBackup(zipPath: string): Promise<void> {
  await invoke("restore_backup", { zipPath });
  await relaunch();
}

async function maybeAutoBackup(): Promise<void> {
  if (backupEnabledStore.get() !== "1") return;

  const last = Number(backupLastStore.get() || 0);
  const due = INTERVAL_MS[backupIntervalStore.get()];
  if (last && Date.now() - last < due) return;

  await runBackup(await resolveBackupDir(), Number(backupKeepStore.get() || 0));
}

export function useAutoBackup() {
  useEffect(() => {
    maybeAutoBackup().catch(() => {});
    const timer = setInterval(() => {
      maybeAutoBackup().catch(() => {});
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
}
