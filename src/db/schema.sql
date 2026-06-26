-- Timeline schema. Даты событий хранятся как TEXT 'YYYY-MM-DD'.
-- Идемпотентно: безопасно повторное выполнение.

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,                              -- YYYY-MM-DD (начало)
  end_date TEXT,                                   -- YYYY-MM-DD, NULL = точечное событие
  significance INTEGER NOT NULL DEFAULT 1 CHECK(significance IN (1, 2, 3)),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  track INTEGER NOT NULL DEFAULT 0,                -- 1 = показывать в разделе «Отслеживание»
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_significance ON events(significance);

-- Типы отметок: отдельный справочник трекеров (имя/иконка/цвет), независим от категорий событий.
CREATE TABLE IF NOT EXISTS mark_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Отметки: быстрый лог дня без названия — дата + тип отметки (иконка на оси/в календаре).
CREATE TABLE IF NOT EXISTS marks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                              -- YYYY-MM-DD
  mark_type_id INTEGER NOT NULL REFERENCES mark_types(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_marks_date ON marks(date);
CREATE INDEX IF NOT EXISTS idx_marks_type ON marks(mark_type_id);

CREATE TABLE IF NOT EXISTS event_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  path TEXT NOT NULL,                              -- относительный путь в data/media/
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_event_media_event ON event_media(event_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
