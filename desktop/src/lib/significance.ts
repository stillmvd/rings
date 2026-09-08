import type { Significance } from "./constants";

export type SignificanceMeta = {
  level: Significance;
  label: string;
  color: string;
  onColor: string;
  dotRadius: number;
  hollow: boolean;
  minLodRank: 0 | 1 | 2;
};

export const SIGNIFICANCE: Record<Significance, SignificanceMeta> = {
  1: {
    level: 1,
    label: "Обычное",
    color: "var(--rg-sig-1)",
    onColor: "var(--rg-sig-1-on)",
    dotRadius: 5,
    hollow: true,
    minLodRank: 2,
  },
  2: {
    level: 2,
    label: "Важное",
    color: "var(--rg-sig-2)",
    onColor: "var(--rg-sig-2-on)",
    dotRadius: 8,
    hollow: false,
    minLodRank: 1,
  },
  3: {
    level: 3,
    label: "Главное",
    color: "var(--rg-sig-3)",
    onColor: "var(--rg-sig-3-on)",
    dotRadius: 12,
    hollow: false,
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

export function isVisibleAtLod(level: number, lodRank: 0 | 1 | 2): boolean {
  return lodRank >= getSignificanceMeta(level).minLodRank;
}
