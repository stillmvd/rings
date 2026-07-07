import type { Significance } from "./constants";

export type SignificanceMeta = {
  level: Significance;
  label: string;
  /** Цвет точки — M3-роль значимости (--md-sig-N, гармонизирована к seed). Для DOM-стилей. */
  color: string;
  /** Контрастный on-цвет для контента поверх color (--md-sig-N-on). */
  onColor: string;
  /**
   * Приглушённый тон для крупных заливок (плейсхолдеры без обложки).
   * Не сырая M3 container-роль (на некоторых hue она уходит в грязный тёмный тон),
   * а подмешивание --md-sig-N к поверхности — как для цвета категории.
   */
  container: string;
  /** Насыщенный контент поверх container (--md-sig-N-on-container). */
  onContainer: string;
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
    color: "var(--md-sig-1)",
    onColor: "var(--md-sig-1-on)",
    container: "color-mix(in srgb, var(--md-sig-1) 20%, var(--md-sys-color-surface-container-high))",
    onContainer: "var(--md-sig-1-on-container)",
    dotRadius: 4,
    ring: false,
    ringColor: null,
    minLodRank: 2,
  },
  2: {
    level: 2,
    label: "Важное",
    color: "var(--md-sig-2)",
    onColor: "var(--md-sig-2-on)",
    container: "color-mix(in srgb, var(--md-sig-2) 20%, var(--md-sys-color-surface-container-high))",
    onContainer: "var(--md-sig-2-on-container)",
    dotRadius: 6,
    ring: false,
    ringColor: null,
    minLodRank: 1,
  },
  3: {
    level: 3,
    label: "Самое важное",
    color: "var(--md-sig-3)",
    onColor: "var(--md-sig-3-on)",
    container: "color-mix(in srgb, var(--md-sig-3) 20%, var(--md-sys-color-surface-container-high))",
    onContainer: "var(--md-sig-3-on-container)",
    dotRadius: 9,
    ring: true,
    ringColor: "var(--md-sig-3-on-container)",
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
