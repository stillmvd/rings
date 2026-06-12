# M3 Layout & Navigation — справочник для Timeline

> Desktop-first приложение: 3 режима (Таймлайн / Галерея / Календарь) + Настройки.  
> Основной экран — полноэкранный Canvas. Expanded/Large — основные target size classes.

---

## 1. Window Size Classes

| Size Class | Ширина | Типичное устройство | Колонки grid | Margins |
|---|---|---|---|---|
| **Compact** | < 600 dp | Phone portrait | 4 | 16 dp |
| **Medium** | 600–839 dp | Tablet portrait, foldable | 8 | 24 dp |
| **Expanded** | 840–1199 dp | Tablet landscape, desktop | 12 | 24 dp |
| **Large** | 1200–1599 dp | Desktop | 12 | 24 dp |
| **Extra-large** | ≥ 1600 dp | Ultra-wide | 12 | 24 dp |

Источники: [m3.material.io/foundations/layout/applying-layout](https://m3.material.io/foundations/layout/applying-layout), [Android Developers codelabs](https://developer.android.com/codelabs/adaptive-material-guidance).

### Навигационные паттерны по size class

| Size Class | Рекомендуемый компонент | Примечание |
|---|---|---|
| **Compact** | Navigation bar (bottom) | Всегда bottom bar на compact |
| **Medium** | Navigation rail | Вертикальная навигация слева |
| **Expanded** | Navigation rail | Не bottom bar, rail или drawer |
| **Large** | Navigation rail или expanded rail | Rail или rail с labels |
| **Extra-large** | Navigation drawer (standard) | Постоянный drawer |

> **Для Timeline:** target — Expanded/Large (десктоп). Рекомендуется **Navigation Rail** с возможностью расширения в drawer на extra-large.

---

## 2. Navigation Rail

### Анатомия и размеры

| Параметр | M3 | M3 Expressive |
|---|---|---|
| Ширина (collapsed) | 80 dp | 96 dp |
| Elevation | 0 dp | 3 dp |
| Icon size | 24 dp | 24 dp |
| Item min height | 60 dp | 64 dp |
| Active indicator width | 56 dp | адаптивная (HUG) |
| Active indicator height | 32 dp | 56 dp |
| Top margin content | 8 dp | 44 dp |
| Item spacing | 0 dp | 4 dp |

Источники: [Navigation Rail — material-components-android](https://github.com/material-components/material-components-android/blob/master/docs/components/NavigationRail.md).

### Когда применять

- **Medium (600–839 dp):** основной вариант — rail вместо bottom bar
- **Expanded–Extra-large (840 dp+):** rail как стандарт, не bottom bar

### FAB в Navigation Rail

FAB размещается через `app:headerLayout` в верхней части rail (Android) или как первый child над item-списком (CSS). При переходе rail → expanded rail FAB трансформируется в Extended FAB.

### Цвета

- Inactive icon/label: `colorOnSurfaceVariant`
- Active icon: `colorOnSecondaryContainer`
- Active indicator: `colorSecondaryContainer`
- Container background: `colorSurface`

### @material/web 2.4.1 — ОТСУТСТВУЕТ

Navigation Rail **не реализован** в `@material/web`. Нужна ручная сборка из:
- `md-icon-button` или `md-icon` + `md-ripple`
- `md-list` + `md-list-item`
- CSS-контейнер `width: 80px`, `display: flex; flex-direction: column`
- Активный индикатор — через CSS `border-radius: 16px`, `background: var(--md-sys-color-secondary-container)`

---

## 3. Navigation Bar (Bottom)

- Применяется только на **Compact** (< 600 dp)
- Высота: **80 dp**
- Иконки: 24 dp, labels обязательны
- Макс. 5 destinations

### @material/web 2.4.1 — ОТСУТСТВУЕТ

Navigation Bar (bottom) также отсутствует. Реализуется вручную.

> **Для Timeline:** Bottom bar не нужен — приложение desktop-only (Expanded+).

---

## 4. Navigation Drawer

### Standard vs Modal

| Параметр | Standard | Modal |
|---|---|---|
| Поведение | Сосуществует с контентом | Блокирует контент (scrim) |
| Когда | Expanded/Extra-large | Compact, overlay-режим |
| Ширина | до 360 dp (M3 spec) / до 280 dp (Android impl) | до 360 dp |
| Elevation | 0 dp | 1 dp (+ scrim) |

> **Примечание:** Android-реализация использует 280 dp max-width, M3 spec указывает 360 dp. Flutter issue [#123380](https://github.com/flutter/flutter/issues/123380) подтверждает расхождение.

### Анатомия

- **Header** (опционально): `textAppearanceHeadlineSmall` + `textAppearanceTitleSmall`, padding 24 dp
- **Items:** горизонтальный padding 28 dp, вертикальный 4 dp, icon 24 dp, item padding 12 dp
- **Dividers:** автоматически между group-секциями, высота 1 dp, inset 28 dp
- **Corner radius:** полный (50%) на item shape
- Scrim: чёрный, 60% opacity

### Цвета

- Active text/icon: `colorOnSecondaryContainer`
- Active indicator: `colorSecondaryContainer`
- Inactive: `colorOnSurfaceVariant`
- Background: `colorSurfaceContainerLow`

### M3 Expressive update

Navigation drawer **deprecated** в M3 Expressive в пользу **expanded navigation rail**.

### @material/web 2.4.1 — ОТСУТСТВУЕТ

Navigation Drawer отсутствует. Реализуется через `md-list` + CSS-контейнер с `position: fixed` и `transform: translateX`.

---

## 5. Top App Bar

### 4 типа и размеры

| Тип | Высота | Поведение при скролле | Когда |
|---|---|---|---|
| **Small** | 64 dp | Поднимает elevation / меняет цвет | Плотные экраны, мобильный |
| **Center-aligned** | 64 dp | Аналогично Small | Когда заголовок по центру |
| **Medium** | 112 dp | Collapsing → small (64 dp) | Контентные страницы |
| **Large** | 152 dp | Collapsing → small (64 dp) | Подчёркнутый заголовок |

- Leading icon: 24 dp, touch target 48 dp
- Trailing icons: до 3 штук по 24 dp
- `liftOnScroll`: меняет `colorSurface` → `colorSurfaceContainer` при скролле

Источники: [m3.material.io/components/app-bars/specs](https://m3.material.io/components/app-bars/specs), [material-components-android TopAppBar](https://github.com/material-components/material-components-android/blob/master/docs/components/TopAppBar.md).

### @material/web 2.4.1 — ОТСУТСТВУЕТ

Top App Bar отсутствует в `@material/web`. Реализуется через CSS + `md-icon-button`.

> **Для Timeline:** На desktop с Navigation Rail top app bar минимален или не нужен. Canvas-интерфейс обходится без него — тулбар режимов можно разместить как secondary row или интегрировать в rail.

---

## 6. Floating Action Button (FAB)

### Типы и размеры

| Тип | Размер (h×w) | `size` attribute | Когда |
|---|---|---|---|
| **Small FAB** | 40×40 dp | `small` | Вспомогательные действия, inline |
| **FAB** (regular) | 56×56 dp | `medium` (default) | Основное действие экрана |
| **Large FAB** | 96×96 dp | `large` | Важное действие, большие экраны |
| **Extended FAB** | 56 dp h, variable w | — (атрибут `label`) | Когда нужен текст, широкие экраны |
| **Branded FAB** | 56×56 dp | — | С логотипом бренда |

### Позиционирование

- Стандарт: **правый нижний угол**, margin **16 dp** от краёв
- На expanded экране рядом с Navigation Rail: допустимо смещение от rail
- FAB в rail: в `headerLayout` вверху rail

### md-fab API (`@material/web` — ПРИСУТСТВУЕТ)

```html
<md-fab variant="primary" size="medium" aria-label="Создать событие">
  <md-icon slot="icon">add</md-icon>
</md-fab>

<md-fab variant="primary" label="Создать событие" size="medium">
  <md-icon slot="icon">add</md-icon>
</md-fab>

<md-branded-fab size="large" aria-label="Action">
  <svg slot="icon">...</svg>
</md-branded-fab>
```

| Атрибут | Значения | Описание |
|---|---|---|
| `variant` | `surface` / `primary` / `secondary` / `tertiary` | Цветовой вариант (только md-fab) |
| `size` | `small` / `medium` / `large` | Размер |
| `label` | string | Текст для extended вида |
| `lowered` | boolean | Пониженная elevation |
| `touch-target` | `"none"` | Убрать touch zone (для small) |

> **Для Timeline:** FAB `primary`, `size="medium"`, label "Создать событие" появляется в Таймлайн-режиме. В Canvas-виде позиционируется `position: fixed; bottom: 16px; right: 16px`.

---

## 7. Canonical Layouts

### Обзор

| Layout | Применение | Поведение на Compact | Поведение на Expanded |
|---|---|---|---|
| **Feed** | Галерея карточек | 1 колонка | Многоколоночная сетка |
| **List-Detail** | Список + детали | Либо список, либо детали | Два pane рядом |
| **Supporting Pane** | Основной контент + форма | Supporting pane скрыта (sheet) | ~70% main + ~30% pane |

Источник: [developer.android.com/develop/adaptive-apps/guides/canonical-layouts](https://developer.android.com/develop/adaptive-apps/guides/canonical-layouts).

### Для Timeline

| Режим | Canonical layout | Реализация |
|---|---|---|
| **Таймлайн (Canvas)** | Supporting Pane | Canvas = main pane (~70–75%), EventForm = side sheet (~25–30%) |
| **Галерея** | Feed | `CSS Grid` с `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` |
| **Календарь** | Supporting Pane или одиночный pane | Календарная сетка = main, детали события = side panel |
| **Настройки** | List-Detail | Список разделов слева, контент справа |

---

## 8. Side Sheet

### Standard vs Modal

| Параметр | Standard Side Sheet | Modal Side Sheet |
|---|---|---|
| Поведение | Рядом с основным контентом | Блокирует экран (scrim) |
| Когда | Medium/Expanded, постоянная форма | Compact, временные действия |
| Ширина (Android) | ~256 dp (из примеров кода) | до 400 dp max |
| Corner radius | `shapeAppearanceCornerLarge` (~24 dp) | аналогично |
| Drag | Поддерживается (vertical drag) | Горизонтальный swipe для закрытия |

Источник: [material-components-android SideSheet.md](https://github.com/material-components/material-components-android/blob/master/docs/components/SideSheet.md).

### Side Sheet vs Dialog для EventForm (Timeline)

| Критерий | Side Sheet | Dialog |
|---|---|---|
| Canvas видимость | Остаётся видимым | Частично перекрывается |
| Контекст | Пользователь видит позицию события | Контекст теряется |
| Размер формы | Любой (full-height) | Ограничен (scroll внутри) |
| UX на desktop | **Предпочтительнее** | Приемлемо для confirm-действий |
| Прокрутка | Независимая | Внутри dialog |

**Рекомендация для Timeline:** использовать **Standard Side Sheet** (статический правый pane) на Expanded+. На Compact — Modal Side Sheet или полноэкранный overlay.

> **Текущая реализация** использует `EventPopover` (Popover API). Миграция на side sheet улучшит UX на desktop.

### @material/web 2.4.1 — ОТСУТСТВУЕТ

Side Sheet отсутствует. Реализуется CSS-панелью `position: fixed; right: 0; top: 0; height: 100%; width: 360px` + motion-анимация.

---

## 9. Spacing, Grid, Margins

### Пространственная система

- Базовая единица: **4 dp** (шаг сетки)
- Компактные отступы компонентов: кратны 4 dp
- Рекомендуемые значения padding внутри pane: **16 dp**

### Margins по size class

| Size Class | Margin (edge) | Pane spacing | Gutters |
|---|---|---|---|
| Compact | 16 dp | — | 16 dp |
| Medium | 24 dp | 24 dp | 24 dp |
| Expanded | 24 dp | 24 dp | 24 dp |
| Large | 24 dp | 24 dp | 24 dp |
| Extra-large | 24 dp | 24 dp | 24 dp |

### Grid columns

| Size Class | Columns |
|---|---|
| Compact | 4 |
| Medium | 8 |
| Expanded+ | 12 |

> Источник: [m3.material.io/foundations/layout/understanding-layout/spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing), developer.android.com codelabs.

---

## 10. Компоненты @material/web 2.4.1 — итоговая таблица

| Компонент | Есть в @material/web 2.4.1 | Директория |
|---|---|---|
| `md-fab` | **ДА** | `/fab/fab.js` |
| `md-branded-fab` | **ДА** | `/fab/branded-fab.js` |
| `md-button` (filled/outlined/text/elevated/tonal) | **ДА** | `/button/` |
| `md-icon-button` | **ДА** | `/iconbutton/` |
| `md-icon` | **ДА** | `/icon/` |
| `md-ripple` | **ДА** | `/ripple/` |
| `md-list` / `md-list-item` | **ДА** | `/list/` |
| `md-divider` | **ДА** | `/divider/` |
| `md-dialog` | **ДА** | `/dialog/` |
| `md-tabs` / `md-tab` | **ДА** | `/tabs/` |
| `md-menu` / `md-menu-item` | **ДА** | `/menu/` |
| `md-checkbox` | **ДА** | `/checkbox/` |
| `md-radio` | **ДА** | `/radio/` |
| `md-switch` | **ДА** | `/switch/` |
| `md-slider` | **ДА** | `/slider/` |
| `md-select` / `md-option` | **ДА** | `/select/` |
| `md-text-field` / `md-outlined-text-field` | **ДА** | `/textfield/` |
| `md-chip-set` / `md-*-chip` | **ДА** | `/chips/` |
| `md-elevation` | **ДА** | `/elevation/` |
| `md-focus-ring` | **ДА** | `/focus/` |
| `md-circular-progress` / `md-linear-progress` | **ДА** | `/progress/` |
| **Navigation Rail** | **НЕТ** | — |
| **Navigation Bar (bottom)** | **НЕТ** | — |
| **Navigation Drawer** | **НЕТ** | — |
| **Top App Bar** | **НЕТ** | — |
| **Side Sheet** | **НЕТ** | — |
| **Bottom Sheet** | **НЕТ** | — |
| **Search Bar** | **НЕТ** | — |
| **Card** | **НЕТ** | — |
| **Badge** | **НЕТ** | — |

> **Статус @material/web:** библиотека находится в **maintenance mode** (подтверждено roadmap.md). Новые навигационные компоненты не планируются. Issue [#5894](https://github.com/material-components/material-web/issues/5894) (февраль 2026) — запрос сообщества без ответа от команды.

---

## 11. Рекомендации по навигационной оболочке для Timeline

### Предлагаемая архитектура (Expanded/Large desktop)

```
┌─────────┬──────────────────────────────────────────┐
│         │  [Top toolbar: search, zoom, filters]     │
│  NAV    ├──────────────────────────────────────────┤
│  RAIL   │                                          │
│  80dp   │          MAIN CONTENT AREA               │
│         │  (Canvas / Gallery / Calendar)            │
│  ● TL   │                                          │
│  ○ GLL  │                                     ┌────┤
│  ○ CAL  │                                     │SIDE│
│  ─────  │                                     │FORM│
│  ○ SET  │                                     │360d│
│         │                                     └────┤
│  [FAB]  │                                          │
└─────────┴──────────────────────────────────────────┘
```

### Структура компонентов

1. **Navigation Rail** (ручная реализация)
   - Ширина: 80 dp (CSS: `width: 80px`)
   - 4 destinations: Таймлайн, Галерея, Календарь, Настройки
   - FAB «Создать событие» в header rail (`md-fab`, `variant="primary"`)
   - Сборка из `md-icon` + `md-ripple` + CSS

2. **Main content area** (flex-grow)
   - Таймлайн: Canvas полной высоты и ширины
   - Галерея: CSS Grid, `auto-fill`, `minmax(280px, 1fr)`
   - Календарь: фиксированная высота сетки (уже реализовано)

3. **Side Form Panel** (Standard Side Sheet)
   - Ширина: 360–400 dp, `position` в потоке (не fixed) при standard
   - EventForm в side pane вместо текущего EventPopover
   - Анимация через `motion` (уже в стеке)
   - Прячется когда нет активного события

4. **Top Toolbar** (опционально)
   - Высота 56–64 dp
   - Зум-контролы для Canvas, фильтры значимости
   - Реализуется как простой CSS flex-bar без `md-top-app-bar`

5. **FAB**
   - `md-fab` с `label="Создать событие"` (extended) — в нижней части rail
   - Или `position: fixed; bottom: 16px; right: 376px` (рядом с side panel)

### Responsive behaviour (если понадобится compact)

- Compact: bottom navigation bar (manual) + modal side sheet для формы
- Medium: rail (80dp) + modal side sheet

---

## 12. Открытые вопросы / риски

### Риски

| Риск | Уровень | Описание |
|---|---|---|
| **@material/web maintenance mode** | Высокий | Навигационные компоненты не будут добавлены. Весь navigation shell — ручная реализация |
| **Navigation Rail — нет готового компонента** | Высокий | ~2–3 дня разработки: container, items, active indicator, FAB slot, ripple, accessibility |
| **Navigation Drawer deprecated** | Средний | В M3 Expressive drawer заменяется expanded rail — актуально для extra-large |
| **Side Sheet нет в @material/web** | Средний | Реализация через CSS + motion, нет готового API |
| **Top App Bar отсутствует** | Низкий | На desktop с rail минимален, заменяется custom toolbar |
| **280 dp vs 360 dp drawer width** | Низкий | Расхождение между spec и impl — выбрать 360 dp для web |

### Открытые вопросы

1. **Rail vs Drawer на extra-large:** При ширине ≥ 1600 dp переходить к expanded rail (с labels) или standard drawer? M3 Expressive склоняется к expanded rail.

2. **EventForm как side sheet vs popover:** Текущий `EventPopover` функционален. Когда мигрировать на side panel? Только при добавлении расширенной формы (фото, описание, связи)?

3. **Top toolbar — нужен ли?** Canvas имеет собственные контролы (зум колесом, кнопка Сегодня). Отдельный top bar может быть избыточным.

4. **FAB позиционирование при открытом side panel:** `position: fixed` с `right: 376px` или переносить FAB в rail-header? Rail-header предпочтительнее для desktop.

5. **Accessibility Navigation Rail:** ARIA roles (`role="navigation"`, `aria-label`, `aria-current="page"`) нужно реализовать вручную — нет готового компонента.

6. **M3 Expressive update:** Стоит ли ориентироваться на M3 Expressive (новые анимации, expanded rail) или держаться классического M3?
