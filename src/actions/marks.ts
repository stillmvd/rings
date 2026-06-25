"use server";

import { revalidatePath } from "next/cache";
import { createMark, deleteMark } from "@/db/queries/marks";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";

export type MarkResult = { ok: true; id?: number } | { ok: false; error: string };

export async function createMarkAction(input: {
  date: string;
  markTypeId: number | null;
}): Promise<MarkResult> {
  if (!isValidISODate(input.date)) return { ok: false, error: "Некорректная дата" };
  if (input.date < TIMELINE_MIN_DATE || input.date > TIMELINE_MAX_DATE) {
    return { ok: false, error: "Дата вне диапазона таймлайна" };
  }
  if (input.markTypeId == null) return { ok: false, error: "Выберите тип отметки" };

  const id = createMark({ date: input.date, markTypeId: input.markTypeId });
  revalidatePath("/");
  return { ok: true, id };
}

export async function deleteMarkAction(id: number): Promise<MarkResult> {
  deleteMark(id);
  revalidatePath("/");
  return { ok: true };
}
