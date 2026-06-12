# Material 3 Foundations: Typography, Shape, Elevation, Motion

> Источники: реальные SCSS-токены `@material/web` v0.192 (github.com/material-components/material-web), material-web.dev, m3.material.io.  
> Пометка `[⚠ непроверено]` — значения из вторичных источников или выведенные логически.

---

## 1. Типографика (Type Scale)

### 1.1 Шрифты и reference-токены

| Токен | Значение | Назначение |
|---|---|---|
| `--md-ref-typeface-brand` | `"Roboto"` | Display, Headline, Title Large — «брендовый» шрифт |
| `--md-ref-typeface-plain` | `"Roboto"` | Body, Label, Title M/S — «нейтральный» шрифт |
| `--md-ref-typeface-weight-regular` | `400` | Базовый вес |
| `--md-ref-typeface-weight-medium` | `500` | Средний вес (Label, некоторые Title) |
| `--md-ref-typeface-weight-bold` | `700` | Prominent-вариант Label |

**Смена шрифта глобально:**

```css
:root {
  --md-ref-typeface-brand: "Inter", sans-serif; /* Display, Headline, Title Large */
  --md-ref-typeface-plain: "Inter", sans-serif; /* Body, Label, Title M/S */
}
```

**Смена шрифта для конкретной роли:**

```css
:root {
  --md-sys-typescale-display-large-font: "Playfair Display", serif;
}
```

### 1.2 Type Scale — полная таблица

Значения из `tokens/versions/v0_192/_md-sys-typescale.scss` (@material/web v0.192).  
`tracking` = `letter-spacing`. Размеры в `rem` (база 16px).

| Роль | font-size | line-height | weight | letter-spacing | Шрифт-тип | Применение |
|---|---|---|---|---|---|---|
| **display-large** | 3.5625rem (57px) | 4rem (64px) | 400 | -0.015625rem (-0.25px) | brand | Героический заголовок, крупный лендинг |
| **display-medium** | 2.8125rem (45px) | 3.25rem (52px) | 400 | 0rem | brand | Заголовок секции, splash-экран |
| **display-small** | 2.25rem (36px) | 2.75rem (44px) | 400 | 0rem | brand | Крупный заголовок страницы |
| **headline-large** | 2rem (32px) | 2.5rem (40px) | 400 | 0rem | brand | Заголовок диалога, главная карточка |
| **headline-medium** | 1.75rem (28px) | 2.25rem (36px) | 400 | 0rem | brand | Заголовок раздела, модального окна |
| **headline-small** | 1.5rem (24px) | 2rem (32px) | 400 | 0rem | brand | Подзаголовок, заголовок списка |
| **title-large** | 1.375rem (22px) | 1.75rem (28px) | 400 | 0rem | brand | App bar title, navigation bar |
| **title-medium** | 1rem (16px) | 1.5rem (24px) | 500 | 0.009375rem (0.15px) | plain | Заголовок компонента, list item primary |
| **title-small** | 0.875rem (14px) | 1.25rem (20px) | 500 | 0.00625rem (0.1px) | plain | Подпись в компоненте |
| **body-large** | 1rem (16px) | 1.5rem (24px) | 400 | 0.03125rem (0.5px) | plain | Основной текст, длинные описания |
| **body-medium** | 0.875rem (14px) | 1.25rem (20px) | 400 | 0.015625rem (0.25px) | plain | Вторичный текст |
| **body-small** | 0.75rem (12px) | 1rem (16px) | 400 | 0.025rem (0.4px) | plain | Подпись, caption |
| **label-large** | 0.875rem (14px) | 1.25rem (20px) | 500 | 0.00625rem (0.1px) | plain | Кнопки, навигационные метки |
| **label-medium** | 0.75rem (12px) | 1rem (16px) | 500 | 0.03125rem (0.5px) | plain | Chips, badges, tabs |
| **label-small** | 0.6875rem (11px) | 1rem (16px) | 500 | 0.03125rem (0.5px) | plain | Аннотации, overflow menu |

> **label-large-weight-prominent** = 700 (жирный вариант для selected state)  
> **label-medium-weight-prominent** = 700

