import "server-only";
import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { seedIfEmpty, seedMarkTypesIfEmpty } from "./seed";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "timeline.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "db", "schema.sql");

type DbHolder = { db?: Database.Database };

const globalForDb = globalThis as unknown as { __timeline?: DbHolder };
const holder: DbHolder = (globalForDb.__timeline ??= {});

function createDb(): Database.Database {
  mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");

  // SQLite встроенный LOWER() работает только для ASCII.
  // Регистрируем Unicode-aware замену для поиска по кириллице.
  db.function("lower_u", { deterministic: true }, (value: unknown) => {
    if (value == null) return null;
    return String(value).toLowerCase();
  });

  const schema = readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);
  seedIfEmpty(db);
  migrate(db);
  seedMarkTypesIfEmpty(db);
  return db;
}

function migrate(db: Database.Database): void {
  migrateEventEndDate(db);
  migrateMarksToTypes(db);
}

function migrateEventEndDate(db: Database.Database): void {
  if (!hasColumn(db, "events", "end_date")) {
    db.exec("ALTER TABLE events ADD COLUMN end_date TEXT");
  }
}

// Старая схема marks ссылалась на categories(category_id). Переходим на отдельный
// справочник mark_types: пересоздаём таблицу (тестовые отметки удаляются — данных в проде нет).
function migrateMarksToTypes(db: Database.Database): void {
  if (!hasColumn(db, "marks", "category_id")) return;
  db.exec(`
    DROP TABLE marks;
    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      mark_type_id INTEGER NOT NULL REFERENCES mark_types(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_marks_date ON marks(date);
    CREATE INDEX IF NOT EXISTS idx_marks_type ON marks(mark_type_id);
  `);
}

function hasColumn(db: Database.Database, table: string, column: string): boolean {
  const rows = db.prepare<[], { name: string }>(`PRAGMA table_info(${table})`).all();
  return rows.some((r) => r.name === column);
}

export function getDb(): Database.Database {
  if (!holder.db) {
    holder.db = createDb();
  }
  return holder.db;
}

export function getSetting(key: string): string | null {
  const row = getDb()
    .prepare<[string], { value: string }>("SELECT value FROM settings WHERE key = ?")
    .get(key);
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}
