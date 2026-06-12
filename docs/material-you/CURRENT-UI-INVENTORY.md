# Current UI Inventory — Timeline (pre-M3 migration)

Снимок состояния UI перед миграцией на Material 3 / Material You.
Только инвентаризация — логика не меняется.

---

## 1. Таблица всех UI-компонентов

| Путь | Роль | Тип | Где задаётся стиль | M3-аналог |
|---|---|---|---|---|
| `src/components/ui/Button.tsx` | Кнопка: primary / secondary / ghost / danger; размеры sm/md/lg | примитив | Tailwind: `bg-accent-500`, `bg-surface-3`, `bg-tl-danger`, `rounded-pill`, `focus-visible:ring-2 ring-accent-400` | `md-filled-button`, `md-outlined-button`, `md-text-button`, `md-filled-tonal-button` |
| `src/components/ui/Input.tsx` | Текстовый ввод с label и ошибкой | примитив | Tailwind: `bg-surface-1`, `border-line`, `focus:border-accent-500`, `border-tl-danger`, `text-app-text`, `text-muted`, `rounded-xl` | `md-filled-text-field` / `md-outlined-text-field` |
| `src/components/ui/Textarea.tsx` | Многострочный ввод с label и ошибкой | примитив | Tailwind: те же токены что у Input + `resize-none` | `md-filled-text-field` multiline |
| `src/components/ui/Select.tsx` | Кастомный dropdown с поиском иконок/цветов; motion-анимация списка | составной | Tailwind: `bg-surface-1`, `bg-surface-2`, `bg-surface-3`, `border-line`, `rounded-xl`, `rounded-lg`; inline `style` для цвета иконки категории | `md-select` / `md-menu` |
| `src/components/ui/Popover.tsx` | Плавающий модальный контейнер (portal, spring-анимация), автопозиционирование | составной | Tailwind: `rounded-card`, `border-line`, `bg-surface-1`, `shadow-2xl`; motion spring | `md-dialog` (или кастом над `md-elevation`) |
| `src/components/ui/SegmentedControl.tsx` | Переключатель вариантов с motion-layoutId slide-анимацией | составной | Tailwind: `bg-surface-2`, `rounded-pill`, `bg-surface-0 shadow`; inline `style` для цветной точки значимости | `md-segmented-button-set` |
| `src/components/ui/Toast.tsx` | Стек уведомлений (portal, motion) с иконками success/error/info | составной | Tailwind: `rounded-2xl`, `bg-surface-2`, `border-line`, `text-app-text`; inline `style={{ color: "var(--tl-success/danger/accent-500)" }}` | `md-snackbar` |
| `src/components/ui/DatePicker.tsx` | Поле даты + dropdown DayPicker (react-day-picker) | составной | Tailwind: `bg-surface-1`, `border-line`, `rounded-xl`, `rounded-card`; `.tl-calendar` CSS в globals.css переопределяет rdp-переменные через `--tl-*` | кастом поверх `md-outlined-text-field` + `md-dialog` |
| `src/components/ui/ColorPicker.tsx` | Сетка 8×2 цветных кругов-кнопок | составной | inline `style={{ background: color, boxShadow: "0 0 0 2px var(--tl-surface-1), 0 0 0 4px color" }}`; `CATEGORY_COLORS` — 16 фиксированных hex | кастом (цвет-свотчи) |
| `src/components/ui/IconPicker.tsx` | Dropdown-сетка lucide-иконок с поиском; motion-анимация | составной | Tailwind: `bg-surface-1`, `bg-surface-2`, `border-line`, `rounded-xl`, `rounded-lg`; active: `bg-accent-500 text-white` | кастом поверх `md-menu` |
| `src/components/ui/Lightbox.tsx` | Полноэкранный просмотрщик фото (portal, motion) | составной | Tailwind: `bg-black/80`, `bg-white/10`, `text-white`, `rounded-full`, `rounded-lg`; нет --tl-* токенов — хардкод тёмного оверлея | кастом (нет M3-аналога) |
| `src/components/ui/ModeToggle.tsx` | Переключатель режимов timeline/gallery/calendar (3 иконки) | примитив | Tailwind: `rounded-xl`, `border-line`, `bg-surface-1/80`, `bg-surface-3`; backdrop-blur | `md-navigation-bar` / `md-icon-button` |
| `src/components/ui/ThemeToggle.tsx` | Переключатель темы light/dark/system (3 иконки) | примитив | Tailwind: те же классы что ModeToggle | `md-icon-button` группа |
| `src/components/timeline/GridCanvas.tsx` | Canvas-сетка таймлайна: ось, тики, подписи, маркер «сегодня», вуаль «не жизнь» | canvas | `readColors()` — читает `getComputedStyle(document.documentElement)` → `--tl-line`, `--tl-surface-4`, `--tl-text`, `--tl-text-muted`, `--tl-accent-500`, `--tl-surface-2`; canvas рисует напрямую этими значениями | кастом (canvas остаётся) |
| `src/components/timeline/EventLayer.tsx` | SVG-like div-слой точек/баров/кластеров событий, tooltip при hover | составной/canvas | inline `style={{ background: color, boxShadow: "... var(--tl-surface-0) ..." }}`; color = `category_color ?? sig.color`; highlight: Tailwind `border-accent-500`; tooltip: Tailwind `bg-surface-1`, `border-line` | кастом (div-позиционирование) |
| `src/components/timeline/EventDot.tsx` | Точка события: размер от значимости, цвет от категории/значимости, иконка | составной | inline `style={{ background: color, boxShadow: "... var(--tl-surface-0) ..." }}`; иконка хардкод `color: "#0a0a0b"` | кастом |
| `src/components/timeline/EventForm.tsx` | Форма создания/редактирования события | составной | через дочерние примитивы (Input, Textarea, Select, DatePicker, SegmentedControl, Button, MediaUploader) | — (составной из M3-примитивов) |
| `src/components/timeline/EventPopover.tsx` | Обёртка Popover + EventForm | составной | Tailwind: `text-app-text` для h3 | — |
| `src/components/timeline/TimelineStage.tsx` | Оркестратор canvas-области: drag-pan, zoom, клик-открытие попапа | layout/оркестратор | Tailwind: `bg-surface-0` косвенно (через AppShell), `cursor: grab` inline | — |
| `src/components/timeline/StickyContext.tsx` | Метка «год/месяц» по центру над осью | составной | Tailwind: `bg-surface-1/70`, `rounded-xl`, `text-app-text`, `text-muted`, backdrop-blur | кастом chip |
| `src/components/timeline/TimelineControls.tsx` | Кнопки +/−/сегодня + индикатор LOD и даты курсора | составной | Tailwind: `border-line`, `bg-surface-1/80`, `text-muted`, `rounded-xl`; backdrop-blur | `md-fab` / `md-icon-button` + chip |
| `src/components/timeline/MediaUploader.tsx` | Дропзона + grid превью фото (Reorder.Group) | составной | Tailwind: `border-dashed`, `border-line`, `bg-surface-0`, `rounded-lg`; drag-over: `border-accent bg-accent/10`; удаление: `bg-black/55 text-white` (хардкод) | кастом |
| `src/components/gallery/GalleryView.tsx` | Масонри-сетка карточек с sticky-заголовками месяцев | layout | Tailwind: `bg-surface-0/80`, `text-app-text` | кастом (нет M3-аналога grid-layout) |
| `src/components/gallery/EventCard.tsx` | Карточка события: обложка/иконка + заголовок + дата | составной | Tailwind: `rounded-2xl`, `border-line`, `bg-surface-1`; inline `style={{ background: accent }}` для placeholder | `md-card` (elevated) |
| `src/components/gallery/EventDetails.tsx` | Модальный просмотр события: фото, мета, кнопки редактирования | составной | Tailwind: `rounded-card`, `border-line`, `bg-surface-1`, `bg-black/60`; inline `style={{ background: accent }}` для заглушки без фото; `bg-black/40` для кнопки закрытия (хардкод) | `md-dialog` |
| `src/components/gallery/DateScrubber.tsx` | Скраббер-полоска прокрутки галереи справа | составной | Tailwind: `bg-line`, `bg-app-text`, `bg-muted/60`, `bg-surface-3`, `border-line` | кастом |
| `src/components/calendar/CalendarView.tsx` | Крупная сетка месяца (react-day-picker + кастомные DayCell) | составной | CSS-классы `.tl-cal-*` из globals.css через `--tl-*` токены; inline `style={{ borderLeftColor: color }}` для чипов событий; `style={{ background: color }}` для маркеров | кастом поверх `md-*` |
| `src/components/search/SearchPanel.tsx` | Поиск + фильтры категорий и значимости (portal, motion) | составной | Tailwind: `bg-surface-1`, `bg-surface-0`, `border-line`, `rounded-2xl`, `rounded-xl`, `rounded-pill`; inline `style={{ borderColor: cat.color, color: cat.color }}` для активных фильтров | кастом поверх `md-dialog` + `md-chip` |
| `src/components/categories/CategoryManager.tsx` | CRUD-список категорий с вложенным Overlay | составной | Tailwind: `divide-line`, `border-line`, `bg-surface-1`, `bg-surface-2`, `bg-surface-3`, `rounded-card`; inline `style={{ background: color+"22" }}` для иконки-бейджа | кастом список + `md-list` |
| `src/components/categories/CategoryForm.tsx` | Форма категории: Input + IconPicker + ColorPicker + Select | составной | через дочерние примитивы | — |
| `src/components/settings/BackupPanel.tsx` | Панель импорт/экспорт JSON с confirm-overlay | составной | Tailwind: `bg-surface-1`, `border-line`, `bg-line` (divider), `rounded-card`; `text-tl-danger` для предупреждения | кастом |
| `src/components/AppShell.tsx` | Оркестратор режимов + шапка (fixed top-right) | layout | Tailwind: `bg-surface-0`, `text-app-text`; шапка: `border-line`, `bg-surface-1/80`, backdrop-blur | `md-navigation-bar` / `md-top-app-bar` |
| `src/app/settings/page.tsx` | Страница настроек: заголовок + CategoryManager + BackupPanel | layout | Tailwind: `bg-surface-0`, `border-line`, `bg-surface-1` | `md-scaffold` |

