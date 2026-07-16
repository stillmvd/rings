import { getDb } from "../database";

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

export async function getEventsInRange(fromISO: string, toISO: string): Promise<TimelineEvent[]> {
  const db = await getDb();
  return db.select<TimelineEvent[]>(
    `${SELECT} WHERE e.date >= ? AND e.date <= ? ORDER BY e.date, e.id`,
    [fromISO, toISO],
  );
}

export async function getEvent(id: number): Promise<TimelineEvent | null> {
  const db = await getDb();
  const rows = await db.select<TimelineEvent[]>(`${SELECT} WHERE e.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function createEvent(input: EventInput): Promise<number> {
  const db = await getDb();
  const res = await db.execute(
    `INSERT INTO events(title, description, date, end_date, significance, category_id, track)
     VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description,
      input.date,
      input.endDate,
      input.significance,
      input.categoryId,
      input.track,
    ],
  );
  return Number(res.lastInsertId);
}

export async function updateEvent(id: number, input: EventInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE events
     SET title = ?, description = ?, date = ?, end_date = ?, significance = ?, category_id = ?, track = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      input.title,
      input.description,
      input.date,
      input.endDate,
      input.significance,
      input.categoryId,
      input.track,
      id,
    ],
  );
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM events WHERE id = ?", [id]);
}
