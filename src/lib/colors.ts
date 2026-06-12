export const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#64748b", // slate
  "#78716c", // stone
  "#0ea5e9", // sky
] as const;

export const DEFAULT_CATEGORY_COLOR = "#64748b";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

/**
 * Контрастный цвет контента (текст/иконка) поверх произвольного hex-фона.
 * YIQ-яркость с порогом 140: тёмный фон → белый контент, светлый → почти-чёрный.
 * Для фона из M3-роли значимости используйте готовый --md-sig-N-on (он уже контрастен).
 */
export function onColorFor(hex: string): string {
  if (!HEX_COLOR.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#0a0a0b" : "#ffffff";
}
