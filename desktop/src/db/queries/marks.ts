import { getDb } from "../database";

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

export async function getMarksInRange(fromISO: string, toISO: string): Promise<Mark[]> {
  const db = await getDb();
  return db.select<Mark[]>(
    `${SELECT} WHERE m.date >= ? AND m.date <= ? ORDER BY m.date, m.id`,
    [fromISO, toISO],
  );
}

export async function createMark(input: { date: string; markTypeId: number }): Promise<number> {
  const db = await getDb();
  const res = await db.execute(`INSERT INTO marks(date, mark_type_id) VALUES(?, ?)`, [
    input.date,
    input.markTypeId,
  ]);
  return Number(res.lastInsertId);
}

export async function deleteMark(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM marks WHERE id = ?", [id]);
}
