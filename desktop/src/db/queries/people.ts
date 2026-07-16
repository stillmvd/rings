import { getDb } from "../database";

export type Person = {
  id: number;
  name: string;
  birth_date: string;
  has_year: number;
  photo: string | null;
  sort_order: number;
};

export type PersonInput = {
  name: string;
  birthDate: string;
  hasYear: number;
};

const SELECT = `SELECT id, name, birth_date, has_year, photo, sort_order FROM people`;

export async function listPeople(): Promise<Person[]> {
  const db = await getDb();
  return db.select<Person[]>(`${SELECT} ORDER BY sort_order, id`);
}

export async function getPerson(id: number): Promise<Person | null> {
  const db = await getDb();
  const rows = await db.select<Person[]>(`${SELECT} WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function createPerson(input: PersonInput): Promise<number> {
  const db = await getDb();
  const res = await db.execute(`INSERT INTO people(name, birth_date, has_year) VALUES(?, ?, ?)`, [
    input.name,
    input.birthDate,
    input.hasYear,
  ]);
  return Number(res.lastInsertId);
}

export async function updatePerson(id: number, input: PersonInput): Promise<void> {
  const db = await getDb();
  await db.execute(`UPDATE people SET name = ?, birth_date = ?, has_year = ? WHERE id = ?`, [
    input.name,
    input.birthDate,
    input.hasYear,
    id,
  ]);
}

export async function deletePerson(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM people WHERE id = ?", [id]);
}

export async function setPersonPhoto(id: number, path: string | null): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE people SET photo = ? WHERE id = ?", [path, id]);
}
