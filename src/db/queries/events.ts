import "server-only";
import { getDb } from "../client";

export type TimelineEvent = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  significance: number;
  category_id: number | null;
  track: number;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  cover: string | null;
};

export type EventInput = {
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  significance: number;
  categoryId: number | null;
  track: number;
};

const SELECT = `
  SELECT e.id,
         e.title,
         e.description,
         e.date,
         e.end_date,
         e.significance,
         e.category_id,
         e.track,
         c.name  AS category_name,
         c.icon  AS category_icon,
         c.color AS category_color,
         (SELECT m.path FROM event_media m
           WHERE m.event_id = e.id
           ORDER BY m.sort_order, m.id LIMIT 1) AS cover
  FROM events e
  LEFT JOIN categories c ON c.id = e.category_id`;

export function getEventsInRange(fromISO: string, toISO: string): TimelineEvent[] {
  return getDb()
    .prepare<[string, string], TimelineEvent>(
      `${SELECT} WHERE e.date >= ? AND e.date <= ? ORDER BY e.date, e.id`,
    )
    .all(fromISO, toISO);
}

export function getEvent(id: number): TimelineEvent | null {
  const row = getDb()
    .prepare<[number], TimelineEvent>(`${SELECT} WHERE e.id = ?`)
    .get(id);
  return row ?? null;
}

export function createEvent(input: EventInput): number {
  const res = getDb()
    .prepare(
      `INSERT INTO events(title, description, date, end_date, significance, category_id, track)
       VALUES(?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.title,
      input.description,
      input.date,
      input.endDate,
      input.significance,
      input.categoryId,
      input.track,
    );
  return Number(res.lastInsertRowid);
}

export function updateEvent(id: number, input: EventInput): void {
  getDb()
    .prepare(
      `UPDATE events
       SET title = ?, description = ?, date = ?, end_date = ?, significance = ?, category_id = ?, track = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .run(
      input.title,
      input.description,
      input.date,
      input.endDate,
      input.significance,
      input.categoryId,
      input.track,
      id,
    );
}

export function deleteEvent(id: number): void {
  getDb().prepare("DELETE FROM events WHERE id = ?").run(id);
}
