# Material You: Система цвета и динамический цвет

> Справочник для веб-реализации на `@material/material-color-utilities@0.4.0` + `@material/web@2.4.1`

---

## 1. HCT — цветовое пространство

M3 использует **HCT** вместо HSL/RGB. Три компонента:

| Компонент | Диапазон | Суть |
|-----------|----------|------|
| **H** (Hue) | 0–360° | Тип цвета |
| **C** (Chroma) | 0–~120+ | Насыщенность (воспринимаемая) |
| **T** (Tone) | 0–100 | Воспринимаемая яркость (0 = чёрный, 100 = белый) |

Tone — ключевой параметр: один и тот же тон гарантирует одинаковую воспринимаемую яркость независимо от hue. Это позволяет генерировать доступные контрастные пары автоматически.

Основан на CAM16 (Color Appearance Model) + ICtCp.

```typescript
import { Hct, argbFromHex } from '@material/material-color-utilities';

const hct = Hct.fromInt(argbFromHex('#6750A4'));
console.log(hct.hue, hct.chroma, hct.tone); // ~301, ~49, ~40
```

---

## 2. Tonal Palette (тональные палитры)

Из одного **key color** генерируется палитра из **13 тонов**:

`0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100`

Все тоны сохраняют hue и chroma исходного цвета, меняется только Tone.

M3 создаёт **5 тональных палитр** из seed color:

| Палитра | Назначение | Chroma (TonalSpot) |
|---------|-----------|---------------------|
| **Primary** | Главный акцентный цвет | ~48 |
| **Secondary** | Второстепенный акцент | ~16 |
| **Tertiary** | Третий акцент (+60° hue rotation) | ~24 |
| **Neutral** | Фоны, поверхности | ~4 |
| **Neutral Variant** | Outline, surface-variant | ~8 |
| **Error** | Ошибки (фиксированный красный) | — |

```typescript
import { TonalPalette, Hct, argbFromHex, hexFromArgb } from '@material/material-color-utilities';

const palette = TonalPalette.fromHct(Hct.fromInt(argbFromHex('#6750A4')));
console.log(hexFromArgb(palette.tone(40)));  // light primary
console.log(hexFromArgb(palette.tone(80)));  // dark primary
```

---

## 3. Color Roles и CSS токены

### 3.1 Полный список токенов `--md-sys-color-*`

Всего **49 ролей** (включая Fixed и Dim варианты из spec 2021+). Базовый набор для M3 компонентов — **29 ролей**.

#### Primary / Secondary / Tertiary / Error (паттерн повторяется)

| CSS токен | camelCase (API) | Palette | Light tone | Dark tone | Назначение |
|-----------|-----------------|---------|-----------|-----------|------------|
| `--md-sys-color-primary` | `primary` | Primary | **40** | **80** | Главные интерактивные элементы, FAB |
| `--md-sys-color-on-primary` | `onPrimary` | Primary | **100** | **20** | Текст/иконки поверх primary |
| `--md-sys-color-primary-container` | `primaryContainer` | Primary | **90** | **30** | Заливка кнопок, чипов |
| `--md-sys-color-on-primary-container` | `onPrimaryContainer` | Primary | **30** | **90** | Текст поверх primary-container |
| `--md-sys-color-secondary` | `secondary` | Secondary | **40** | **80** | Второстепенные кнопки |
| `--md-sys-color-on-secondary` | `onSecondary` | Secondary | **100** | **20** | |
| `--md-sys-color-secondary-container` | `secondaryContainer` | Secondary | **90** | **30** | |
| `--md-sys-color-on-secondary-container` | `onSecondaryContainer` | Secondary | **30** | **90** | |
| `--md-sys-color-tertiary` | `tertiary` | Tertiary | **40** | **80** | Контрастный акцент |
| `--md-sys-color-on-tertiary` | `onTertiary` | Tertiary | **100** | **20** | |
| `--md-sys-color-tertiary-container` | `tertiaryContainer` | Tertiary | **90** | **30** | |
| `--md-sys-color-on-tertiary-container` | `onTertiaryContainer` | Tertiary | **30** | **90** | |
| `--md-sys-color-error` | `error` | Error | **40** | **80** | Ошибки, деструктивные действия |
| `--md-sys-color-on-error` | `onError` | Error | **100** | **20** | |
| `--md-sys-color-error-container` | `errorContainer` | Error | **90** | **30** | |
| `--md-sys-color-on-error-container` | `onErrorContainer` | Error | **30** | **90** | |