### 1.3 CSS-токены `--md-sys-typescale-*`

Паттерн имён: `--md-sys-typescale-{role}-{property}`

```css
/* Пример полного набора для body-large */
--md-sys-typescale-body-large-font
--md-sys-typescale-body-large-size       /* 1rem */
--md-sys-typescale-body-large-line-height /* 1.5rem */
--md-sys-typescale-body-large-weight     /* 400 */
--md-sys-typescale-body-large-tracking   /* 0.03125rem */
```

### 1.4 Использование CSS-классов из @material/web

```css
/* Библиотека предоставляет CSS-классы .md-typescale-* */
.md-typescale-display-large   { ... }
.md-typescale-headline-medium { ... }
.md-typescale-label-large     { ... }
/* И prominent-варианты для label */
.md-typescale-label-large-prominent { font-weight: 700; }
```

```css
/* Применение токенов вручную */
.event-title {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  font-weight: var(--md-sys-typescale-title-medium-weight);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
}
```

---

## 2. Shape (Форма)

### 2.1 Shape Scale

Значения из `tokens/versions/v0_192/_md-sys-shape.scss`.

| Уровень | Токен | Значение | Применение компонентов |
|---|---|---|---|
| **none** | `--md-sys-shape-corner-none` | 0px | Data tables, full-width elements |
| **extra-small** | `--md-sys-shape-corner-extra-small` | 4px | Tooltips, snackbars, menu items |
| **small** | `--md-sys-shape-corner-small` | 8px | Chips, small cards, text fields |
| **medium** | `--md-sys-shape-corner-medium` | 12px | Cards, date pickers, time pickers |
| **large** | `--md-sys-shape-corner-large` | 16px | Navigation drawer, side sheets, dialogs (corners) |
| **extra-large** | `--md-sys-shape-corner-extra-large` | 28px | FAB, extended FAB, bottom sheets |
| **full** | `--md-sys-shape-corner-full` | 9999px | Buttons, sliders, avatar chips, badges |

### 2.2 Directional variants

```css
/* Доступны варианты для частичного скругления */
--md-sys-shape-corner-extra-large-top  /* 28px 28px 0px 0px — только верх */
--md-sys-shape-corner-large-top        /* 16px 16px 0px 0px */
--md-sys-shape-corner-large-start      /* 16px 0px 0px 16px — только начало (LTR = left) */
--md-sys-shape-corner-large-end        /* 0px 16px 16px 0px */
--md-sys-shape-corner-extra-small-top  /* 4px 4px 0px 0px */
```

### 2.3 Соответствие компонент → shape

| Компонент | Shape уровень | border-radius |
|---|---|---|
| Button (filled, elevated, tonal, outlined, text) | full | 9999px |
| FAB | extra-large | 28px |
| Extended FAB | extra-large | 28px |
| Card | medium | 12px |
| Dialog | extra-large | 28px |
| Bottom sheet | extra-large-top | 28px 28px 0 0 |
| Navigation drawer | large-end | 0 16px 16px 0 |
| Chip | small | 8px |
| Text field (filled) | extra-small-top | 4px 4px 0 0 |
| Text field (outlined) | extra-small | 4px |
| Tooltip | extra-small | 4px |
| Snackbar | extra-small | 4px |
| Menu | extra-small | 4px |
| Navigation bar | none | 0px |

### 2.4 Переопределение shape компонентов

```css
/* @material/web компоненты принимают собственные shape-токены */
md-filled-button {
  --md-filled-button-container-shape: var(--md-sys-shape-corner-medium);
}

md-card {
  --md-elevated-card-container-shape: var(--md-sys-shape-corner-large);
}
```

---

## 3. Elevation

### 3.1 Уровни elevation

Значения из `tokens/versions/v0_192/_md-sys-elevation.scss`.  
Числа — абстрактные уровни (не dp), которые компонент `<md-elevation>` переводит в box-shadow через CSS calc().

