"use server";

import { revalidatePath } from "next/cache";
import {
  addMedia,
  deleteMedia,
  listMediaByEvent,
  reorderMedia,
  type EventMedia,
} from "@/db/queries/media";
import { saveMediaFile, deleteMediaFile } from "@/lib/media";

export type MediaResult = { ok: true; media: EventMedia[] } | { ok: false; error: string };

export async function listMediaAction(eventId: number): Promise<EventMedia[]> {
  return listMediaByEvent(eventId);
}

export async function uploadMediaAction(
  eventId: number,
  formData: FormData,
): Promise<MediaResult> {
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: "Нет файлов для загрузки" };

  let added = 0;
  for (const file of files) {
    const res = await saveMediaFile(file);
    if (!res.ok) {
      if (added > 0) revalidatePath("/");
      return { ok: false, error: res.error };
    }
    addMedia(eventId, res.relPath);
    added++;
  }
  revalidatePath("/");
  return { ok: true, media: listMediaByEvent(eventId) };
}

export async function deleteMediaAction(eventId: number, id: number): Promise<MediaResult> {
  const relPath = deleteMedia(id);
  if (relPath) deleteMediaFile(relPath);
  revalidatePath("/");
  return { ok: true, media: listMediaByEvent(eventId) };
}

export async function reorderMediaAction(
  eventId: number,
  orderedIds: number[],
): Promise<MediaResult> {
  reorderMedia(eventId, orderedIds);
  revalidatePath("/");
  return { ok: true, media: listMediaByEvent(eventId) };
}
