import { intervalToDuration, differenceInCalendarDays, parseISO } from "date-fns";
import { todayISO } from "./dates";

type PluralForms = [one: string, few: string, many: string];

const YEARS: PluralForms = ["год", "года", "лет"];
const MONTHS: PluralForms = ["месяц", "месяца", "месяцев"];
const DAYS: PluralForms = ["день", "дня", "дней"];

export function pluralRu(n: number, [one, few, many]: PluralForms): string {
  const abs = Math.abs(n) % 100;
  const tail = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (tail > 1 && tail < 5) return few;
  if (tail === 1) return one;
  return many;
}

const unit = (n: number, forms: PluralForms) => `${n} ${pluralRu(n, forms)}`;

export function isFuture(dateISO: string): boolean {
  return dateISO > todayISO();
}

export function isPast(dateISO: string): boolean {
  return dateISO <= todayISO();
}

/** Разница в годах/месяцах/днях между двумя датами (from ≤ to). Только ненулевые единицы. */
export function formatYMD(fromISO: string, toISO: string): string {
  const d = intervalToDuration({ start: parseISO(fromISO), end: parseISO(toISO) });
  const years = d.years ?? 0;
  const months = d.months ?? 0;
  const days = d.days ?? 0;
  const parts: string[] = [];
  if (years) parts.push(unit(years, YEARS));
  if (months) parts.push(unit(months, MONTHS));
  if (days) parts.push(unit(days, DAYS));
  return parts.length ? parts.join(" ") : "сегодня";
}

export const elapsedSince = (dateISO: string) => formatYMD(dateISO, todayISO());
export const remainingUntil = (dateISO: string) => formatYMD(todayISO(), dateISO);

export function totalDaysCount(dateISO: string): number {
  return Math.abs(differenceInCalendarDays(parseISO(dateISO), parseISO(todayISO())));
}

export function formatTotalDays(dateISO: string): string {
  const n = totalDaysCount(dateISO);
  return `${n.toLocaleString("ru-RU")} ${pluralRu(n, DAYS)}`;
}

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

// 29 февраля в невисокосный год отмечаем 28-го.
function anniversaryInYear(origin: Date, year: number): Date {
  const month = origin.getMonth();
  const day = origin.getDate();
  if (month === 1 && day === 29 && !isLeapYear(year)) return new Date(year, 1, 28);
  return new Date(year, month, day);
}

/** Ближайшая будущая годовщина прошлого события: какая по счёту и сколько дней до неё. */
export function nextAnniversary(dateISO: string): { ordinal: number; daysUntil: number } | null {
  const origin = parseISO(dateISO);
  const today = parseISO(todayISO());
  if (differenceInCalendarDays(today, origin) < 0) return null;

  let year = today.getFullYear();
  if (differenceInCalendarDays(anniversaryInYear(origin, year), today) < 0) year += 1;

  return {
    ordinal: year - origin.getFullYear(),
    daysUntil: differenceInCalendarDays(anniversaryInYear(origin, year), today),
  };
}

export function formatNextAnniversary(dateISO: string): string | null {
  const a = nextAnniversary(dateISO);
  if (!a) return null;
  const label = unit(a.ordinal, YEARS);
  if (a.daysUntil === 0) return `${label} · сегодня`;
  return `${label} · через ${unit(a.daysUntil, DAYS)}`;
}
