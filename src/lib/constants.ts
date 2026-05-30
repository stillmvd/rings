export const MIN_DATE = "2002-03-18";

export const SIGNIFICANCE_VALUES = [1, 2, 3] as const;
export type Significance = (typeof SIGNIFICANCE_VALUES)[number];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
