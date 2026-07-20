// Категорийная шкала: единые L=0.7 и C≈0.125 в OKLCH, оттенок равномерно по кругу.
// Перцептивно равные и приглушённые — не кислотные, читаются как точка-метка в обеих темах.
export const CATEGORY_COLORS = [
  "#e27e76", // red
  "#dd8556", // orange
  "#d08f3c", // amber
  "#ba9c32", // yellow
  "#9ca743", // lime
  "#77b061", // green
  "#4ab683", // emerald
  "#00b7a5", // teal
  "#00b3c2", // cyan
  "#2caddb", // sky
  "#5da3e9", // blue
  "#8498ec", // indigo
  "#a48ee4", // violet
  "#be85d1", // purple
  "#d27eb7", // pink
  "#de7b98", // rose
] as const;

export const DEFAULT_CATEGORY_COLOR = "#9aa0a6";

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
