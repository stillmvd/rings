import { addDays, addWeeks, addMonths, addYears, format, parseISO } from "date-fns";
import { toISO } from "./dates";

export type RepeatKind = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
export type RepeatUnit = "day" | "week";

export const REPEAT_OPTIONS: { value: RepeatKind; label: string }[] = [
  { value: "none", label: "Без повтора" },
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "yearly", label: "Ежегодно" },
  { value: "custom", label: "Каждые N…" },
];

export function nowLocalMinuteISO(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

// Первое вхождение повтора строго позже afterISO; для разовых — null.
export function nextOccurrence(
  dateISO: string,
  repeat: RepeatKind,
  repeatEvery: number | null,
  repeatUnit: RepeatUnit | null,
  afterISO: string,
): string | null {
  if (repeat === "none") return null;
  const every = Math.max(1, repeatEvery ?? 1);
  const step = (d: Date): Date => {
    switch (repeat) {
      case "daily":
        return addDays(d, 1);
      case "weekly":
        return addWeeks(d, 1);
      case "monthly":
        return addMonths(d, 1);
      case "yearly":
        return addYears(d, 1);
      default:
        return repeatUnit === "week" ? addWeeks(d, every) : addDays(d, every);
    }
  };
  let d = parseISO(dateISO);
  const limit = afterISO > dateISO ? afterISO : dateISO;
  do {
    d = step(d);
  } while (toISO(d) <= limit);
  return toISO(d);
}
