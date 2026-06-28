"use server";

import { revalidatePath } from "next/cache";
import {
  BACKUP_VERSION,
  getBackupData,
  importBackupData,
  type BackupData,
} from "@/db/queries/backup";

export async function exportDataAction(): Promise<string> {
  return JSON.stringify(getBackupData(), null, 2);
}

export type ImportResult =
  | { ok: true; categories: number; events: number; people: number }
  | { ok: false; error: string };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function normalize(parsed: Record<string, unknown>): BackupData | string {
  if (typeof parsed.version !== "number") return "Отсутствует версия бэкапа";
  if (parsed.version > BACKUP_VERSION) return "Файл создан более новой версией приложения";
  if (
    !Array.isArray(parsed.categories) ||
    !Array.isArray(parsed.events) ||
    !Array.isArray(parsed.settings)
  ) {
    return "Неверная структура данных";
  }

  const categories: BackupData["categories"] = [];
  for (const raw of parsed.categories) {
    if (
      !isObj(raw) ||
      typeof raw.id !== "number" ||
      typeof raw.name !== "string" ||
      typeof raw.icon !== "string" ||
      typeof raw.color !== "string"
    ) {
      return "Повреждены данные категорий";
    }
    categories.push({
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      color: raw.color,
      parent_id: typeof raw.parent_id === "number" ? raw.parent_id : null,
      sort_order: typeof raw.sort_order === "number" ? raw.sort_order : 0,
      is_default: raw.is_default === 1 ? 1 : 0,
    });
  }

  const now = new Date().toISOString();
  const events: BackupData["events"] = [];
  for (const raw of parsed.events) {
    if (
      !isObj(raw) ||
      typeof raw.id !== "number" ||
      typeof raw.title !== "string" ||
      typeof raw.date !== "string" ||
      typeof raw.significance !== "number"
    ) {
      return "Повреждены данные событий";
    }
    events.push({
      id: raw.id,
      title: raw.title,
      description: typeof raw.description === "string" ? raw.description : null,
      date: raw.date,
      end_date: typeof raw.end_date === "string" ? raw.end_date : null,
      significance: raw.significance,
      category_id: typeof raw.category_id === "number" ? raw.category_id : null,
      track: raw.track === 1 ? 1 : 0,
      created_at: typeof raw.created_at === "string" ? raw.created_at : now,
      updated_at: typeof raw.updated_at === "string" ? raw.updated_at : now,
    });
  }

  // people добавлены в версии 2 — у старых бэкапов поля нет, нормализуем к пустому списку.
  const people: BackupData["people"] = [];
  const rawPeople = Array.isArray(parsed.people) ? parsed.people : [];
  for (const raw of rawPeople) {
    if (
      !isObj(raw) ||
      typeof raw.id !== "number" ||
      typeof raw.name !== "string" ||
      typeof raw.birth_date !== "string"
    ) {
      return "Повреждены данные людей";
    }
    people.push({
      id: raw.id,
      name: raw.name,
      birth_date: raw.birth_date,
      has_year: raw.has_year === 0 ? 0 : 1,
      photo: typeof raw.photo === "string" ? raw.photo : null,
      sort_order: typeof raw.sort_order === "number" ? raw.sort_order : 0,
      created_at: typeof raw.created_at === "string" ? raw.created_at : now,
    });
  }

  const settings: BackupData["settings"] = [];
  for (const raw of parsed.settings) {
    if (!isObj(raw) || typeof raw.key !== "string" || typeof raw.value !== "string") {
      return "Повреждены данные настроек";
    }
    settings.push({ key: raw.key, value: raw.value });
  }

  return { version: parsed.version, exportedAt: now, categories, events, people, settings };
}

export async function importDataAction(json: string): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "Файл не является корректным JSON" };
  }
  if (!isObj(parsed)) return { ok: false, error: "Неверный формат файла" };

  const data = normalize(parsed);
  if (typeof data === "string") return { ok: false, error: data };

  const res = importBackupData(data);
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true, ...res };
}