---

## 2. Карта цветов

### 2.1 CSS-переменные --tl-* (src/app/globals.css)

**Поверхности (light / dark):**
```
--tl-surface-0: #f5f5f7 / #0a0a0b   (фон страницы)
--tl-surface-1: #ffffff / #131315   (карточки, поля ввода)
--tl-surface-2: #f1f1f3 / #1c1c20   (hover-фон, dropdown фон)
--tl-surface-3: #e6e6ea / #26262b   (активные элементы)
--tl-surface-4: #d9d9de / #34343b   (разделители, сильные тики canvas)
--tl-text:      #0f0f12 / #f5f5f7   (основной текст)
--tl-text-muted:#6b6b75 / #8a8a93   (вторичный текст)
--tl-line:      #e0e0e6 / #2a2a30   (границы, разделители)
```

**Акцент (единый во всех темах — индиго):**
```
--tl-accent-500: #6366f1  (основной акцент)
--tl-accent-400: #818cf8  (сегодня в календаре, ring)
--tl-accent-600: #4f46e5  (hover кнопки primary)
--tl-accent-700: #4338ca  (active)
```

**Статус:**
```
--tl-danger:  #ef4444
--tl-warning: #f59e0b
--tl-success: #22c55e
```

**Значимость событий (enum 1–3):**
```
--tl-sig-1: #64748b  (обычное — серо-синий)
--tl-sig-2: #c4f94a  (важное — лайм)
--tl-sig-3: #f59e0b  (самое важное — золото)
```
Хранятся в `src/lib/significance.ts` как хардкод-hex (дублируют токены), используются в Canvas, EventDot, EventLayer, SegmentedControl, SearchPanel.

