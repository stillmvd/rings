"use server";

import { revalidatePath } from "next/cache";
import {
  createMarkType,
  deleteMarkType,
  listMarkTypes,
  updateMarkType,
} from "@/db/queries/markTypes";

export type MarkTypeResult = { ok: true; id?: number } | { ok: false; error: string };

type MarkTypeActionInput = {
  name: string;
  icon: string;
  color: string;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function validate(input: MarkTypeActionInput): string | null {
  if (!input.name.trim()) return "Название не может быть пустым";
  if (!input.icon.trim()) return "Не выбрана иконка";
  if (!HEX_COLOR.test(input.color)) return "Некорректный цвет";
  return null;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/settings");
}

export async function createMarkTypeAction(input: MarkTypeActionInput): Promise<MarkTypeResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const id = createMarkType({ name: input.name.trim(), icon: input.icon.trim(), color: input.color });
  revalidateAll();
  return { ok: true, id };
}

export async function updateMarkTypeAction(
  id: number,
  input: MarkTypeActionInput,
): Promise<MarkTypeResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  updateMarkType(id, { name: input.name.trim(), icon: input.icon.trim(), color: input.color });
  revalidateAll();
  return { ok: true };
}

export async function deleteMarkTypeAction(id: number): Promise<MarkTypeResult> {
  const exists = listMarkTypes().some((t) => t.id === id);
  if (!exists) return { ok: false, error: "Тип отметки не найден" };

  deleteMarkType(id);
  revalidateAll();
  return { ok: true };
}
