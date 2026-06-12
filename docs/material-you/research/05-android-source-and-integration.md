# 05. Android Source / AOSP Material + Интеграция @material/web в Next.js 15

---

## Часть A — source.android.com: что это и применимо ли к вебу

### О чём страница

`https://source.android.com/docs/core/display/material` — документация **Android Open Source Project (AOSP)** для OEM-производителей устройств. Это руководство по тому, как Device Manufacturer должен реализовать Material You на уровне прошивки Android 12+.

Страница описывает:

- **Dynamic Color / Monet** — движок, принимающий один seed-цвет (из обоев или пресета) и генерирующий **5 тональных палитр × 13 тонов = 65 цветовых атрибутов** через алгоритм CAM16.
- **Tonal Palettes** — `system_accent1/2/3` (хроматические) и `system_neutral1/2` (нейтральные). Каждая строится с заданной хромой в CAM16-пространстве.
- **ThemePicker APK** — системный APK, где OEM объявляет доступные seed-цвета через XML-ресурсы.
- **Settings.Secure.THEME_CUSTOMIZATION_OVERLAY_PACKAGES** — Android API для передачи выбранного seed в систему.
- **Motion / Scroll Stretch** — нелинейный stretch-эффект при скролле; требует обновлённых androidx-компонентов в сторонних приложениях.
- **Android 12 Patches** — список обязательных патчей безопасности и логики Monet для OEM.
- **RRO (Runtime Resource Overlay)** — механизм подмены системных ресурсов без перекомпиляции.

### Концепции, релевантные веб-дизайну

| Концепция | Применимо к вебу? | Почему |
|-----------|------------------|--------|
| Seed color → tonal palette (алгоритм) | Да | Тот же алгоритм реализован в `@material/material-color-utilities` (JS) |
| 5 палитр × 13 тонов | Да | Используются как `--md-sys-color-*` токены в `@material/web` |
| Концепция Color Roles (primary, surface, error…) | Да | Прямо соответствуют CSS-переменным M3 на вебе |
| CAM16 chroma minimum (≥5) | Да | Учитывается при генерации схемы |

### Концепции, НЕ применимые к вебу

- Android Framework API (`Settings.Secure`, `WallpaperColors`)
- RRO / системные overlay-пакеты
- ThemePicker APK и OEM кастомизация
- HAL (Hardware Abstraction Layer) для цветоизвлечения из обоев
- Stretch-scroll эффект (нативный Android motion)
- Patching AOSP / BSP

### Честный вывод

Страница `source.android.com/docs/core/display/material` — это **OEM-инструкция для производителей Android-устройств**. Она полезна как теоретический источник для понимания алгоритмической природы Material You (CAM16, tonal palettes), но **не содержит ничего практически применимого** к веб-разработке напрямую.

**Основные практические источники для веба:**
- `m3.material.io` — спецификация дизайн-системы
- `material-web.dev` — документация web components
- `@material/material-color-utilities` — JS-реализация Monet-алгоритма

---

## Часть B — Практическая интеграция @material/web в Next.js 15.5 / React 19.2 / Turbopack / Tailwind v4

### B.1 Установка

```bash
pnpm add @material/web
pnpm add @material/material-color-utilities  # для applyTheme / генерации палитры
```

`@material/web` — чистые **web components на базе Lit**. Нет React-обёрток от Google. Импорт покомпонентный:

```ts
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/checkbox/checkbox.js'
```

**Никогда не импортировать `@material/web/all.js`** — это 500+ КБ нетронутого кода. Импортировать только нужные компоненты.

---

### B.2 SSR / App Router: паттерн client-регистратора

Web components регистрируются через `customElements.define()`, что работает **только в браузере**. При SSR в Next.js App Router — сервер рендерит HTML без знания о custom elements, клиент их подхватывает при гидрации.

**Проблема:** React пытается гидрировать `<md-filled-button>` который на сервере рендерится как неизвестный тег. В React 19 это поведение улучшено (custom elements Everywhere — 100%), но регистрацию всё равно нужно делать только на клиенте.

#### Рекомендуемый паттерн: компонент-регистратор

```tsx
// src/components/material/MdRegistry.tsx
'use client'

import { useEffect } from 'react'

export function MdRegistry() {
  useEffect(() => {
    Promise.all([
      import('@material/web/button/filled-button.js'),
      import('@material/web/button/outlined-button.js'),
      import('@material/web/button/text-button.js'),
      import('@material/web/icon-button/icon-button.js'),
      import('@material/web/checkbox/checkbox.js'),
      import('@material/web/textfield/outlined-text-field.js'),
      import('@material/web/select/outlined-select.js'),
      import('@material/web/select/select-option.js'),
      import('@material/web/dialog/dialog.js'),
      import('@material/web/ripple/ripple.js'),
    ]).catch(console.error)
  }, [])

  return null
}
```

