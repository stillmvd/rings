// Категорийная шкала: оттенок равномерно по кругу, светлота через одну — 62 и 78%
// при C=0.10 в OKLCH. Соседние ступени расходятся не только тоном, но и светлотой,
// поэтому различимы даже точкой в 7 px; хрома ниже акцентной, чтобы жёлтый оставался
// самым громким цветом на экране.
export const CATEGORY_COLORS = [
  "#bb6d6d", // red
  "#eea284", // orange
  "#af7940", // amber
  "#d3b46a", // yellow
  "#8a8b3e", // lime
  "#9fc582", // green
  "#50986b", // emerald
  "#68cdb7", // teal
  "#1c989e", // cyan
  "#67c6e6", // sky
  "#4e8cbe", // blue
  "#9bb6f8", // indigo
  "#857bbe", // violet
  "#cda5e6", // purple
  "#ab6e9e", // pink
  "#ec9cb8", // rose
] as const;

export const DEFAULT_CATEGORY_COLOR = "#a6a6a6";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

/**
 * Контрастный цвет контента (текст/иконка) поверх произвольного hex-фона.
 * YIQ-яркость с порогом 140: тёмный фон → белый контент, светлый → почти-чёрный.
 * Для фона из роли значимости берите готовый --rg-sig-N-on — он уже контрастен.
 */
export function onColorFor(hex: string): string {
  if (!HEX_COLOR.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#0a0a0b" : "#ffffff";
}
