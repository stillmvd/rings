import { useEffect } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { addDays, parseISO } from "date-fns";
import { createLocalStore } from "./localStore";
import { todayISO, toISO, formatFullRu } from "./dates";
import { isBirthdayToday, formatTurningAge } from "./birthday";
import { nowLocalMinuteISO } from "./reminders";
import { listPeople } from "@/db/queries/people";
import { listReminders, type Reminder } from "@/db/queries/reminders";
import { getSetting, setSetting } from "@/db/queries/settings";

const LAST_NOTICE_KEY = "last_birthday_notice_date";
const REMINDER_STATE_KEY = "reminder_notice_state";

// Приложение живёт в трее сутками: интервальная проверка переживает сон ПК, в отличие
// от одного таймера до полуночи. От дублей защищает дата в settings, а не частота.
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export const notifyBirthdaysStore = createLocalStore<"1" | "0">("rings.notifyBirthdays", "1");
export const notifyRemindersStore = createLocalStore<"1" | "0">("rings.notifyReminders", "1");

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

// Ключи "<id>@<date>" и "pre:<id>@<date>" → момент последнего уведомления.
// Дата в ключе делает вхождение повторяющегося напоминания уникальным.
type ReminderNoticeState = Record<string, string>;

async function loadReminderState(): Promise<ReminderNoticeState> {
  try {
    return JSON.parse((await getSetting(REMINDER_STATE_KEY)) ?? "{}") as ReminderNoticeState;
  } catch {
    return {};
  }
}

function dueMoment(r: Reminder): string {
  const base = r.time ? `${r.date}T${r.time}` : `${r.date}T00:00`;
  return r.snoozed_until && r.snoozed_until > base ? r.snoozed_until : base;
}

const minutesBetween = (fromISO: string, untilISO: string): number =>
  (Date.parse(untilISO) - Date.parse(fromISO)) / 60000;

export async function checkReminders(): Promise<void> {
  if (notifyRemindersStore.get() !== "1") return;

  const active = (await listReminders()).filter((r) => r.completed_at === null);
  const now = nowLocalMinuteISO();
  const today = now.slice(0, 10);
  const state = await loadReminderState();
  const next: ReminderNoticeState = {};
  const toasts: { title: string; body?: string }[] = [];
  const missedTitles: string[] = [];

  for (const r of active) {
    const due = dueMoment(r);
    const dueKey = `${r.id}@${r.date}`;
    if (due <= now) {
      const prev = state[dueKey];
      if (!prev) {
        if (due.slice(0, 10) < today) missedTitles.push(r.title);
        else toasts.push({ title: r.title, body: r.note ?? undefined });
        next[dueKey] = now;
      } else if (r.nag === 1 && minutesBetween(prev, now) >= (r.nag_interval_min ?? 30)) {
        toasts.push({ title: r.title, body: r.note ?? undefined });
        next[dueKey] = now;
      } else {
        next[dueKey] = prev;
      }
    }

    if (r.pre_notify_days > 0 && today < r.date) {
      const preStart = toISO(addDays(parseISO(r.date), -r.pre_notify_days));
      if (today >= preStart) {
        const preKey = `pre:${r.id}@${r.date}`;
        if (!state[preKey]) {
          toasts.push({
            title: `Скоро: ${r.title}`,
            body: formatFullRu(r.date) + (r.time ? `, ${r.time}` : ""),
          });
          next[preKey] = now;
        } else {
          next[preKey] = state[preKey];
        }
      }
    }
  }

  const changed = JSON.stringify(next) !== JSON.stringify(state);
  const hasNotices = toasts.length > 0 || missedTitles.length > 0;

  if (hasNotices) {
    if (!(await ensurePermission())) return;
    if (missedTitles.length > 3) {
      sendNotification({ title: `Пропущено напоминаний: ${missedTitles.length}` });
    } else {
      missedTitles.forEach((t) => sendNotification({ title: `Пропущено: ${t}` }));
    }
    toasts.forEach((t) => sendNotification({ title: t.title, body: t.body }));
  }
  if (changed) await setSetting(REMINDER_STATE_KEY, JSON.stringify(next));
}

export function useNotifications() {
  useEffect(() => {
    const run = () => {
      checkBirthdays().catch(() => {});
      checkReminders().catch(() => {});
    };
    run();
    const timer = setInterval(run, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
}
