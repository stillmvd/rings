import "server-only";
import { getDb } from "../client";

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

export function listPeople(): Person[] {
  return getDb().prepare<[], Person>(`${SELECT} ORDER BY sort_order, id`).all();
}

export function getPerson(id: number): Person | null {
  const row = getDb().prepare<[number], Person>(`${SELECT} WHERE id = ?`).get(id);
  return row ?? null;
}

export function createPerson(input: PersonInput): number {
  const res = getDb()
    .prepare(`INSERT INTO people(name, birth_date, has_year) VALUES(?, ?, ?)`)
    .run(input.name, input.birthDate, input.hasYear);
  return Number(res.lastInsertRowid);
}

export function updatePerson(id: number, input: PersonInput): void {
  getDb()
    .prepare(`UPDATE people SET name = ?, birth_date = ?, has_year = ? WHERE id = ?`)
    .run(input.name, input.birthDate, input.hasYear, id);
}

export function deletePerson(id: number): void {
  getDb().prepare("DELETE FROM people WHERE id = ?").run(id);
}

export function setPersonPhoto(id: number, path: string | null): void {
  getDb().prepare("UPDATE people SET photo = ? WHERE id = ?").run(path, id);
}
