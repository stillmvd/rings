import { getDb } from "../database";

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

export async function listMarkTypes(): Promise<MarkType[]> {
  const db = await getDb();
  return db.select<MarkType[]>(
    `SELECT id, name, icon, color, sort_order
     FROM mark_types
     ORDER BY sort_order, id`,
  );
}

export async function createMarkType(input: MarkTypeInput): Promise<number> {
  const db = await getDb();
  const res = await db.execute(
    `INSERT INTO mark_types(name, icon, color, sort_order) VALUES(?, ?, ?, ?)`,
    [input.name, input.icon, input.color, input.sortOrder ?? 0],
  );
  return Number(res.lastInsertId);
}

export async function updateMarkType(id: number, input: MarkTypeInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE mark_types SET name = ?, icon = ?, color = ?, sort_order = ? WHERE id = ?`,
    [input.name, input.icon, input.color, input.sortOrder ?? 0, id],
  );
}

export async function deleteMarkType(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM mark_types WHERE id = ?", [id]);
}