```tsx
// src/app/layout.tsx  (server component)
import { MdRegistry } from '@/components/material/MdRegistry'

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <MdRegistry />
        {children}
      </body>
    </html>
  )
}
```

**Альтернатива — dynamic import с ssr: false** (полностью исключает SSR):

```tsx
// src/components/material/MdRegistry.tsx
import dynamic from 'next/dynamic'

const MdRegistry = dynamic(
  () => import('./MdRegistryInner').then(m => ({ default: m.MdRegistryInner })),
  { ssr: false }
)
```

Разница: `useEffect` — компонент участвует в SSR (возвращает `null`), регистрация происходит после гидрации. `ssr: false` — компонент полностью client-only, ноль HTML с сервера.

---

### B.3 FOUC (Flash of Unstyled Content) — митигейшн

До момента, когда `customElements.define()` выполнится, браузер видит `<md-filled-button>` как неизвестный inline-элемент без стилей.

**CSS-решение (рекомендуется добавить в globals.css):**

```css
/* Скрыть незарегистрированные md-* элементы до их определения */
md-filled-button:not(:defined),
md-outlined-button:not(:defined),
md-text-button:not(:defined),
md-icon-button:not(:defined),
md-checkbox:not(:defined),
md-outlined-text-field:not(:defined),
md-outlined-select:not(:defined),
md-dialog:not(:defined) {
  visibility: hidden;
}
```

Вариант с opacity (сохраняет место в accessibility tree):

```css
[class^="md-"]:not(:defined),
[is^="md-"]:not(:defined) {
  opacity: 0;
  pointer-events: none;
}
```

---

### B.4 React 19 и Custom Elements

React 19 (декабрь 2024) полностью прошёл тесты **Custom Elements Everywhere**. Ключевые изменения:

**Props как properties (client-side):**
```tsx
// React 18 — нужен был ref + useEffect для объектных props
// React 19 — работает декларативно:
<md-outlined-text-field
  label="Название события"
  value={title}
  onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
  required
  error={!!errors.title}
  errorText={errors.title}
/>
```

React 19 сам определяет: если prop существует как **property** на DOM-элементе — присваивает как property; иначе — как attribute.

**Props на SSR-стороне:** на сервере рендерятся **только примитивы** (string, number, `true`). Объекты, функции, `false` — опускаются. Это нормально, т.к. web components оживают только на клиенте.

**Custom Events:**
```tsx
// React 19 — синтаксис onEventName (camelCase)
<md-dialog onClose={() => setOpen(false)} onCancel={() => setOpen(false)} />
```

---

### B.5 TypeScript типизация md-* в JSX

Создать файл деклараций:

```ts
// src/types/material-web.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          disabled?: boolean
          href?: string
          target?: string
          'trailing-icon'?: boolean
        },
        HTMLElement
      >
      'md-outlined-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          disabled?: boolean
          href?: string
        },
        HTMLElement
      >
      'md-text-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          disabled?: boolean
        },
        HTMLElement
      >
      'md-icon-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          disabled?: boolean
          selected?: boolean
          toggle?: boolean
        },
        HTMLElement
      >
      'md-checkbox': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          checked?: boolean
          disabled?: boolean
          indeterminate?: boolean
          name?: string
          value?: string
          required?: boolean
        },
        HTMLElement
      >
      'md-outlined-text-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string
          value?: string
          type?: string
          disabled?: boolean
          required?: boolean
          error?: boolean
          'error-text'?: string
          'supporting-text'?: string
          maxlength?: number
          rows?: number
        },
        HTMLElement
      >
      'md-outlined-select': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string
          value?: string
          disabled?: boolean
          required?: boolean
          error?: boolean
          'error-text'?: string
        },
        HTMLElement
      >
      'md-select-option': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string
          selected?: boolean
          disabled?: boolean
          headline?: string
        },
        HTMLElement
      >
      'md-dialog': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          open?: boolean
          'quick'?: boolean
        },
        HTMLElement
      >
      'md-ripple': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          disabled?: boolean
          unbounded?: boolean
        },
        HTMLElement
      >
      'md-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'md-divider': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          inset?: boolean
          'inset-start'?: boolean
          'inset-end'?: boolean
        },
        HTMLElement
      >
      'md-circular-progress': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: number
          max?: number
          indeterminate?: boolean
          'four-color'?: boolean
        },
        HTMLElement
      >
      'md-linear-progress': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: number
          max?: number
          indeterminate?: boolean
          buffer?: number
          'four-color'?: boolean
        },
        HTMLElement
      >
    }
  }
}
```