#### Surface (нейтральные поверхности)

| CSS токен | camelCase (API) | Palette | Light tone | Dark tone | Назначение |
|-----------|-----------------|---------|-----------|-----------|------------|
| `--md-sys-color-background` | `background` | Neutral | **98** | **6** | Корневой фон страницы |
| `--md-sys-color-on-background` | `onBackground` | Neutral | **10** | **90** | Текст на background |
| `--md-sys-color-surface` | `surface` | Neutral | **98** | **6** | Нейтральные поверхности |
| `--md-sys-color-on-surface` | `onSurface` | Neutral | **10** | **90** | Текст на surface |
| `--md-sys-color-surface-variant` | `surfaceVariant` | Neutral Variant | **90** | **30** | Chips, input fields background |
| `--md-sys-color-on-surface-variant` | `onSurfaceVariant` | Neutral Variant | **30** | **80** | Текст на surface-variant |
| `--md-sys-color-surface-dim` | `surfaceDim` | Neutral | ~**87** | **6** | Затемнённая поверхность (модальные оверлеи) |
| `--md-sys-color-surface-bright` | `surfaceBright` | Neutral | **98** | ~**24** | Светлая поверхность в dark теме |
| `--md-sys-color-surface-container-lowest` | `surfaceContainerLowest` | Neutral | **100** | ~**4** | Минимальный контейнер |
| `--md-sys-color-surface-container-low` | `surfaceContainerLow` | Neutral | **96** | **10** | Низкий приоритет контейнера |
| `--md-sys-color-surface-container` | `surfaceContainer` | Neutral | **94** | **12** | **Рекомендуемый дефолт** для карточек |
| `--md-sys-color-surface-container-high` | `surfaceContainerHigh` | Neutral | **92** | **17** | Высокий приоритет |
| `--md-sys-color-surface-container-highest` | `surfaceContainerHighest` | Neutral | **90** | **22** | Максимальный контейнер |
| `--md-sys-color-surface-tint` | `surfaceTint` | Primary | **40** | **80** | Тинт поверхности (elevation overlay) |

#### Inverse / Outline / Scrim / Shadow

| CSS токен | camelCase (API) | Palette | Light tone | Dark tone | Назначение |
|-----------|-----------------|---------|-----------|-----------|------------|
| `--md-sys-color-inverse-surface` | `inverseSurface` | Neutral | **20** | **90** | Снэкбары, tooltips (контраст к surface) |
| `--md-sys-color-inverse-on-surface` | `inverseOnSurface` | Neutral | **95** | **20** | Текст на inverse-surface |
| `--md-sys-color-inverse-primary` | `inversePrimary` | Primary | **80** | **40** | Ссылки на inverse-surface |
| `--md-sys-color-outline` | `outline` | Neutral Variant | **50** | **60** | Видимые границы (input borders) |
| `--md-sys-color-outline-variant` | `outlineVariant` | Neutral Variant | **80** | **30** | Разделители (dividers) |
| `--md-sys-color-shadow` | `shadow` | Neutral | **0** | **0** | Тени |
| `--md-sys-color-scrim` | `scrim` | Neutral | **0** | **0** | Overlay под модальными окнами |

#### Fixed (не меняются между light/dark — для разноцветных элементов)

