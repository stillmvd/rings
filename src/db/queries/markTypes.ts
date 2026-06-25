import "server-only";
import { getDb } from "../client";

export type MarkType = {
  id: number;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
};

export type MarkTypeInput = {
  name: string;
  icon: string;
  color: string;
  sortOrder?: number;
};

export function listMarkTypes(): MarkType[] {
  return getDb()
    .prepare<[], MarkType>(
      `SELECT id, name, icon, color, sort_order
       FROM mark_types
       ORDER BY sort_order, id`,
    )
    .all();
}

export function createMarkType(input: MarkTypeInput): number {
  const res = getDb()
    .prepare(`INSERT INTO mark_types(name, icon, color, sort_order) VALUES(?, ?, ?, ?)`)
    .run(input.name, input.icon, input.color, input.sortOrder ?? 0);
  return Number(res.lastInsertRowid);
}

export function updateMarkType(id: number, input: MarkTypeInput): void {
  getDb()
    .prepare(`UPDATE mark_types SET name = ?, icon = ?, color = ?, sort_order = ? WHERE id = ?`)
    .run(input.name, input.icon, input.color, input.sortOrder ?? 0, id);
}

export function deleteMarkType(id: number): void {
  getDb().prepare("DELETE FROM mark_types WHERE id = ?").run(id);
}
