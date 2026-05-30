import type { Significance } from "./constants";

export type SignificanceMeta = {
  level: Significance;
  label: string;
  /** HEX-цвет точки (для Canvas; совпадает с токеном --tl-sig-N). */
  color: string;
  /** Радиус точки в px при базовом масштабе. */
  dotRadius: number;
  /** Обводка для выделения самых важных событий. */
  ring: boolean;
  ringColor: string | null;
  /**
   * Минимальный ранг LOD, при котором событие видно:
   * 0 = видно всегда (даже на годах), 1 = от месяцев, 2 = только на днях/неделях.
   */
  minLodRank: 0 | 1 | 2;
};

export const SIGNIFICANCE: Record<Significance, SignificanceMeta> = {
  1: {
    level: 1,
    label: "Обычное",
    color: "#64748b",
    dotRadius: 4,
    ring: false,
    ringColor: null,
    minLodRank: 2,
  },
  2: {
    level: 2,
    label: "Важное",
    color: "#c4f94a",
    dotRadius: 6,
    ring: false,
    ringColor: null,
    minLodRank: 1,
  },
  3: {
    level: 3,
    label: "Самое важное",
    color: "#f59e0b",
    dotRadius: 9,
    ring: true,
    ringColor: "#fbbf24",
    minLodRank: 0,
  },
};

export const SIGNIFICANCE_LIST: SignificanceMeta[] = [
  SIGNIFICANCE[3],
  SIGNIFICANCE[2],
  SIGNIFICANCE[1],
];

export function getSignificanceMeta(level: number): SignificanceMeta {
  return SIGNIFICANCE[(level as Significance) in SIGNIFICANCE ? (level as Significance) : 1];
}

/** Видно ли событие данной значимости при текущем ранге LOD (0=годы,1=месяцы,2=дни). */
export function isVisibleAtLod(level: number, lodRank: 0 | 1 | 2): boolean {
  return lodRank >= getSignificanceMeta(level).minLodRank;
}