| Уровень | Токен-значение | Ambient shadow | Key shadow | Применение |
|---|---|---|---|---|
| **level0** | 0 | 0px 0px 0px 0px | 0px 0px 0px 0px | Flat surfaces, text fields on surface |
| **level1** | 1 | 0px 1px 3px 1px | 0px 1px 2px 0px | Cards (resting), elevated button (resting) |
| **level2** | 3 | 0px 2px 6px 2px | 0px 1px 2px 0px | Filled card (hover), dropdown menu |
| **level3** | 6 | 0px 4px 8px 3px | 0px 1px 3px 0px | FAB (resting), navigation drawer |
| **level4** | 8 | 0px 6px 10px 4px | 0px 2px 3px 0px | FAB (hover), app bar scrolled |
| **level5** | 12 | 0px 8px 12px 6px | 0px 4px 4px 0px | Dialog, modal bottom sheet |

> Реализация в CSS использует два `::pseudo-element` с `opacity: 0.3` (key) и `opacity: 0.15` (ambient).

### 3.2 Компонент `<md-elevation>`

```html
<!-- Встраивается внутрь компонента с position: relative -->
<div class="my-card" style="position: relative; --md-elevation-level: 1;">
  <md-elevation></md-elevation>
  Контент карточки
</div>
```

```css
/* Анимация смены уровня */
.my-card {
  position: relative;
  transition: --md-elevation-level 250ms cubic-bezier(0.2, 0, 0, 1);
}

.my-card:hover {
  --md-elevation-level: 2;
}
```

### 3.3 Surface Tint Overlay

В M3 elevation дополнительно выражается через **surface tint** — наложение `primary`-цвета с нарастающей opacity поверх surface-цвета.

| Уровень | Tint opacity |
|---|---|
| level0 | 0% |
| level1 | 5% |
| level2 | 8% |
| level3 | 11% |
| level4 | 12% |
| level5 | 14% |

> [⚠ непроверено] Точные tint-проценты из официального M3 style guide. `@material/web` на данный момент реализует tint через `--md-sys-color-surface-tint` в цветовых токенах компонентов.

```css
/* Surface tint реализуется через цветовые токены, а не elevation токены напрямую */
.elevated-surface {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 8%,
    var(--md-sys-color-surface)
  );
}
```

### 3.4 CSS-токен управления

```css
/* Главный токен: --md-elevation-level (0–5, целые числа) */
:root {
  --md-elevation-level: 0;
}

/* Цвет тени переопределяется через */
:root {
  --md-sys-color-shadow: rgba(0, 0, 0, 1); /* default */
}
```

---

## 4. Motion (Движение)

### 4.1 Easing-токены

Значения из `tokens/versions/v0_192/_md-sys-motion.scss`.