Убедиться, что `tsconfig.json` включает файл:

```json
{
  "include": ["src/**/*", "src/types/**/*.d.ts"]
}
```

---

### B.6 Tailwind v4 + токены M3 — структура globals.css

Tailwind v4 использует CSS-first конфигурацию (`@theme`). Токены M3 (`--md-sys-color-*`) живут в том же `globals.css`, но в разных слоях.

**Shadow DOM компонентов @material/web защищает их от Tailwind preflight** — reset Tailwind не ломает внутренние стили web components. Tailwind-классы на _обёртках_ (`<div>`, `<section>`) работают нормально.

```css
/* src/app/globals.css */

@import "tailwindcss";

/* Tailwind v4: кастомный вариант для dark через data-theme */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* Tailwind токены — через @theme */
@theme {
  --color-surface: var(--md-sys-color-surface);
  --color-on-surface: var(--md-sys-color-on-surface);
  --color-primary: var(--md-sys-color-primary);
  --color-on-primary: var(--md-sys-color-on-primary);
  --color-secondary: var(--md-sys-color-secondary);
  --color-error: var(--md-sys-color-error);
  --color-surface-container: var(--md-sys-color-surface-container);
  --color-surface-container-high: var(--md-sys-color-surface-container-high);
  --color-outline: var(--md-sys-color-outline);
  --color-outline-variant: var(--md-sys-color-outline-variant);
}

/* M3 Light Scheme (по умолчанию) */
@layer base {
  :root,
  [data-theme="light"] {
    --md-sys-color-primary: #6750a4;
    --md-sys-color-on-primary: #ffffff;
    --md-sys-color-primary-container: #eaddff;
    --md-sys-color-on-primary-container: #21005e;
    --md-sys-color-secondary: #625b71;
    --md-sys-color-on-secondary: #ffffff;
    --md-sys-color-secondary-container: #e8def8;
    --md-sys-color-on-secondary-container: #1e192b;
    --md-sys-color-tertiary: #7d5260;
    --md-sys-color-on-tertiary: #ffffff;
    --md-sys-color-tertiary-container: #ffd8e4;
    --md-sys-color-on-tertiary-container: #370b1e;
    --md-sys-color-error: #b3261e;
    --md-sys-color-on-error: #ffffff;
    --md-sys-color-error-container: #f9dedc;
    --md-sys-color-on-error-container: #370605;
    --md-sys-color-background: #fffbfe;
    --md-sys-color-on-background: #1c1b1f;
    --md-sys-color-surface: #fffbfe;
    --md-sys-color-on-surface: #1c1b1f;
    --md-sys-color-surface-variant: #e7e0ec;
    --md-sys-color-on-surface-variant: #49454e;
    --md-sys-color-surface-container-lowest: #ffffff;
    --md-sys-color-surface-container-low: #f7f2fa;
    --md-sys-color-surface-container: #f3edf7;
    --md-sys-color-surface-container-high: #ece6f0;
    --md-sys-color-surface-container-highest: #e6e1e5;
    --md-sys-color-outline: #79747e;
    --md-sys-color-outline-variant: #cac4d0;
    --md-sys-color-inverse-surface: #313033;
    --md-sys-color-inverse-on-surface: #f4eff4;
    --md-sys-color-inverse-primary: #d0bcff;
    --md-sys-color-shadow: #000000;
    --md-sys-color-scrim: #000000;
  }

  /* M3 Dark Scheme */
  [data-theme="dark"] {
    --md-sys-color-primary: #d0bcff;
    --md-sys-color-on-primary: #371e73;
    --md-sys-color-primary-container: #4f378b;
    --md-sys-color-on-primary-container: #eaddff;
    --md-sys-color-secondary: #cbc2db;
    --md-sys-color-on-secondary: #332d41;
    --md-sys-color-secondary-container: #4a4458;
    --md-sys-color-on-secondary-container: #e8def8;
    --md-sys-color-tertiary: #efb8c8;
    --md-sys-color-on-tertiary: #4a2532;
    --md-sys-color-tertiary-container: #633b48;
    --md-sys-color-on-tertiary-container: #ffd8e4;
    --md-sys-color-error: #f2b8b5;
    --md-sys-color-on-error: #601410;
    --md-sys-color-error-container: #8c1d18;
    --md-sys-color-on-error-container: #f9dedc;
    --md-sys-color-background: #1c1b1f;
    --md-sys-color-on-background: #e6e1e6;
    --md-sys-color-surface: #1c1b1f;
    --md-sys-color-on-surface: #e6e1e6;
    --md-sys-color-surface-variant: #49454f;
    --md-sys-color-on-surface-variant: #cac4d0;
    --md-sys-color-surface-container-lowest: #0f0d13;
    --md-sys-color-surface-container-low: #1d1b20;
    --md-sys-color-surface-container: #211f26;
    --md-sys-color-surface-container-high: #2b2930;
    --md-sys-color-surface-container-highest: #36343b;
    --md-sys-color-outline: #938f99;
    --md-sys-color-outline-variant: #49454f;
    --md-sys-color-inverse-surface: #e6e1e6;
    --md-sys-color-inverse-on-surface: #313033;
    --md-sys-color-inverse-primary: #6750a4;
    --md-sys-color-shadow: #000000;
    --md-sys-color-scrim: #000000;
  }
}

/* FOUC-митигейшн */
md-filled-button:not(:defined),
md-outlined-button:not(:defined),
md-text-button:not(:defined),
md-icon-button:not(:defined),
md-checkbox:not(:defined),
md-outlined-text-field:not(:defined),
md-outlined-select:not(:defined),
md-dialog:not(:defined),
md-circular-progress:not(:defined),
md-linear-progress:not(:defined) {
  visibility: hidden;
}
```