**Категории:**
16 фиксированных hex в `src/lib/colors.ts` (`CATEGORY_COLORS`). Привязываются к событию через `category_color` поле.

### 2.2 Tailwind-утилиты (через @theme inline в globals.css)

| Утилита | Привязана к |
|---|---|
| `bg-surface-0` … `bg-surface-4` | `--tl-surface-*` |
| `bg-accent-500` … `bg-accent-700` | `--tl-accent-*` |
| `text-app-text` | `--tl-text` |
| `text-muted` | `--tl-text-muted` |
| `border-line` | `--tl-line` |
| `bg-tl-danger`, `text-tl-danger` | `--tl-danger` |
| `bg-tl-warning`, `bg-tl-success` | `--tl-warning`, `--tl-success` |
| `rounded-pill` | `9999px` |
| `rounded-card` | `1.25rem` |
| `rounded-card-lg` | `1.75rem` |

### 2.3 Canvas-цвета (GridCanvas.tsx) — как попадают в ctx

`readColors()` вызывается **каждый кадр** через `getComputedStyle(document.documentElement)`:
```
line:       getPropertyValue("--tl-line")       → ctx.strokeStyle
lineStrong: getPropertyValue("--tl-surface-4")  → ctx.strokeStyle (strong ticks)
text:       getPropertyValue("--tl-text")        → ctx.fillStyle (подписи)
muted:      getPropertyValue("--tl-text-muted")  → ctx.fillStyle (слабые подписи)
accent:     getPropertyValue("--tl-accent-500")  → ctx.strokeStyle/fillStyle (маркер сегодня)
grayZone:   getPropertyValue("--tl-surface-2")   → ctx.fillStyle (вуаль вне жизни, alpha 0.14)
```
Смена темы триггерит перерисовку через `useTheme().resolvedTheme` как dep useEffect.

