import { MS_PER_DAY } from "./projection";

/** Начало каждого года (UTC ms) в диапазоне [fromMs, toMs], с запасом по краям. */
export function eachYearStart(fromMs: number, toMs: number): number[] {
  const start = new Date(fromMs);
  let y = start.getUTCFullYear();
  const out: number[] = [];
  // на один год раньше — для частично видимого левого года
  for (let year = y - 1; ; year++) {
    const ms = Date.UTC(year, 0, 1);
    if (ms > toMs + MS_PER_DAY) break;
    if (ms >= fromMs - 366 * MS_PER_DAY) out.push(ms);
    y = year;
    if (year - start.getUTCFullYear() > 1000) break; // страховка
  }
  return out;
}

/** Начало каждого месяца (UTC ms) в диапазоне. */
export function eachMonthStart(fromMs: number, toMs: number): number[] {
  const start = new Date(fromMs);
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth() - 1; // на месяц раньше
  const out: number[] = [];
  for (;;) {
    const ms = Date.UTC(year, month, 1);
    if (ms > toMs + MS_PER_DAY) break;
    if (ms >= fromMs - 62 * MS_PER_DAY) out.push(ms);
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return out;
}

/** Начало каждого дня (UTC ms) в диапазоне. */
export function eachDayStart(fromMs: number, toMs: number): number[] {
  const startDay = Math.floor(fromMs / MS_PER_DAY) * MS_PER_DAY;
  const out: number[] = [];
  for (let ms = startDay - MS_PER_DAY; ms <= toMs + MS_PER_DAY; ms += MS_PER_DAY) {
    out.push(ms);
  }
  return out;
}

/**
 * Недельные делители месяца: месяц визуально делится на 4 части по числам 1, 8, 15, 22.
 * Возвращает UTC ms этих дней для всех месяцев диапазона.
 */
export function eachWeekDivider(fromMs: number, toMs: number): number[] {
  const months = eachMonthStart(fromMs, toMs);
  const out: number[] = [];
  for (const m of months) {
    const d = new Date(m);
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth();
    for (const day of [1, 8, 15, 22]) {
      const ms = Date.UTC(y, mo, day);
      if (ms >= fromMs - 31 * MS_PER_DAY && ms <= toMs + MS_PER_DAY) out.push(ms);
    }
  }
  return out;
}

/** Это 1 января? (для усиленной подписи года в режиме месяцев) */
export function isJanuary(ms: number): boolean {
  const d = new Date(ms);
  return d.getUTCMonth() === 0;
}