---

### B.7 next-themes + M3 dark/light схема

Проект уже использует `next-themes`. Стратегия: next-themes управляет `data-theme` атрибутом на `<html>`, CSS-селекторы применяют нужный набор `--md-sys-color-*`.

```tsx
// src/components/providers.tsx (уже есть в проекте, обновить ThemeProvider)
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
```

**Ключевой момент:** `attribute="data-theme"` (не `"class"`) — именно по нему срабатывают CSS-селекторы `[data-theme="dark"]` из globals.css. next-themes добавит `data-theme="dark"` или `data-theme="light"` на `<html>`, и токены M3 переключатся автоматически.

`suppressHydrationWarning` на `<html>` обязателен — next-themes модифицирует `<html>` до гидрации.

---

### B.8 Dynamic theming через material-color-utilities

Если нужна генерация схемы из произвольного seed-цвета (полный Material You):

```ts
// src/lib/material-theme.ts
import {
  argbFromHex,
  hexFromArgb,
  SchemeTonalSpot,
  Hct,
  MaterialDynamicColors,
  DynamicScheme,
} from '@material/material-color-utilities'

const COLOR_ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'background', 'onBackground',
  'surface', 'onSurface',
  'surfaceVariant', 'onSurfaceVariant',
  'surfaceContainer', 'surfaceContainerLow', 'surfaceContainerHigh',
  'surfaceContainerLowest', 'surfaceContainerHighest',
  'outline', 'outlineVariant',
  'inverseSurface', 'inverseOnSurface', 'inversePrimary',
  'shadow', 'scrim',
] as const

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export function applyM3Theme(seedHex: string, isDark: boolean, target: HTMLElement = document.documentElement) {
  const sourceColor = Hct.fromInt(argbFromHex(seedHex))
  const scheme = new SchemeTonalSpot(sourceColor, isDark, 0.0)

  for (const role of COLOR_ROLES) {
    const dynamicColor = MaterialDynamicColors[role as keyof typeof MaterialDynamicColors]
    if (dynamicColor && typeof dynamicColor === 'object' && 'getArgb' in dynamicColor) {
      const argb = (dynamicColor as { getArgb: (s: DynamicScheme) => number }).getArgb(scheme)
      const hex = hexFromArgb(argb)
      const varName = `--md-sys-color-${camelToKebab(role)}`
      target.style.setProperty(varName, hex)
    }
  }
}
```

```tsx
// src/hooks/useMaterialTheme.ts
'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { applyM3Theme } from '@/lib/material-theme'

const DEFAULT_SEED = '#6750a4' // Material Purple baseline

export function useMaterialTheme(seed = DEFAULT_SEED) {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const isDark = resolvedTheme === 'dark'
    applyM3Theme(seed, isDark)
  }, [resolvedTheme, seed])
}
```

---

### B.9 Шрифты: Roboto Flex через next/font

