import { differenceInCalendarDays, parseISO } from "date-fns";
import { todayISO } from "./dates";
import { upcomingAnniversary, unit, YEARS } from "./duration";

// Год при has_year=0 хранится фиктивным (2000): возраст и «сколько исполнится» скрыты,
// но дата ближайшего ДР считается корректно по дню и месяцу.

export function nextBirthdayISO(birthDateISO: string): string {
  return upcomingAnniversary(birthDateISO).iso;
}

export function daysUntilBirthday(birthDateISO: string): number {
  return differenceInCalendarDays(parseISO(nextBirthdayISO(birthDateISO)), parseISO(todayISO()));
}

export function isBirthdayToday(birthDateISO: string): boolean {
  return daysUntilBirthday(birthDateISO) === 0;
}

// Сколько исполнится в ближайший день рождения. null — если год рождения неизвестен.
export function turningAge(birthDateISO: string, hasYear: number): number | null {
  if (!hasYear) return null;
  return upcomingAnniversary(birthDateISO).ordinal;
}

// Текущий полный возраст на сегодня. null — если год рождения неизвестен.
export function currentAge(birthDateISO: string, hasYear: number): number | null {
  if (!hasYear) return null;
  const { ordinal } = upcomingAnniversary(birthDateISO);
  return daysUntilBirthday(birthDateISO) === 0 ? ordinal : ordinal - 1;
}

export function formatCurrentAge(birthDateISO: string, hasYear: number): string | null {
  const age = currentAge(birthDateISO, hasYear);
  return age === null ? null : unit(age, YEARS);
}

export function formatTurningAge(birthDateISO: string, hasYear: number): string | null {
  const age = turningAge(birthDateISO, hasYear);
  return age === null ? null : unit(age, YEARS);
}
