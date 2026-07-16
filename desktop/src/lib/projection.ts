export const MS_PER_DAY = 86_400_000;
export const DAYS_PER_YEAR = 365.25;
export const DAYS_PER_MONTH = 30.4375;

// Модель видимой области горизонтального таймлайна.
// pxPerDay — масштаб; originMs — момент (UTC ms) в x=0 (левый край).
export type Viewport = {
  pxPerDay: number;
  originMs: number;
};

export function msToX(ms: number, vp: Viewport): number {
  return ((ms - vp.originMs) / MS_PER_DAY) * vp.pxPerDay;
}

export function xToMs(x: number, vp: Viewport): number {
  return vp.originMs + (x / vp.pxPerDay) * MS_PER_DAY;
}

export const dayWidth = (vp: Viewport): number => vp.pxPerDay;
export const weekWidth = (vp: Viewport): number => vp.pxPerDay * 7;
export const monthWidth = (vp: Viewport): number => vp.pxPerDay * DAYS_PER_MONTH;
export const yearWidth = (vp: Viewport): number => vp.pxPerDay * DAYS_PER_YEAR;

// Сдвиг origin так, чтобы момент ms оказался под координатой x (зум «к курсору»).
export function originForAnchor(ms: number, x: number, pxPerDay: number): number {
  return ms - (x / pxPerDay) * MS_PER_DAY;
}