```tsx
// src/app/layout.tsx
import { Roboto_Flex } from 'next/font/google'

const robotoFlex = Roboto_Flex({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto-flex',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning className={robotoFlex.variable}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* globals.css — связать с токенами M3 */
@layer base {
  :root {
    --md-ref-typeface-plain: var(--font-roboto-flex), 'Roboto Flex', sans-serif;
    --md-ref-typeface-brand: var(--font-roboto-flex), 'Roboto Flex', sans-serif;
  }
}
```

`@material/web` использует `--md-ref-typeface-plain` как семейство шрифтов для большинства компонентов, `--md-ref-typeface-brand` — для Display/Headline типографики.

---

### B.10 Tree-shaking и Turbopack

- **Импортируй покомпонентно**, никогда не `import '@material/web/all.js'`.
- Turbopack поддерживает ESM tree-shaking — при покомпонентных импортах в бандл попадёт только необходимое.
- **Специфических известных несовместимостей** `@material/web` с Turbopack не задокументировано (на момент исследования, июнь 2026). Библиотека поставляется как ESM-модули, Turbopack с ESM работает корректно.
- Если возникнут проблемы с разрешением bare specifiers в Turbopack — проверить `transpilePackages` в `next.config.ts`:
  ```ts
  // next.config.ts (если потребуется)
  const nextConfig = {
    transpilePackages: ['@material/web'],
  }
  ```
  (не подтверждено как необходимое, но это стандартный fallback для ESM-only пакетов)

---

## Открытые вопросы / риски

1. **SSR hydration с object props** — React 19 на SSR опускает объектные props custom elements. Если компонент `@material/web` рассчитывает на объект при первом рендере, будет несоответствие. Тестировать каждый компонент с реальными данными.

2. **Turbopack + Lit / декораторы** — `@material/web` использует Lit с TypeScript декораторами. Turbopack через SWC должен обрабатывать их корректно, но при ошибках компиляции декораторов — добавить `"experimentalDecorators": true` в tsconfig (не подтверждено как необходимое для runtime).

3. **TypeScript типы — неполнота деклараций** — `@material/web` не поставляет React JSX типы. Поддерживать `material-web.d.ts` вручную при добавлении новых компонентов. Альтернатива: `material-web-components-react` — beta-либа с React-обёртками, но SSR не решена полностью.

4. **applyM3Theme при SSR** — вызов `document.documentElement.style.setProperty()` невозможен на сервере. Весь dynamic theming — только в `useEffect` / client-only коде. Стандартная palette (статичные CSS-переменные) при этом работает через SSR без проблем.

5. **next-themes `attribute="data-theme"` vs `attribute="class"`** — существующий код проекта может использовать `class` (Tailwind `dark:`). При переходе на `data-theme` — проверить все `dark:` utility-классы. Tailwind v4 поддерживает `@custom-variant dark` с любым селектором.

6. **FOUC при медленной загрузке JS** — `visibility: hidden` на `md-*:not(:defined)` скрывает контент, но лейаут остаётся (нет layout shift). При очень медленном JS пользователь видит пустое место. Приемлемо для приложения (не public-facing marketing page).

7. **`material-web-components-react`** — сторонняя beta-библиотека, нет активной поддержки, SSR не решена. Использовать напрямую `@material/web` предпочтительнее.

---

## Итоговое резюме

**source.android.com/docs/core/display/material** — это инструкция для OEM-производителей Android по реализации Material You на уровне прошивки (Monet engine, RRO, ThemePicker APK). К веб-разработке **напрямую неприменима**. Полезна только для понимания теоретической основы (CAM16, 5 tonal palettes). Практический источник для веба — `m3.material.io` и `material-web.dev`.

**Рекомендуемый паттерн интеграции @material/web в Next.js 15 / React 19:**

1. Установить `@material/web` и `@material/material-color-utilities`.
2. Создать `MdRegistry` (`'use client'`, `useEffect` с dynamic imports нужных компонентов) — разместить в `layout.tsx`.
3. Добавить CSS `md-*:not(:defined) { visibility: hidden }` для FOUC-митигейшн.
4. Токены `--md-sys-color-*` — объявить статично в `globals.css` в `@layer base` под селекторами `:root` и `[data-theme="dark"]`.
5. `next-themes` с `attribute="data-theme"` переключает схему автоматически через CSS-каскад — без JS-вмешательства.
6. Типизация `md-*` — файл `src/types/material-web.d.ts` с `declare module 'react' { namespace JSX { interface IntrinsicElements { ... } } }`.
7. Импортировать компоненты строго по одному — не `all.js`.

**Ключевые риски:** отсутствие официальных React/Next.js биндингов от Google, ручная поддержка TypeScript деклараций, FOUC при регистрации через `useEffect`, потенциальные edge-cases с object props при SSR.