### 2.4 Хардкод цветов (требуют внимания при миграции)

| Файл | Хардкод | Контекст |
|---|---|---|
| `src/lib/significance.ts` | `#64748b`, `#c4f94a`, `#f59e0b`, `#fbbf24` | цвет точек sig-1/2/3 и ring sig-3 |
| `src/lib/colors.ts` | 16 hex в `CATEGORY_COLORS` | палитра категорий |
| `src/components/timeline/EventDot.tsx` | `color: "#0a0a0b"` | цвет иконки внутри точки |
| `src/components/timeline/EventLayer.tsx` | `color: "#0a0a0b"` | цвет цифры в кластере |
| `src/components/ui/Lightbox.tsx` | `bg-black/80`, `bg-white/10`, `bg-black/50`, `text-white` | оверлей lightbox |
| `src/components/gallery/EventDetails.tsx` | `bg-black/60`, `bg-black/40` | оверлей и кнопка закрытия |
| `src/components/calendar/CalendarView.tsx` | (нет hex-литералов; все через CSS-классы `.tl-cal-*`) | — |

### 2.5 CSS-классы для Календаря (globals.css, строки 92–430)

`.tl-calendar`, `.tl-calendar-lg`, `.tl-cal-cell`, `.tl-cal-chip`, `.tl-cal-wheel` и др. — все используют `var(--tl-*)` напрямую в CSS. При миграции нужно переписать под M3-токены.

---

## 3. Оболочка и навигация

### Текущая структура

```
AppShell (src/components/AppShell.tsx)
├── [mode === "timeline"]  → TimelineStage (полноэкранный canvas)
├── [mode === "gallery"]   → GalleryView  (скролл-сетка)
└── [mode === "calendar"]  → CalendarView (месячная сетка)

Шапка (fixed top-right, z-30):
  Search-кнопка → SearchPanel (portal)
  ModeToggle (timeline/gallery/calendar)
  ThemeToggle (light/dark/system)
  Link → /settings

Глобальные оверлеи (portal, z-[70–100]):
  SearchPanel      z-70
  EventDetails     z-80
  Popover          z-81 (EventPopover, CalendarView overflow-list)
  Lightbox         z-90
  Toast            z-100

Страница /settings (отдельная route):
  header (ArrowLeft + h1 + ThemeToggle)
  CategoryManager
  BackupPanel
```

### Переключение режима

`useViewMode()` в AppShell.tsx — `useSyncExternalStore` + `localStorage` ("timeline.viewMode"). Три значения: `"timeline"` | `"gallery"` | `"calendar"`. Стартовое значение при SSR — `"timeline"`.

---

## 4. Inline-стили и хардкод (сложности миграции)

