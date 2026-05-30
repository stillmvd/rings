"use server";

import { revalidatePath } from "next/cache";
import { createEvent, deleteEvent, updateEvent } from "@/db/queries/events";
import { MIN_DATE, isValidISODate } from "@/lib/constants";

export type EventResult = { ok: true; id?: number } | { ok: false; error: string };

type EventActionInput = {
  title: string;
  description: string;
  date: string;
  significance: number;
  categoryId: number | null;
};

function validate(input: EventActionInput): string | null {
  if (!input.title.trim()) return "Название не может быть пустым";
  if (!isValidISODate(input.date)) return "Некорректная дата";
  if (input.date < MIN_DATE) return `Дата не может быть раньше ${MIN_DATE}`;
  if (![1, 2, 3].includes(input.significance)) return "Неверная значимость";
  return null;
}

export async function createEventAction(input: EventActionInput): Promise<EventResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const id = createEvent({
    title: input.title.trim(),
    description: input.description.trim() || null,
    date: input.date,
    significance: input.significance,
    categoryId: input.categoryId,
  });
  revalidatePath("/");
  return { ok: true, id };
}

export async function updateEventAction(
  id: number,
  input: EventActionInput,
): Promise<EventResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  updateEvent(id, {
    title: input.title.trim(),
    description: input.description.trim() || null,
    date: input.date,
    significance: input.significance,
    categoryId: input.categoryId,
  });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEventAction(id: number): Promise<EventResult> {
  deleteEvent(id);
  revalidatePath("/");
  return { ok: true };
}
