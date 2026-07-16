export type Lod = "years" | "months" | "days";

export const LOD_RANK: Record<Lod, 0 | 1 | 2> = {
  years: 0,
  months: 1,
  days: 2,
};

const RANK_LOD: Lod[] = ["years", "months", "days"];

const T_YEARS_MONTHS = 0.6;
const T_MONTHS_DAYS = 8;
const HYSTERESIS = 0.15;

const UP_0 = T_YEARS_MONTHS * (1 + HYSTERESIS);
const DOWN_1 = T_YEARS_MONTHS * (1 - HYSTERESIS);
const UP_1 = T_MONTHS_DAYS * (1 + HYSTERESIS);
const DOWN_2 = T_MONTHS_DAYS * (1 - HYSTERESIS);

export function baseLod(pxPerDay: number): Lod {
  if (pxPerDay < T_YEARS_MONTHS) return "years";
  if (pxPerDay < T_MONTHS_DAYS) return "months";
  return "days";
}

// LOD с гистерезисом относительно предыдущего значения (без мерцания на границе).
export function computeLod(pxPerDay: number, prev: Lod | null): Lod {
  if (prev === null) return baseLod(pxPerDay);
  let rank: number = LOD_RANK[prev];

  while (rank < 2) {
    const up = rank === 0 ? UP_0 : UP_1;
    if (pxPerDay >= up) rank++;
    else break;
  }
  while (rank > 0) {
    const down = rank === 1 ? DOWN_1 : DOWN_2;
    if (pxPerDay < down) rank--;
    else break;
  }
  return RANK_LOD[rank];
}

export const lodRank = (lod: Lod): 0 | 1 | 2 => LOD_RANK[lod];
