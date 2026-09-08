import { getDb } from "../database";

export type EventMedia = {
  id: number;
  event_id: number;
  path: string;
  sort_order: number;
  created_at: string;
};

export async function listMediaByEvent(eventId: number): Promise<EventMedia[]> {
  const db = await getDb();
  return db.select<EventMedia[]>(
    `SELECT id, event_id, path, sort_order, created_at
     FROM event_media
     WHERE event_id = ?
     ORDER BY sort_order, id`,
    [eventId],
  );
}

export async function addMedia(eventId: number, relPath: string): Promise<number> {
  const db = await getDb();
  const res = await db.execute(
    `INSERT INTO event_media(event_id, path, sort_order)
     VALUES(?, ?, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM event_media WHERE event_id = ?))`,
    [eventId, relPath, eventId],
  );
  return Number(res.lastInsertId);
}

export async function deleteMedia(id: number): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<{ path: string }[]>(
    "SELECT path FROM event_media WHERE id = ?",
    [id],
  );
  await db.execute("DELETE FROM event_media WHERE id = ?", [id]);
  return rows[0]?.path ?? null;
}
