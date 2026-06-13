"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/db/queries/settings";

export type SettingResult = { ok: true } | { ok: false; error: string };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export async function setSeedAction(hex: string): Promise<SettingResult> {
  if (!HEX_COLOR.test(hex)) return { ok: false, error: "Некорректный цвет" };
  setSetting("theme.seed", hex);
  // Build-time seed читается в layout — обновляем статическую страницу под новое значение.
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}
