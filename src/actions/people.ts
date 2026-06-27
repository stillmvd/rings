"use server";

import { revalidatePath } from "next/cache";
import {
  createPerson,
  updatePerson,
  deletePerson,
  getPerson,
  setPersonPhoto,
} from "@/db/queries/people";
import { saveMediaFile, deleteMediaFile } from "@/lib/media";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";

export type PersonResult = { ok: true; id?: number } | { ok: false; error: string };
export type PersonPhotoResult =
  | { ok: true; photo: string | null }
  | { ok: false; error: string };

type PersonActionInput = {
  name: string;
  birthDate: string;
  hasYear: boolean;
};

function validate(input: PersonActionInput): string | null {
  if (!input.name.trim()) return "Имя не может быть пустым";
  if (!isValidISODate(input.birthDate)) return "Некорректная дата рождения";
  if (input.birthDate < TIMELINE_MIN_DATE || input.birthDate > TIMELINE_MAX_DATE) {
    return "Дата рождения вне диапазона";
  }
  return null;
}

export async function createPersonAction(input: PersonActionInput): Promise<PersonResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const id = createPerson({
    name: input.name.trim(),
    birthDate: input.birthDate,
    hasYear: input.hasYear ? 1 : 0,
  });
  revalidatePath("/");
  return { ok: true, id };
}

export async function updatePersonAction(
  id: number,
  input: PersonActionInput,
): Promise<PersonResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  updatePerson(id, {
    name: input.name.trim(),
    birthDate: input.birthDate,
    hasYear: input.hasYear ? 1 : 0,
  });
  revalidatePath("/");
  return { ok: true };
}

export async function deletePersonAction(id: number): Promise<PersonResult> {
  const person = getPerson(id);
  if (person?.photo) deleteMediaFile(person.photo);
  deletePerson(id);
  revalidatePath("/");
  return { ok: true };
}

export async function setPersonPhotoAction(
  id: number,
  formData: FormData,
): Promise<PersonPhotoResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Нет файла" };

  const res = await saveMediaFile(file);
  if (!res.ok) return { ok: false, error: res.error };

  const prev = getPerson(id);
  setPersonPhoto(id, res.relPath);
  if (prev?.photo) deleteMediaFile(prev.photo);
  revalidatePath("/");
  return { ok: true, photo: res.relPath };
}

export async function removePersonPhotoAction(id: number): Promise<PersonPhotoResult> {
  const person = getPerson(id);
  if (person?.photo) deleteMediaFile(person.photo);
  setPersonPhoto(id, null);
  revalidatePath("/");
  return { ok: true, photo: null };
}