| Место | Описание |
|---|---|
| `EventDot.tsx:27–28` | `boxShadow` с `var(--tl-surface-0)` + цвет категории — используется и на canvas, и на DOM |
| `EventLayer.tsx:129,195` | `boxShadow: "0 0 0 2px var(--tl-surface-0)"` — ring вокруг dot/cluster |
| `EventLayer.tsx:196` | `color: "#0a0a0b"` — цифра кластера жёсткая, не тематизирована |
| `EventCard.tsx:43`, `EventDetails.tsx:170` | `style={{ background: accent }}` — заглушка без фото берёт цвет категории как фон |
| `ColorPicker.tsx:30` | `boxShadow: "0 0 0 2px var(--tl-surface-1), 0 0 0 4px color"` — selection ring |
| `SearchPanel.tsx:183` | `style={{ borderColor, color }}` — активный фильтр-чип с цветом категории |
| `CalendarView.tsx:133,159` | `style={{ color }}` / `style={{ borderLeftColor: color }}` — маркер и чип с цветом события |
| `GridCanvas.tsx:readColors()` | getComputedStyle каждый кадр — нужно будет либо маппировать M3-токены на --tl-*, либо менять readColors() |
| Lightbox, EventDetails | `bg-black/80`, `bg-black/60`, `bg-black/40`, `text-white` — не тематизированы |

---

## 5. Использование `motion` (анимации)

| Файл | Что анимируется |
|---|---|
| `Select.tsx` | dropdown-список: opacity + y (AnimatePresence) |
| `Popover.tsx` | карточка: opacity + scale spring (AnimatePresence) |
| `SegmentedControl.tsx` | slide-индикатор: `motion.div` layoutId spring |
| `Toast.tsx` | тост: opacity + y + scale spring (AnimatePresence + layout) |
| `EventLayer.tsx` | точки/бары/кластеры: opacity + scale (AnimatePresence); tooltip: opacity+y; highlight пульс: animate массив |
| `EventDetails.tsx` | оверлей: opacity; карточка: opacity + scale + y spring |
| `SearchPanel.tsx` | оверлей: opacity; панель: opacity + y + scale spring |
| `CategoryManager.tsx` | confirm-overlay и edit-overlay: opacity + scale spring |
| `BackupPanel.tsx` | confirm-overlay: opacity + scale spring |
| `GridCanvas.tsx` | LOD-кроссфейд: `animate(0, 1)` из motion/react (не DOM, а значение) |
| `MediaUploader.tsx` | Reorder.Group (drag-to-reorder фото) |

---

## 6. Использование `lucide-react` (иконки)

Все иконки — lucide-react, разрешение через `src/lib/icons.ts` (`resolveIcon(name)`).

Ключевые точки:
- `Button.tsx` — children (слот)
- `Select.tsx` — ChevronDown, Check
- `Toast.tsx` — CheckCircle2, AlertCircle, Info, X
- `DatePicker.tsx` — CalendarDays
- `IconPicker.tsx` — ChevronDown, Search + динамический `resolveIcon`
- `Lightbox.tsx` — ChevronLeft, ChevronRight, X
- `ModeToggle.tsx` — Waypoints, LayoutGrid, CalendarDays
- `ThemeToggle.tsx` — Monitor, Moon, Sun
- `TimelineControls.tsx` — Plus, Minus, CalendarClock
- `AppShell.tsx` — Search, Settings
- `EventDetails.tsx` — Pencil, Trash2, X
- `SearchPanel.tsx` — Search, X
- `CategoryManager.tsx` — Plus, Pencil, Trash2, X
- `BackupPanel.tsx` — Download, Upload
- `CalendarView.tsx` — MoveHorizontal, ChevronUp, ChevronDown, CalendarDays
- `EventCard.tsx` / `EventDot.tsx` — `resolveIcon(category_icon)` (динамически)

---

## 7. Оценка объёма миграции

### Тривиальная замена (переопределить CSS-токены + поменять классы)

