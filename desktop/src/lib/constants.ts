/** Дата рождения — граница «прожитой жизни» (для приглушения прошлого визуально). */
export const BIRTH_DATE = "2002-03-18";

/** Границы прокрутки таймлайна (прошлое предков и долгосрочные планы). */
export const TIMELINE_MIN_DATE = "1900-01-01";
export const TIMELINE_MAX_DATE = "2100-12-31";

export const SIGNIFICANCE_VALUES = [1, 2, 3] as const;
export type Significance = (typeof SIGNIFICANCE_VALUES)[number];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