| CSS токен | camelCase (API) | Tone (всегда) |
|-----------|-----------------|---------------|
| `--md-sys-color-primary-fixed` | `primaryFixed` | 90 |
| `--md-sys-color-primary-fixed-dim` | `primaryFixedDim` | 80 |
| `--md-sys-color-on-primary-fixed` | `onPrimaryFixed` | 10 |
| `--md-sys-color-on-primary-fixed-variant` | `onPrimaryFixedVariant` | 30 |
| `--md-sys-color-secondary-fixed` | `secondaryFixed` | 90 |
| `--md-sys-color-secondary-fixed-dim` | `secondaryFixedDim` | 80 |
| `--md-sys-color-on-secondary-fixed` | `onSecondaryFixed` | 10 |
| `--md-sys-color-on-secondary-fixed-variant` | `onSecondaryFixedVariant` | 30 |
| `--md-sys-color-tertiary-fixed` | `tertiaryFixed` | 90 |
| `--md-sys-color-tertiary-fixed-dim` | `tertiaryFixedDim` | 80 |
| `--md-sys-color-on-tertiary-fixed` | `onTertiaryFixed` | 10 |
| `--md-sys-color-on-tertiary-fixed-variant` | `onTertiaryFixedVariant` | 30 |

> **Примечание:** Tone values для surface container (surfaceDim, surfaceBright, surfaceContainerLow/High/Highest) зависят от contrastLevel и реализованы через ContrastCurve в ColorSpecDelegateImpl2021. Указанные значения — для стандартного contrastLevel = 0.0.

---

## 4. Dynamic Color — генерация схемы

### 4.1 Концепция

Из одного **seed/source color** (ARGB integer) генерируется:
1. HCT-представление → 5 тональных палитр
2. DynamicScheme (контекст: isDark, contrastLevel, variant)
3. MaterialDynamicColors резолвит конкретные значения для каждой роли

### 4.2 Scheme Variants

| Класс | Variant | Описание |
|-------|---------|----------|
| `SchemeTonalSpot` | TONAL_SPOT | **Дефолт Android 12/13.** Спокойная, средняя насыщенность |
| `SchemeVibrant` | VIBRANT | Максимальная насыщенность Primary, усиленная Secondary |
| `SchemeExpressive` | EXPRESSIVE | Игривая, hue source не появляется в теме напрямую |
| `SchemeNeutral` | NEUTRAL | Чуть хроматичнее Monochrome |
| `SchemeMonochrome` | MONOCHROME | Чисто чёрно-серо-белая |
| `SchemeFidelity` | FIDELITY | Source color → primaryContainer напрямую |
| `SchemeContent` | CONTENT | Source color максимально сохраняется в primary |
| `SchemeRainbow` | RAINBOW | (не подтверждено — задокументировано в index, описание отсутствует) |
| `SchemeFruitSalad` | FRUIT_SALAD | (не подтверждено — задокументировано в index, описание отсутствует) |

---

## 5. API `@material/material-color-utilities`

### 5.1 Основные функции и классы

```typescript
import {
  argbFromHex,          // string → ARGB integer
  hexFromArgb,          // ARGB integer → '#rrggbb'
  Hct,                  // HCT color space
  TonalPalette,         // генерация палитр
  MaterialDynamicColors, // все color roles (facade)
  DynamicScheme,        // runtime context
  SchemeTonalSpot,      // scheme variants
  SchemeVibrant,
  SchemeExpressive,
  SchemeNeutral,
  SchemeMonochrome,
  SchemeFidelity,
  SchemeContent,
  // Legacу API (не рекомендуется для новых схем):
  themeFromSourceColor,  // возвращает Theme со старой Scheme
  applyTheme,            // применяет Theme к DOM
  themeFromImage,        // извлекает seed из HTMLImageElement
} from '@material/material-color-utilities';
```

### 5.2 Legacy API: `themeFromSourceColor` + `applyTheme`

> **Важно:** `themeFromSourceColor` использует старый класс `Scheme` (не `DynamicScheme`), который **не включает** surface-container roles. Это ограниченный legacy API.