| Компонент | Основание |
|---|---|
| `Button.tsx` | чистые Tailwind-варианты, нет inline-стилей — маппируется на `md-filled-button` etc. |
| `Input.tsx` | только Tailwind-токены, нет спец-логики | 
| `Textarea.tsx` | аналогично Input |
| `ThemeToggle.tsx` | только иконки + Tailwind |
| `ModeToggle.tsx` | только иконки + Tailwind |
| `StickyContext.tsx` | простой div-тег, только Tailwind |
| `DateScrubber.tsx` | кастом полностью, Tailwind-токены |
| `BackupPanel.tsx` (структура) | Tailwind-токены, overlay через Popover-паттерн |

### Средняя сложность (переписать компонент, логику оставить)

| Компонент | Основание |
|---|---|
| `Select.tsx` | кастомный dropdown — заменить на `md-select` или кастом поверх `md-menu` |
| `SegmentedControl.tsx` | `md-segmented-button-set` другая разметка, нужно переписать |
| `Toast.tsx` | `md-snackbar` — другая структура и z-стек |
| `IconPicker.tsx` | кастомная сетка — нет M3-аналога, переписать структуру |
| `ColorPicker.tsx` | inline-стили boxShadow, нет M3-аналога |
| `SearchPanel.tsx` | фильтр-чипы с category.color — `md-chip` + inline-стили |
| `EventCard.tsx` | `md-card` but с кастомным placeholder-фоном (accent) |
| `GalleryView.tsx` | sticky-заголовки, grid — чисто CSS, нет M3-аналога |
| `TimelineControls.tsx` | mix FAB + info-chip — переписать структуру |
| `CategoryManager.tsx` | список + overlay: `md-list` + переписать CategoryRow |
| `AppShell.tsx` (шапка) | переосмыслить под `md-top-app-bar` или `md-navigation-bar` |

### Сложная замена

| Компонент | Основание |
|---|---|
| `Popover.tsx` | кастомное автопозиционирование, spring-анимация, portal — `md-dialog` не имеет такого поведения; нужна кастомная реализация |
| `DatePicker.tsx` | react-day-picker + большой блок CSS-overrides в globals.css под `--tl-*`; нужно переписать CSS под M3-токены |
| `CalendarView.tsx` | сложный DayCell с кастомными чипами событий, CSS-классы `.tl-cal-*` — полная перепись CSS + разметки |
| `EventDetails.tsx` | два режима (view + edit), inline accent-цвета, оверлей с `bg-black/*` |
| `EventLayer.tsx` | inline boxShadow с `var(--tl-surface-0)`, хардкод `#0a0a0b` для кластера |

### Canvas-перекраска (отдельная категория — высокая сложность)

`GridCanvas.tsx` и `EventDot.tsx` / часть `EventLayer.tsx`:
- `readColors()` читает `--tl-*` через getComputedStyle → нужно либо переименовать переменные, либо добавить алиасы `--tl-* → --md-sys-color-*`
- Цвета значимости (`#64748b`, `#c4f94a`, `#f59e0b`) захардкожены в `significance.ts` — нужно решить: взять из M3-палитры или оставить кастомными
- Хардкод `"#0a0a0b"` для иконки/цифры в точках — нужен контраст-токен
- Ring `var(--tl-surface-0)` в boxShadow — заменить на M3-surface-токен

---

## 8. Сводка токенов для маппинга M3

| Текущий токен | M3-кандидат |
|---|---|
| `--tl-surface-0` | `--md-sys-color-background` |
| `--tl-surface-1` | `--md-sys-color-surface` |
| `--tl-surface-2` | `--md-sys-color-surface-variant` |
| `--tl-surface-3` | `--md-sys-color-surface-container-high` |
| `--tl-surface-4` | `--md-sys-color-surface-container-highest` |
| `--tl-text` | `--md-sys-color-on-background` |
| `--tl-text-muted` | `--md-sys-color-on-surface-variant` |
| `--tl-line` | `--md-sys-color-outline-variant` |
| `--tl-accent-500` | `--md-sys-color-primary` |
| `--tl-accent-400` | `--md-sys-color-primary` (light variant) |
| `--tl-danger` | `--md-sys-color-error` |
| `--tl-success` | кастом (нет в M3 base) |
| `--tl-sig-1/2/3` | кастом (нет прямого аналога) |

---

_Файл сгенерирован для ветки `material-you`, только чтение кода — никакие файлы не менялись._
