import { useEffect } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { createLocalStore } from "./localStore";
import { todayISO } from "./dates";
import { isBirthdayToday, formatTurningAge } from "./birthday";
import { listPeople } from "@/db/queries/people";
import { getSetting, setSetting } from "@/db/queries/settings";

const LAST_NOTICE_KEY = "last_birthday_notice_date";

// Приложение живёт в трее сутками: интервальная проверка переживает сон ПК, в отличие
// от одного таймера до полуночи. От дублей защищает дата в settings, а не частота.
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export const notifyBirthdaysStore = createLocalStore<"1" | "0">("rings.notifyBirthdays", "1");

async function ensurePermission(): Promise<boolean> {
  if (await isPermissionGranted()) return true;
  return (await requestPermission()) === "granted";
}

// Отметка вида "2026-07-17:3,5" — дата и уже поздравленные. Дедуп по людям, а не по дате:
// иначе человек, добавленный после первой проверки, остался бы без уведомления до завтра.
function parseNotified(stored: string | null, today: string): Set<string> {
  const [date, ids] = (stored ?? "").split(":");
  if (date !== today || !ids) return new Set();
  return new Set(ids.split(","));
}

export async function checkBirthdays(): Promise<void> {
  if (notifyBirthdaysStore.get() !== "1") return;

  const today = todayISO();
  const born = (await listPeople()).filter((p) => isBirthdayToday(p.birth_date));
  if (born.length === 0) return;

  const notified = parseNotified(await getSetting(LAST_NOTICE_KEY), today);
  const fresh = born.filter((p) => !notified.has(String(p.id)));
  if (fresh.length === 0) return;

  if (!(await ensurePermission())) return;

  for (const person of fresh) {
    const turning = formatTurningAge(person.birth_date, person.has_year);
    sendNotification({
      title: `Сегодня день рождения у ${person.name}`,
      body: turning ? `Исполняется ${turning}` : "С праздником!",
    });
  }

  const done = [...notified, ...fresh.map((p) => String(p.id))];
  await setSetting(LAST_NOTICE_KEY, `${today}:${done.join(",")}`);
}

export function useBirthdayNotifications() {
  useEffect(() => {
    checkBirthdays().catch(() => {});
    const timer = setInterval(() => {
      checkBirthdays().catch(() => {});
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
}
