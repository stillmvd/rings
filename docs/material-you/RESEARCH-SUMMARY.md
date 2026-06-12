# Material You редизайн — сводка research

Форк: ветка `material-you` (worktree). Логика приложения не меняется — переписывается только UI-слой на Material 3 (Material You).

Стек редизайна: `@material/web@2.4.1` (официальные M3 Web Components) + `@material/material-color-utilities@0.4.0` (dynamic color), поверх Next.js 15.5 / React 19.2 / Tailwind v4 / next-themes.

## Детальные документы

- [research/01-color-dynamic.md](research/01-color-dynamic.md) — система цвета M3, dynamic color, API material-color-utilities
- [research/02-material-web-components.md](research/02-material-web-components.md) — каталог 27 компонентов @material/web, интеграция React 19 / Next 15
- [research/03-typography-shape-elevation-motion.md](research/03-typography-shape-elevation-motion.md) — type scale, shape, elevation, motion, state layers
- [research/04-layout-navigation.md](research/04-layout-navigation.md) — window size classes, navigation rail/drawer, app bar, FAB, side sheet
- [research/05-android-source-and-integration.md](research/05-android-source-and-integration.md) — source.android.com (вывод: к вебу неприменима), паттерн интеграции web components в Next15/React19
- [CURRENT-UI-INVENTORY.md](CURRENT-UI-INVENTORY.md) — инвентарь 34 текущих UI-компонентов + карта цветов

## Ключевые выводы (зафиксированы)

### Цвет / Dynamic Color
- Полная M3-схема — ~49 color roles. Генерировать из одного **seed-цвета** через `MaterialDynamicColors` + `DynamicScheme` (`SchemeTonalSpot`), обходя `mdc.allColors` и записывая каждый в `--md-sys-color-*`.
- **НЕ использовать** legacy `themeFromSourceColor`/`applyTheme` — он ставит только ~20 токенов, без `surface-container-*`, `surface-dim/bright`, `outline-variant`, `scrim`, `surface-tint`, которые требует @material/web 2.4.1.
- Light и dark — две отдельные схемы (`isDark` флаг). Связываются с next-themes через `data-theme`.
- `material-color-utilities` SpecVersion по умолчанию SPEC_2021.

### Компоненты @material/web (27 готовых)
- Есть: кнопки (5), icon-button (4), **md-fab / md-branded-fab**, text-field (2), select (2)+option, checkbox/radio/switch/slider, chips (4)+chip-set, tabs, **md-dialog**, menu(+item), list(+item), progress (linear/circular), icon, divider, ripple, focus-ring, elevation.
- **Нет (строить вручную):** Navigation Rail, Navigation Bar, Navigation Drawer, Top App Bar, Side Sheet, Bottom Sheet, Search Bar, **Snackbar/Toast**, **Date Picker**, Card.
- Библиотека в maintenance mode — новых компонентов не будет.

### Интеграция (Next 15 / React 19)
- Web components требуют браузер → регистрация только в `'use client'` (компонент-регистратор `MdRegistry`, импорты покомпонентно для tree-shaking, никогда `all.js`).
- FOUC: `md-*:not(:defined){ visibility:hidden }` в globals.css.
- React 19 нативно поддерживает custom elements (object props как properties, CustomEvent). Для надёжности controlled-инпутов и событий диалогов/меню — `ref` + `addEventListener`.
- TypeScript: ручная декларация `JSX.IntrinsicElements` для `md-*` в `src/types/material-web.d.ts`.
- next-themes `attribute="data-theme"` → CSS-каскад переключает `--md-sys-color-*` без JS.
- Шрифты — через `next/font`, связка с `--md-ref-typeface-brand/plain`.

### Foundations
- Type scale: 15 ролей (display/headline/title/body/label × L/M/S), токены `--md-sys-typescale-*`.
- Shape: none/xs/s/m/l/xl/full = 0/4/8/12/16/28/9999px, токены `--md-sys-shape-corner-*`.
- Elevation: 6 уровней (0/1/3/6/8/12 dp) — тень + surface tint; компонент `md-elevation`.
- Motion: easing `emphasized` `cubic-bezier(0.2,0,0,1)` и др.; duration short1..extra-long4 (50..1000ms). Компоненты @material/web моушн-токены НЕ читают (hardcoded) — для собственных анимаций используем `motion`.
- State layers: hover 8% / focus 12% / pressed 12% / dragged 16%.

### Навигационная оболочка (рекомендация research)
Desktop-first: **Navigation Rail** (~80dp слева, режимы Таймлайн/Галерея/Календарь + Настройки) + основной контент (Canvas/Gallery/Calendar) + **Side Sheet** (~360dp справа) для формы события. FAB (`md-fab`) для создания. Адаптив по window size classes.

### source.android.com
Запрошенная страница описывает реализацию Material на уровне платформы Android (Monet, RRO/overlay, HAL) — к вебу напрямую неприменима. Полезна только концептуально (seed → tonal palettes). Практический источник — m3.material.io + @material/web.
