import "server-only";
import { getDb } from "../client";

export const BACKUP_VERSION = 1;

export type BackupCategory = {
  id: number;
  name: string;
  icon: string;
  color: string;
  parent_id: number | null;
  sort_order: number;
  is_default: number;
};

export type BackupEvent = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  significance: number;
  category_id: number | null;
  created_at: string;
  updated_at: string;
};

export type BackupSetting = { key: string; value: string };

export type BackupData = {
  version: number;
  exportedAt: string;
  categories: BackupCategory[];
  events: BackupEvent[];
  settings: BackupSetting[];
};

export function importBackupData(data: BackupData): { categories: number; events: number } {
  const db = getDb();
  // FK нельзя переключать внутри транзакции — отключаем вокруг неё,
  // чтобы порядок вставки (self-ref parent_id, events.category_id) не нарушал ссылки.
  db.pragma("foreign_keys = OFF");
  try {
    const run = db.transaction(() => {
      db.prepare("DELETE FROM events").run();
      db.prepare("DELETE FROM categories").run();
      db.prepare("DELETE FROM settings").run();

      const insCat = db.prepare(
        `INSERT INTO categories(id, name, icon, color, parent_id, sort_order, is_default)
         VALUES(@id, @name, @icon, @color, @parent_id, @sort_order, @is_default)`,
      );
      // Корни раньше детей — корректно и при включённых FK.
      const sorted = [...data.categories].sort(
        (a, b) => Number(a.parent_id !== null) - Number(b.parent_id !== null),
      );
      for (const c of sorted) insCat.run(c);

      const insEvent = db.prepare(
        `INSERT INTO events(id, title, description, date, end_date, significance, category_id, created_at, updated_at)
         VALUES(@id, @title, @description, @date, @end_date, @significance, @category_id, @created_at, @updated_at)`,
      );
      for (const e of data.events) insEvent.run(e);

      const insSetting = db.prepare("INSERT INTO settings(key, value) VALUES(@key, @value)");
      for (const s of data.settings) insSetting.run(s);
    });
    run();
  } finally {
    db.pragma("foreign_keys = ON");
  }
  return { categories: data.categories.length, events: data.events.length };
}

export function getBackupData(): BackupData {
  const db = getDb();
  const categories = db
    .prepare<[], BackupCategory>(
      `SELECT id, name, icon, color, parent_id, sort_order, is_default
       FROM categories ORDER BY id`,
    )
    .all();
  const events = db
    .prepare<[], BackupEvent>(
      `SELECT id, title, description, date, end_date, significance, category_id, created_at, updated_at
       FROM events ORDER BY id`,
    )
    .all();
  const settings = db
    .prepare<[], BackupSetting>("SELECT key, value FROM settings ORDER BY key")
    .all();

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    categories,
    events,
    settings,
  };
}
