import {
  argbFromHex,
  customColor,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  SchemeTonalSpot,
} from "@material/material-color-utilities";

export const DEFAULT_SEED = "#6750A4";

type SigSpec = { slug: string; base: string };

const SIGNIFICANCE: SigSpec[] = [
  { slug: "1", base: "#64748b" },
  { slug: "2", base: "#c4f94a" },
  { slug: "3", base: "#f59e0b" },
];

type Vars = Record<string, string>;

function sysColorVars(seedHex: string, isDark: boolean): Vars {
  // Инстанс, а не статика: статические члены MaterialDynamicColors @deprecated.
  const mdc = new MaterialDynamicColors();
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(seedHex)), isDark, 0);
  const vars: Vars = {};
  for (const dc of mdc.allColors) {
    // *_palette_key_color — служебные ключи палитр, не sys-роли M3.
    if (dc.name.endsWith("_palette_key_color")) continue;
    vars[`--md-sys-color-${dc.name.replace(/_/g, "-")}`] = hexFromArgb(dc.getArgb(scheme));
  }
  return vars;
}

function significanceVars(seedHex: string, isDark: boolean): Vars {
  const source = argbFromHex(seedHex);
  const vars: Vars = {};
  for (const { slug, base } of SIGNIFICANCE) {
    const group = customColor(source, {
      value: argbFromHex(base),
      name: `sig-${slug}`,
      blend: true,
    });
    const g = isDark ? group.dark : group.light;
    vars[`--md-sig-${slug}`] = hexFromArgb(g.color);
    vars[`--md-sig-${slug}-on`] = hexFromArgb(g.onColor);
    vars[`--md-sig-${slug}-on-container`] = hexFromArgb(g.onColorContainer);
  }
  return vars;
}

export function buildThemeVars(seedHex: string, isDark: boolean): Vars {
  return { ...sysColorVars(seedHex, isDark), ...significanceVars(seedHex, isDark) };
}

function block(selector: string, vars: Vars): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `${selector}{${body}}`;
}

// Оба набора в одном листе: light под :root/[data-theme=light], dark под [data-theme=dark].
// Инжектится строкой в layout — токены доступны до гидрации, без вспышки нестилизованной палитры.
export function themeStyleSheet(seedHex: string = DEFAULT_SEED): string {
  return (
    block(":root,[data-theme='light']", buildThemeVars(seedHex, false)) +
    block("[data-theme='dark']", buildThemeVars(seedHex, true))
  );
}
