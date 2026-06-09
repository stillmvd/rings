import "server-only";
import { getDb } from "../client";

export type EventMedia = {
  id: number;
  event_id: number;
  path: string;
  sort_order: number;
  created_at: string;
};

export function listMediaByEvent(eventId: number): EventMedia[] {
  return getDb()
    .prepare<[number], EventMedia>(
      `SELECT id, event_id, path, sort_order, created_at
       FROM event_media
       WHERE event_id = ?
       ORDER BY sort_order, id`,
    )
    .all(eventId);
}

export function addMedia(eventId: number, relPath: string): number {
  const res = getDb()
    .prepare(
      `INSERT INTO event_media(event_id, path, sort_order)
       VALUES(?, ?, (SELECT COALESCE(MAX(sort_order) + 1, 0) FROM event_media WHERE event_id = ?))`,
    )
    .run(eventId, relPath, eventId);
  return Number(res.lastInsertRowid);
}

export function deleteMedia(id: number): string | null {
  const db = getDb();
  const row = db
    .prepare<[number], { path: string }>("SELECT path FROM event_media WHERE id = ?")
    .get(id);
  db.prepare("DELETE FROM event_media WHERE id = ?").run(id);
  return row?.path ?? null;
}

export function reorderMedia(eventId: number, orderedIds: number[]): void {
  const db = getDb();
  const upd = db.prepare("UPDATE event_media SET sort_order = ? WHERE id = ? AND event_id = ?");
  const tx = db.transaction((ids: number[]) => {
    ids.forEach((id, i) => upd.run(i, id, eventId));
  });
  tx(orderedIds);
}
