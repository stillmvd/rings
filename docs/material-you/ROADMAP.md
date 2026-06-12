# Material You редизайн — ROADMAP

Форк `material-you` (worktree, не пушится). Переписываем **только UI** на Material 3 / Material You. Логика (БД, Server Actions, проекция, LOD, CRUD, расчёты) — без изменений.

## Зафиксированные решения

- **Технологии:** `@material/web@2.4.1` + `@material/material-color-utilities@0.4.0` поверх Next 15.5 / React 19.2 / Tailwind v4 / next-themes.
- **Dynamic color:** полная M3-схема (~49 ролей) генерируется из одного **seed** через `DynamicScheme`/`SchemeTonalSpot` + `MaterialDynamicColors.allColors`; записывается в `--md-sys-color-*`. Legacy `applyTheme` не используем.
- **Seed по умолчанию:** `#6750A4` (M3 baseline фиолетовый). **UI-пикер** смены seed — в настройках (Ф7). Выбор хранится (settings/localStorage).
- **Значимость (sig 1/2/3):** 3 **customColors**, гармонизированные к seed (получают on-color и container). Заменяют серо-синий/лайм/золото, сохраняя «приглушённый → яркий → акцент».
- **Шрифт:** Roboto Flex через `next/font`, связан с `--md-ref-typeface-brand/plain`.
- **Оболочка:** Navigation Rail (~80dp слева, режимы + Настройки) + контент + Side Sheet (~360dp справа) для формы события + `md-fab`.
- **Тема:** next-themes `attribute="data-theme"`, отдельные light/dark наборы `--md-sys-color-*`.
- **Кастомные (нет в @material/web):** Snackbar/Toast, Date Picker (перекрас react-day-picker), Card, Navigation Rail, Top App Bar, Side Sheet.

## Фазы

Каждая фаза — рабочее приложение и отдельный коммит (conventional, без упоминаний AI).

### Ф0 — Фундамент M3 (токены + dynamic color + регистрация)
- [ ] `src/lib/m3/dynamic-color.ts` — из seed hex → объект `--md-sys-color-*` для light и dark (allColors + 3 customColors значимости)
- [ ] Применение токенов: инжект CSS-переменных (SSR-safe), дефолт seed `#6750A4`, чтение сохранённого seed
- [ ] `globals.css` — слой M3 (typescale import, `--md-sys-shape/state/motion`, `color-scheme`), мост `--tl-*` → `--md-sys-*` на переходный период
- [ ] `src/components/m3/MdRegistry.tsx` (`'use client'`) — покомпонентная регистрация (растёт по фазам) + FOUC `:not(:defined)`
- [ ] `src/types/material-web.d.ts` — JSX-типы для `md-*`
- [ ] Roboto Flex через next/font → `--md-ref-typeface-*`
- [ ] next-themes `attribute="data-theme"`, связать dark-схему
- [ ] tsc + lint + build зелёные
- **Готово когда:** старый UI работает поверх M3-токенов; light/dark на M3-палитре.

### Ф1 — UI-примитивы → md-*
- [ ] React-обёртки `md-*` (button-варианты, text-field, select, switch, checkbox/radio, slider, chips, icon-button) с типами/событиями/refs
- [ ] Миграция: ui/Button, Input, Textarea, Select, SegmentedControl, Toast(→M3 Snackbar)
- [ ] Прогон по местам использования, API/логика сохранены
- **Готово когда:** контролы и формы на md-*.

### Ф2 — Навигационная оболочка
- [ ] Кастомный `NavigationRail` (режимы Таймлайн/Галерея/Календарь + Настройки, active indicator, ripple, ARIA)
- [ ] Кастомный `TopAppBar` (поиск, контролы режима)
- [ ] `md-fab` — создание события
- [ ] Перестройка AppShell (rail + content + slot для sheet), адаптив по window size classes
- **Готово когда:** режимы переключаются через rail, FAB создаёт событие.

### Ф3 — Формы и диалоги
- [ ] Кастомный `SideSheet` (360dp) → EventForm
- [ ] EventPopover / EventDetails → md-dialog или sheet
- [ ] Категории, настройки → md-dialog
- [ ] DatePicker — react-day-picker под M3-токены
- **Готово когда:** CRUD события и настройки в M3.

### Ф4 — Canvas под M3
- [ ] `GridCanvas.readColors` → M3-токены (surface/outline/primary/on-surface)
- [ ] significance → 3 кастомные M3-роли; EventDot/EventLayer/кластеры — elevation/shape/state/on-colors
- [ ] StickyContext, метки, недоступные зоны под M3
- **Готово когда:** canvas в M3-палитре, реагирует на seed/тему.

### Ф5 — Галерея под M3 ✅
- [x] Карточки (M3 Elevated card: surface-container-low + elevation 1→2 + corner-medium), date-scrubber, CSS state layers; плейсхолдер = цвет категории/значимости + авто-контраст
- **Готово когда:** галерея в M3.

### Ф6 — Календарь под M3
- [ ] Переписать `.tl-cal-*` на M3-токены; DayCell, chips событий, today/выходные/праздники (error/tertiary)
- **Готово когда:** календарь в M3.

### Ф7 — Motion, polish, seed-пикер
- [ ] State layers/ripple везде; переходы режимов (motion: shared axis / fade through)
- [ ] UI-пикер seed-цвета в настройках (live-применение dynamic color)
- [ ] Контраст/доступность, адаптив, финальные tsc/lint/build, визуальная проверка
- **Готово когда:** целостный, кастомизируемый Material You.

## Рабочий цикл
Ф0 → … → Ф7 последовательно. Внутри фазы: реализовать задачи → tsc/lint → коммит. Текущее состояние — в [PROGRESS.md](PROGRESS.md).
