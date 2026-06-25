import "server-only";
import { getDb } from "../client";

export type Mark = {
  id: number;
  date: string;
  type_id: number;
  type_name: string;
  type_icon: string;
  type_color: string;
};

const SELECT = `
  SELECT m.id,
         m.date,
         m.mark_type_id AS type_id,
         t.name  AS type_name,
         t.icon  AS type_icon,
         t.color AS type_color
  FROM marks m
  JOIN mark_types t ON t.id = m.mark_type_id`;

export function getMarksInRange(fromISO: string, toISO: string): Mark[] {
  return getDb()
    .prepare<[string, string], Mark>(
      `${SELECT} WHERE m.date >= ? AND m.date <= ? ORDER BY m.date, m.id`,
    )
    .all(fromISO, toISO);
}

export function createMark(input: { date: string; markTypeId: number }): number {
  const res = getDb()
    .prepare(`INSERT INTO marks(date, mark_type_id) VALUES(?, ?)`)
    .run(input.date, input.markTypeId);
  return Number(res.lastInsertRowid);
}

export function deleteMark(id: number): void {
  getDb().prepare("DELETE FROM marks WHERE id = ?").run(id);
}