| Токен | cubic-bezier | Применение |
|---|---|---|
| `--md-sys-motion-easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Большинство переходов, где элемент остаётся в видимой области |
| `--md-sys-motion-easing-emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Элемент входит в экран (появляется) |
| `--md-sys-motion-easing-emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Элемент уходит с экрана (исчезает) |
| `--md-sys-motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Простые переходы внутри компонентов |
| `--md-sys-motion-easing-standard-decelerate` | `cubic-bezier(0, 0, 0, 1)` | Элемент входит, простой вход |
| `--md-sys-motion-easing-standard-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | Элемент уходит, простой выход |
| `--md-sys-motion-easing-linear` | `cubic-bezier(0, 0, 1, 1)` | Прогресс-бары, непрерывные анимации |
| `--md-sys-motion-easing-legacy` | `cubic-bezier(0.4, 0, 0.2, 1)` | Совместимость с M2 |

> Примечание: `easing-emphasized` и `easing-standard` имеют одинаковое значение `cubic-bezier(0.2, 0, 0, 1)` в токенах — разница в семантике применения.

### 4.2 Duration-токены

| Категория | Токен | Значение | Применение |
|---|---|---|---|
| Short 1 | `--md-sys-motion-duration-short1` | 50ms | Мгновенная обратная связь (ripple start) |
| Short 2 | `--md-sys-motion-duration-short2` | 100ms | Fade in/out мелких элементов |
| Short 3 | `--md-sys-motion-duration-short3` | 150ms | Hover state transitions |
| Short 4 | `--md-sys-motion-duration-short4` | 200ms | Стандартный простой переход |
| Medium 1 | `--md-sys-motion-duration-medium1` | 250ms | Появление компонентов (tooltip, menu) |
| Medium 2 | `--md-sys-motion-duration-medium2` | 300ms | Переход между состояниями компонента |
| Medium 3 | `--md-sys-motion-duration-medium3` | 350ms | Расширение/коллапс (accordion) |
| Medium 4 | `--md-sys-motion-duration-medium4` | 400ms | Сложные переходы компонента |
| Long 1 | `--md-sys-motion-duration-long1` | 450ms | Navigation transitions |
| Long 2 | `--md-sys-motion-duration-long2` | 500ms | Page-level transitions |
| Long 3 | `--md-sys-motion-duration-long3` | 550ms | Большие layout changes |
| Long 4 | `--md-sys-motion-duration-long4` | 600ms | Полноэкранные переходы |
| Extra Long 1 | `--md-sys-motion-duration-extra-long1` | 700ms | Container transform (малый → крупный) |
| Extra Long 2 | `--md-sys-motion-duration-extra-long2` | 800ms | Container transform (средний) |
| Extra Long 3 | `--md-sys-motion-duration-extra-long3` | 900ms | Сложные морфинг-переходы |
| Extra Long 4 | `--md-sys-motion-duration-extra-long4` | 1000ms | Полноэкранный морфинг |

### 4.3 Паттерны переходов M3

#### Container Transform
Связывает два UI-элемента: источник (карточка/кнопка) расширяется в контейнер назначения (полная страница/диалог). Элементы разделяют общий контейнер.

- Duration: extra-long1–2 (700–800ms)
- Easing: emphasized-decelerate (вход), emphasized-accelerate (выход)
- Применение: карточка → detail view, FAB → полный экран

#### Fade Through
Элементы fade out и fade in через нулевую прозрачность. Используется когда нет явной связи между источником и назначением.

- Duration: medium1–2 (250–300ms)
- Easing: emphasized
- Применение: смена вкладок bottom nav, смена категорий

#### Shared Axis
Переход вдоль X, Y, или Z оси. Передаёт направленность и иерархию.

- Duration: medium3–4 (350–400ms)
- Easing: emphasized-decelerate (вход), emphasized-accelerate (выход)
- Применение: onboarding шаги (X), search expand/collapse (Y), drill-down (Z)

### 4.4 Готовые CSS custom properties

```css
:root {
  /* Easing */
  --md-sys-motion-easing-emphasized:             cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized-decelerate:  cubic-bezier(0.05, 0.7, 0.1, 1);
  --md-sys-motion-easing-emphasized-accelerate:  cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-standard:               cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-standard-decelerate:    cubic-bezier(0, 0, 0, 1);
  --md-sys-motion-easing-standard-accelerate:    cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-linear:                 cubic-bezier(0, 0, 1, 1);

  /* Duration */
  --md-sys-motion-duration-short1:       50ms;
  --md-sys-motion-duration-short2:       100ms;
  --md-sys-motion-duration-short3:       150ms;
  --md-sys-motion-duration-short4:       200ms;
  --md-sys-motion-duration-medium1:      250ms;
  --md-sys-motion-duration-medium2:      300ms;
  --md-sys-motion-duration-medium3:      350ms;
  --md-sys-motion-duration-medium4:      400ms;
  --md-sys-motion-duration-long1:        450ms;
  --md-sys-motion-duration-long2:        500ms;
  --md-sys-motion-duration-long3:        550ms;
  --md-sys-motion-duration-long4:        600ms;
  --md-sys-motion-duration-extra-long1:  700ms;
  --md-sys-motion-duration-extra-long2:  800ms;
  --md-sys-motion-duration-extra-long3:  900ms;
  --md-sys-motion-duration-extra-long4:  1000ms;
}
```

### 4.5 Интеграция с библиотекой `motion` (framer-motion/motion)

```tsx
import { motion } from "motion/react";

// Emphasized easing через custom bezier
const emphasizedEasing = [0.2, 0, 0, 1] as const;
const emphasizedDecelerateEasing = [0.05, 0.7, 0.1, 1] as const;
const emphasizedAccelerateEasing = [0.3, 0, 0.8, 0.15] as const;