```typescript
// Сигнатура
function themeFromSourceColor(
  source: number,             // ARGB integer
  customColors?: CustomColor[] // опциональные кастомные цвета
): Theme

// Возвращаемый объект Theme
interface Theme {
  source: number;
  schemes: {
    light: Scheme;  // legacy Scheme, НЕ DynamicScheme
    dark: Scheme;
  };
  palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  };
  customColors: CustomColorGroup[];
}

// applyTheme ставит --md-sys-color-* через setSchemeProperties:
// scheme.toJSON() → camelCase → kebab-case → --md-sys-color-{token}
function applyTheme(theme: Theme, options?: {
  dark?: boolean;
  target?: HTMLElement;      // default: document.body
  brightnessSuffix?: boolean; // добавить -light/-dark суффиксы
  paletteTones?: number[];   // генерировать --md-ref-palette-* токены
}): void

// Использование
const theme = themeFromSourceColor(argbFromHex('#6750A4'));
applyTheme(theme, { dark: false, target: document.documentElement });
```

**Что ставит `applyTheme`:** только токены из legacy `Scheme.toJSON()` — primary, onPrimary, primaryContainer, onPrimaryContainer, secondary, onSecondary, secondaryContainer, onSecondaryContainer, tertiary, onTertiary, tertiaryContainer, onTertiaryContainer, error, onError, errorContainer, onErrorContainer, background, onBackground, surface, onSurface, surfaceVariant, onSurfaceVariant, inverseSurface, inverseOnSurface, inversePrimary, outline, shadow (не подтверждено полностью).

**НЕ ставит:** `surfaceDim`, `surfaceBright`, `surfaceContainer*`, `outlineVariant`, `scrim`, `surfaceTint` и все Fixed токены.

### 5.3 Современный API: `DynamicScheme` + `MaterialDynamicColors`

Рекомендуемый подход для получения ВСЕХ токенов:

```typescript
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeTonalSpot,
  MaterialDynamicColors,
} from '@material/material-color-utilities';

function applyM3Theme(
  seedHex: string,
  isDark: boolean,
  target: HTMLElement = document.documentElement,
  contrastLevel = 0.0
): void {
  const hct = Hct.fromInt(argbFromHex(seedHex));
  const scheme = new SchemeTonalSpot(hct, isDark, contrastLevel);
  const mdc = new MaterialDynamicColors();

  // allColors содержит ~49 DynamicColor объектов с именами
  for (const dynamicColor of mdc.allColors) {
    const name = dynamicColor.name; // camelCase: 'surfaceContainerHigh'
    const cssToken = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const value = hexFromArgb(dynamicColor.getArgb(scheme));
    target.style.setProperty(`--md-sys-color-${cssToken}`, value);
  }
}

// Использование
applyM3Theme('#6750A4', false); // light theme
applyM3Theme('#6750A4', true);  // dark theme
```

### 5.4 Получение конкретного цвета

```typescript
const scheme = new SchemeTonalSpot(
  Hct.fromInt(argbFromHex('#6750A4')),
  false, // isDark
  0.0    // contrastLevel
);
const mdc = new MaterialDynamicColors();

// Через instance методы
const primaryArgb = mdc.primary().getArgb(scheme);
const primaryHex = hexFromArgb(primaryArgb);

// Через DynamicScheme convenience методы
const surfaceArgb = scheme.getArgb(mdc.surface());

// Через конкретный тон палитры напрямую
const primary80hex = hexFromArgb(scheme.primaryPalette.tone(80));
```

### 5.5 `themeFromImage` (извлечение seed из картинки)

```typescript
async function themeFromImage(
  image: HTMLImageElement,
  customColors?: CustomColor[]
): Promise<Theme>

// Использование
const img = document.querySelector('img') as HTMLImageElement;
const theme = await themeFromImage(img);
applyTheme(theme, { dark: false });
```

### 5.6 Custom Colors с гармонизацией

```typescript
const theme = themeFromSourceColor(
  argbFromHex('#6750A4'),
  [
    {
      name: 'success',
      value: argbFromHex('#4CAF50'),
      blend: true // гармонизировать с source через Blend.harmonize()
    }
  ]
);
// theme.customColors[0].light.color, .colorContainer, .onColor, .onColorContainer
// theme.customColors[0].dark.color, ...
```

