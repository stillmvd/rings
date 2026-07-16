import Database from "@tauri-apps/plugin-sql";
import { SCHEMA_SQL } from "./schema";

let dbPromise: Promise<Database> | null = null;

async function init(): Promise<Database> {
  const db = await Database.load("sqlite:timeline.db");
  const bare = SCHEMA_SQL.split("\n")
    .map((line) => line.replace(/--.*$/, ""))
    .join("\n");
  for (const stmt of bare.split(";")) {
    const sql = stmt.trim();
    if (sql) await db.execute(sql);
  }
  await migrate(db);
  return db;
}

async function migrate(db: Database): Promise<void> {
  if (!(await hasColumn(db, "events", "end_date"))) {
    await db.execute("ALTER TABLE events ADD COLUMN end_date TEXT");
  }
  if (!(await hasColumn(db, "events", "track"))) {
    await db.execute("ALTER TABLE events ADD COLUMN track INTEGER NOT NULL DEFAULT 0");
  }
  if (await hasColumn(db, "marks", "category_id")) {
    await db.execute("DROP TABLE marks");
    await db.execute(`CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      mark_type_id INTEGER NOT NULL REFERENCES mark_types(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.execute("CREATE INDEX IF NOT EXISTS idx_marks_date ON marks(date)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_marks_type ON marks(mark_type_id)");
  }
}

async function hasColumn(db: Database, table: string, column: string): Promise<boolean> {
  const rows = await db.select<{ name: string }[]>(`PRAGMA table_info(${table})`);
  return rows.some((r) => r.name === column);
}

export function getDb(): Promise<Database> {
  dbPromise ??= init();
  return dbPromise;
}
