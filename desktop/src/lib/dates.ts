import { format, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";

export const ISO_DATE = "yyyy-MM-dd";

const pad = (n: number) => String(n).padStart(2, "0");

export function todayISO(): string {
  return format(new Date(), ISO_DATE);
}

/** ISO 'YYYY-MM-DD' → миллисекунды UTC-полуночи (стабильная ось без DST-сдвигов). */
export function isoToMs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Миллисекунды → ISO 'YYYY-MM-DD' (по UTC). */
export function msToISO(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function toISO(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, ISO_DATE);
}

export function formatRu(date: Date | string, pattern = "d MMMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, pattern, { locale: ru });
}

export const formatFullRu = (date: Date | string) => formatRu(date, "d MMMM yyyy");
export const formatDayMonthRu = (date: Date | string) => formatRu(date, "d MMM");
export const formatMonthShortRu = (date: Date | string) => formatRu(date, "LLL");
export const formatMonthRu = (date: Date | string) => formatRu(date, "LLLL yyyy");
export const formatWeekdayShortRu = (date: Date | string) => formatRu(date, "EEEEEE");
export const formatWeekdayFullRu = (date: Date | string) => formatRu(date, "EEEE");
export const formatYear = (date: Date | string) => formatRu(date, "yyyy");
export const formatDayNum = (date: Date | string) => formatRu(date, "d");