---

## 6. Что ставит `applyTheme` vs полный набор токенов

| Группа токенов | Legacy `applyTheme` | Modern `allColors` loop |
|---------------|--------------------|-----------------------|
| primary / on-primary / primary-container / on-primary-container | ✓ | ✓ |
| secondary / tertiary (аналогично) | ✓ | ✓ |
| error / on-error / error-container / on-error-container | ✓ | ✓ |
| background / on-background | ✓ | ✓ |
| surface / on-surface | ✓ | ✓ |
| surface-variant / on-surface-variant | ✓ | ✓ |
| inverse-surface / inverse-on-surface / inverse-primary | ✓ | ✓ |
| outline | ✓ | ✓ |
| **surface-dim / surface-bright** | **✗** | **✓** |
| **surface-container-lowest/low/default/high/highest** | **✗** | **✓** |
| **outline-variant** | **✗** | **✓** |
| **scrim** | **✗** | **✓** |
| **surface-tint** | **✗** | **✓** |
| **primary-fixed / *-fixed-dim / on-*-fixed / on-*-fixed-variant** | **✗** | **✓** |

> **Вывод:** `applyTheme` покрывает ~20-22 токена. `@material/web` компонентам нужны все 49 — используй Modern API.

---

## 7. Контрастность и тёмная тема

### Уровни контрастности

`contrastLevel` задаётся при создании `DynamicScheme`:

| Значение | Уровень |
|----------|---------|
| `-1.0` | Низкий контраст |
| `0.0` | **Стандартный (WCAG AA)** |
| `0.5` | Средний |
| `1.0` | Высокий (WCAG AAA) |

### Правила доступности

- **On-* цвета** всегда контрастируют с парным фоном ≥ 4.5:1 (WCAG AA)
- При `contrastLevel = 1.0` — ≥ 7:1 (WCAG AAA)
- Пары primary/onPrimary, surface/onSurface и т.д. гарантированно доступны

### Тёмная тема

Тёмная тема — не просто инверсия. Роли меняют tone:
- Акцентные цвета: light T40 → dark T80 (светлее на тёмном фоне)
- Поверхности: light T98 → dark T6 (тёмнее)
- Container: light T90 → dark T30

```typescript
// Переключение темы
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyM3Theme('#6750A4', prefersDark);

// Реакция на изменение системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  applyM3Theme('#6750A4', e.matches);
});
```

---

## 8. Полный рабочий пример: seed → light+dark → CSS токены

```typescript
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeTonalSpot,
  MaterialDynamicColors,
  TonalPalette,
} from '@material/material-color-utilities';

type ColorMap = Record<string, string>;

function generateColorTokens(
  seedHex: string,
  isDark: boolean,
  contrastLevel = 0.0
): ColorMap {
  const sourceHct = Hct.fromInt(argbFromHex(seedHex));
  const scheme = new SchemeTonalSpot(sourceHct, isDark, contrastLevel);
  const mdc = new MaterialDynamicColors();
  const tokens: ColorMap = {};

  for (const dynamicColor of mdc.allColors) {
    const cssName = dynamicColor.name
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    tokens[`--md-sys-color-${cssName}`] = hexFromArgb(
      dynamicColor.getArgb(scheme)
    );
  }
  return tokens;
}

function applyColorTokens(tokens: ColorMap, target = document.documentElement): void {
  for (const [prop, value] of Object.entries(tokens)) {
    target.style.setProperty(prop, value);
  }
}

// Генерация обеих схем
const SEED = '#6750A4';
const lightTokens = generateColorTokens(SEED, false);
const darkTokens = generateColorTokens(SEED, true);

// Применение с учётом системной темы
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyColorTokens(isDark ? darkTokens : lightTokens);

// CSS media query подход (альтернатива):
// Применяем обе схемы с data-атрибутом
applyColorTokens(lightTokens, document.documentElement); // :root (light)
// В компоненте: document.documentElement.dataset.theme = 'dark'
// + CSS: [data-theme="dark"] { --md-sys-color-primary: ...; }
```