// Tooltip появление (medium1, emphasized-decelerate)
const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25, // medium1 = 250ms
      ease: emphasizedDecelerateEasing,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2, // short4 = 200ms
      ease: emphasizedAccelerateEasing,
    },
  },
};

// Popover / dialog появление (medium4, emphasized)
const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4, // medium4 = 400ms
      ease: emphasizedEasing,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2, // short4 = 200ms
      ease: emphasizedAccelerateEasing,
    },
  },
};

// Hover elevation transition
<motion.div
  whileHover={{ "--md-elevation-level": 2 }}
  transition={{ duration: 0.2, ease: emphasizedEasing }}
/>
```

---

## 5. State Layers

### 5.1 Opacity значения

Значения из `tokens/versions/v0_192/_md-sys-state.scss`.

| Состояние | Токен | Opacity |
|---|---|---|
| **hover** | `--md-sys-state-hover-state-layer-opacity` | 0.08 (8%) |
| **focus** | `--md-sys-state-focus-state-layer-opacity` | 0.12 (12%) |
| **pressed** | `--md-sys-state-pressed-state-layer-opacity` | 0.12 (12%) |
| **dragged** | `--md-sys-state-dragged-state-layer-opacity` | 0.16 (16%) |

### 5.2 Механизм наложения

State layer — отдельный псевдоэлемент или элемент, покрывающий всю поверхность компонента. Накладывается цвет `on-{container}` с заданной opacity.

```
[Surface] → [State Layer: on-surface color × opacity] → [Content]
```

| Поверхность компонента | Цвет state layer |
|---|---|
| Primary / filled button | `on-primary` |
| Surface / card | `on-surface` |
| Secondary container / tonal button | `on-secondary-container` |
| Error container | `on-error-container` |

### 5.3 CSS реализация

```css
/* Вариант через pseudo-element */
.m3-button {
  position: relative;
  overflow: hidden;
}

.m3-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--md-sys-color-on-primary);
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
  border-radius: inherit;
  pointer-events: none;
}

.m3-button:hover::before   { opacity: 0.08; }
.m3-button:focus::before   { opacity: 0.12; }
.m3-button:active::before  { opacity: 0.12; }

/* @material/web компоненты реализуют state layer автоматически */
/* Токены для переопределения: */
md-filled-button {
  --md-filled-button-hover-state-layer-opacity:   0.08;
  --md-filled-button-focus-state-layer-opacity:   0.12;
  --md-filled-button-pressed-state-layer-opacity: 0.12;
}
```

### 5.4 State layer в @material/web

Все интерактивные компоненты используют встроенный `<md-ripple>` + state layer layer. State layer управляется через компонентные токены:

```css
md-filled-button {
  --md-filled-button-hover-state-layer-color: var(--md-sys-color-on-primary);
  --md-filled-button-hover-state-layer-opacity: 0.08;
  --md-filled-button-pressed-state-layer-color: var(--md-sys-color-on-primary);
  --md-filled-button-pressed-state-layer-opacity: 0.12;
}
```

---

## 6. Density и Touch Targets

### 6.1 Touch target минимум

| Требование | Значение |
|---|---|
| Минимальный touch target | 48 × 48 dp |
| Минимальный визуальный размер | 24 × 24 dp (иконки) |
| Рекомендуемый gap между targets | 8dp |

### 6.2 Density уровни

M3 поддерживает density-систему (–4 до 0) для компонентов в desktop-средах. Каждый шаг уменьшает высоту на 4dp.

| Density уровень | Описание | Применение |
|---|---|---|
| 0 (default) | 48dp height | Mobile, стандартный |
| -1 | 44dp height | Comfortable desktop |
| -2 | 40dp height | Compact desktop |
| -3 | 36dp height | Dense data tables |
| -4 | 32dp height | Ultra-compact [⚠ непроверено] |

```css
/* @material/web density через компонентные токены */
md-filled-text-field {
  --md-filled-text-field-container-height: 44px; /* density -1 */
}

