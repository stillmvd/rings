import { themeStyleSheet, DEFAULT_SEED } from "./dynamic-color";

// Пресеты seed для dynamic color — разнообразные hue, все дают приятную M3-схему.
export const SEED_PRESETS: { hex: string; name: string }[] = [
  { hex: "#6750A4", name: "Фиолетовый" },
  { hex: "#5B5891", name: "Индиго" },
  { hex: "#00658E", name: "Голубой" },
  { hex: "#4A6363", name: "Бирюзовый" },
  { hex: "#386A20", name: "Зелёный" },
  { hex: "#6E5D00", name: "Янтарь" },
  { hex: "#9A4521", name: "Терракот" },
  { hex: "#B3261E", name: "Красный" },
  { hex: "#8C4A60", name: "Розовый" },
  { hex: "#7D5260", name: "Сливовый" },
];

const STYLE_ID = "md-theme";
const LS_SEED = "theme.seed";
// Кэшируем готовый CSS — inline head-скрипт применяет его до первого paint (анти-вспышка).
const LS_SHEET = "md-theme-sheet";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidSeed(hex: string): boolean {
  return HEX_COLOR.test(hex);
}

// Пересчитать палитру (оба набора light+dark) и применить к документу немедленно.
export function applySeed(seedHex: string): void {
  const css = themeStyleSheet(seedHex);
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
  try {
    localStorage.setItem(LS_SEED, seedHex);
    localStorage.setItem(LS_SHEET, css);
  } catch {
    // localStorage недоступен — live-применение всё равно сработало.
  }
}

export function readStoredSeed(): string {
  try {
    return localStorage.getItem(LS_SEED) ?? DEFAULT_SEED;
  } catch {
    return DEFAULT_SEED;
  }
}

// Маленький скрипт без модулей: в <head> перезаписывает md-theme сохранённым CSS до paint.
export const SEED_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem('${LS_SHEET}');if(s){var e=document.getElementById('${STYLE_ID}');if(e)e.textContent=s;}}catch(e){}})();`;