---

## 9. Интеграция с `@material/web`

`@material/web` компоненты автоматически читают `--md-sys-color-*` токены. Минимальная настройка:

```css
/* Вариант 1: задать токены вручную через CSS */
:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  /* ... все ~29+ токенов */
}

/* Вариант 2: через JS (applyColorTokens выше) — рекомендуется */
```

```typescript
// Вариант 3: @material/web Material Theme Builder output
// Скопировать CSS из https://material-foundation.github.io/material-theme-builder/
```

Токены трёх уровней в @material/web:
- `--md-ref-*` — reference (palette конкретные значения)
- `--md-sys-*` — **system tokens (цветовые роли) — используй эти**
- component tokens — атрибуты конкретных компонентов

---

## 10. Открытые вопросы / риски

### Архитектурные риски

1. **Legacy vs Modern API.** `themeFromSourceColor` + `applyTheme` — legacy, не покрывает surface-container и другие новые роли. Для `@material/web@2.4.1` нужен Modern API через `DynamicScheme` + `allColors`. Рекомендуется **не использовать `applyTheme`**.

2. **`allColors` API стабильность.** `MaterialDynamicColors.allColors` — массив инстанс-методов из фасада. Конкретные имена (`dynamicColor.name`) подтверждены через анализ кода, но формально могут измениться в минорных обновлениях. Проверить при обновлении пакета.

3. **Spec versioning (2021/2025/2026).** `DynamicScheme` принимает `specVersion?: SpecVersion`. По умолчанию `DynamicScheme.DEFAULT_SPEC_VERSION`. В v0.4.0 дефолт — SPEC_2021. Spec 2026 меняет tone curves surface ролей. Риск: будущие обновления пакета могут изменить поведение без breaking change по semver.

4. **`primaryDim`, `secondaryDim`, `tertiaryDim`, `errorDim`.** Упоминаются в коде как опциональные (могут быть undefined в `allColors`). Добавлены в spec 2026. При обходе `allColors` нужна проверка.

5. **SSR / Next.js.** `applyColorTokens` требует `document`. В App Router Server Components недоступен. Токены нужно применять в Client Component, `'use client'`. Рассмотреть генерацию CSS-переменных на сервере и вставку через `<style>` тег в `<head>`.

### Практические риски

6. **`themeFromImage` требует браузера.** `HTMLImageElement` + `QuantizerCelebi` — только клиент. На SSR недоступно.

7. **@material/web не поддерживает palette и motion токены** (из документации material-web.dev). Только system токены (`--md-sys-*`) и component токены.

8. **CORS при themeFromImage.** Изображение должно быть CORS-разрешённым для чтения пикселей через Canvas.

9. **Производительность.** `new MaterialDynamicColors()` + цикл по `allColors` — дешевая операция (нет I/O), можно вызывать при смене темы.

10. **Tone values в таблицах выше** для surface container и surface dim/bright — **приближённые значения при contrastLevel=0.0**. Реальные значения вычисляются через `ContrastCurve` функции, зашитые в `ColorSpecDelegateImpl2021`. Считай их опорными ориентирами, не константами.

---

## Источники

- [material-foundation/material-color-utilities GitHub](https://github.com/material-foundation/material-color-utilities)
- [material-web.dev/theming/color](https://material-web.dev/theming/color/)
- [deepwiki.com — Dynamic Color System](https://deepwiki.com/material-foundation/material-color-utilities/3-dynamic-color-system)
- [m3.material.io/styles/color/roles](https://m3.material.io/styles/color/roles)
- [dt.in.th — M3 Dynamic Color JS](https://dt.in.th/M3DynamicColorJS)
- [_md-sys-color.scss](https://github.com/material-components/material-web/blob/main/tokens/_md-sys-color.scss)
