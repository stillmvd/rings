import "server-only";
import { format, startOfYear, addDays } from "date-fns";
import { getSetting, setSetting } from "@/db/queries/settings";

const FIRST_SUPPORTED_YEAR = 2013;

async function fetchBitmap(year: number): Promise<string | null> {
  try {
    const res = await fetch(`https://isdayoff.ru/api/getdata?year=${year}&cc=ru`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    return /^[0124]+$/.test(text) && text.length >= 365 ? text : null;
  } catch {
    return null;
  }
}

// ISO-даты нерабочих дней года (праздники + переносы РФ). null — данных нет (fallback на сб/вс).
// Прошлые годы кешируются в БД навсегда; текущий и будущие запрашиваются заново (переносы уточняются).
export async function getNonWorkingISO(year: number): Promise<string[] | null> {
  if (year < FIRST_SUPPORTED_YEAR) return null;

  const key = `workcal:${year}`;
  const cacheable = year < new Date().getFullYear();
  let bitmap = cacheable ? getSetting(key) : null;

  if (!bitmap) {
    bitmap = await fetchBitmap(year);
    if (!bitmap) return null;
    if (cacheable) setSetting(key, bitmap);
  }

  const start = startOfYear(new Date(year, 0, 1));
  const out: string[] = [];
  for (let i = 0; i < bitmap.length; i++) {
    if (bitmap[i] === "1") out.push(format(addDays(start, i), "yyyy-MM-dd"));
  }
  return out;
}