/* Глобальное уменьшение кнопок */
md-filled-button {
  --md-filled-button-container-height: 36px;
}
```

---

## 7. Быстрый старт: CSS-переменные для проекта

```css
/* Вставить в :root глобального CSS */
:root {
  /* === ШРИФТЫ === */
  --md-ref-typeface-brand: "Roboto", sans-serif;
  --md-ref-typeface-plain: "Roboto", sans-serif;

  /* === SHAPE === */
  --md-sys-shape-corner-none:        0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small:       8px;
  --md-sys-shape-corner-medium:      12px;
  --md-sys-shape-corner-large:       16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full:        9999px;

  /* === ELEVATION === */
  /* Управляется через --md-elevation-level: 0|1|2|3|4|5 */

  /* === MOTION: EASING === */
  --md-sys-motion-easing-emphasized:            cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-standard:              cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-standard-decelerate:   cubic-bezier(0, 0, 0, 1);
  --md-sys-motion-easing-standard-accelerate:   cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-linear:                cubic-bezier(0, 0, 1, 1);

  /* === MOTION: DURATION === */
  --md-sys-motion-duration-short1:      50ms;
  --md-sys-motion-duration-short2:      100ms;
  --md-sys-motion-duration-short3:      150ms;
  --md-sys-motion-duration-short4:      200ms;
  --md-sys-motion-duration-medium1:     250ms;
  --md-sys-motion-duration-medium2:     300ms;
  --md-sys-motion-duration-medium3:     350ms;
  --md-sys-motion-duration-medium4:     400ms;
  --md-sys-motion-duration-long1:       450ms;
  --md-sys-motion-duration-long2:       500ms;
  --md-sys-motion-duration-long3:       550ms;
  --md-sys-motion-duration-long4:       600ms;
  --md-sys-motion-duration-extra-long1: 700ms;
  --md-sys-motion-duration-extra-long2: 800ms;
  --md-sys-motion-duration-extra-long3: 900ms;
  --md-sys-motion-duration-extra-long4: 1000ms;

  /* === STATE LAYERS === */
  --md-sys-state-hover-state-layer-opacity:    0.08;
  --md-sys-state-focus-state-layer-opacity:    0.12;
  --md-sys-state-pressed-state-layer-opacity:  0.12;
  --md-sys-state-dragged-state-layer-opacity:  0.16;
}
```

---

## Открытые вопросы / риски

1. **Surface tint opacity**: Значения tint overlay (5%/8%/11%/12%/14%) взяты из документации M3 style guide, но не найдены в SCSS-токенах `@material/web`. Возможно реализовано иначе — через `--md-sys-color-surface-container-*` иерархию цветов, а не явный overlay.

2. **Emphasized vs Standard easing**: В токенах `easing-emphasized` и `easing-standard` имеют **одинаковое** значение `cubic-bezier(0.2, 0, 0, 1)`. Реальное различие — в смысловом применении (emphasized для spatial transitions, standard для component-level). Проверить, не изменилось ли это в актуальной версии.

3. **motion-токены в @material/web**: Переменные `--md-sys-motion-*` определены в SCSS-токенах, но из документации `material-web.dev` известно, что компоненты библиотеки **не используют** эти CSS custom properties напрямую — их transitions захардкожены. Тема переопределяется через компонентные токены (например `--md-filled-button-pressed-state-layer-opacity`), а не глобальными motion-токенами.

4. **Density API**: Официального глобального density-токена для `@material/web` нет — только покомпонентные `container-height` токены. Нет единого способа задать density для всего приложения одной переменной.

5. **Extra-large shape нет в shape-токенах файла**: В реальном SCSS-файле `_md-sys-shape.scss` отсутствует `corner-extra-large` в основном файле (есть только в `corner-extra-large-top`). Возможно нужно проверить актуальную версию — в raw токенах выше `corner-extra-large: 28px` присутствует.

6. **Font sizes в rem vs sp**: M3 специфицирует в `sp` (scale-independent pixels, эквивалент dp для текста). В веб-реализации используется `rem` с базой 16px. При кастомизации base font-size изменится вся типографическая шкала — это ожидаемое поведение.

7. **Roboto Flex**: M3 рекомендует Roboto Flex (variable font) для лучшей точности в type scale. Стандартный Roboto не поддерживает промежуточные веса. Для кастомных шрифтов рекомендуется также использовать variable font.
