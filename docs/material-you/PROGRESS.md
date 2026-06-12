# Material You редизайн — прогресс

Ветка: `material-you` (worktree). База: `aa5f287` (master, v3.0).

## Статус фаз

| Фаза | Название | Статус |
|------|----------|--------|
| Ф0 | Фундамент M3 (токены, dynamic color, регистрация) | ✅ ГОТОВО |
| Ф1 | UI-примитивы → md-* | ✅ ГОТОВО |
| Ф2 | Навигационная оболочка (Rail + TopBar + FAB) | ✅ ГОТОВО |
| Ф3 | Формы и диалоги (Side Sheet, dialogs) | ⏳ (следующая) |
| Ф4 | Canvas под M3 | ⏳ |
| Ф5 | Галерея под M3 | ⏳ |
| Ф6 | Календарь под M3 | ⏳ |
| Ф7 | Motion, polish, seed-пикер | ⏳ |

## Готово (инфраструктура)

- ✅ Форк-worktree `material-you` от HEAD (не пушим). `.claude/` исключён в master через `.git/info/exclude`.
- ✅ Установлены `@material/web@2.4.1`, `@material/material-color-utilities@0.4.0`; `better-sqlite3` собран.
- ✅ Research (5 направлений) → [RESEARCH-SUMMARY.md](RESEARCH-SUMMARY.md) + `research/01..05`.
- ✅ Инвентарь текущего UI (34 компонента) → [CURRENT-UI-INVENTORY.md](CURRENT-UI-INVENTORY.md).
- ✅ ROADMAP + дизайн-решения → [ROADMAP.md](ROADMAP.md).
- ✅ API `material-color-utilities` сверен по .d.ts и исходникам (см. ниже).

---

## ▶ HANDOFF ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ (после /clear)

### Как вернуться в форк
Новая сессия стартует в master (`c:\Projects\Windows Apps\Timeline`). Форк — это **worktree**:
`C:/Projects/Windows Apps/Timeline/.claude/worktrees/material-you` (ветка `material-you`).
→ Вернуться: инструмент **EnterWorktree** с `path: C:/Projects/Windows Apps/Timeline/.claude/worktrees/material-you`.
Проверка: `git worktree list`. Вся работа и коммиты — только в этой ветке.

### Прочитать для контекста
`docs/material-you/ROADMAP.md` (план+решения), `RESEARCH-SUMMARY.md`, `CURRENT-UI-INVENTORY.md`. Детали — в `research/01..05`.

### ✅ Ф0 закрыта. Что сделано:
1. **`src/lib/m3/dynamic-color.ts`** — `themeStyleSheet(seed)` / `buildThemeVars(seed, isDark)`: ~49 sys-ролей (`allColors`, фильтр `*_palette_key_color`) + 3 sig customColors (`--md-sig-N{,-on,-container,-on-container}`). `DEFAULT_SEED = #6750A4`.
2. **`layout.tsx`** — инжект `<style id="md-theme">` с light(`:root`,`[data-theme=light]`)/dark наборами; seed из `getSetting("theme.seed")` ?? дефолт.
3. **`globals.css`** — M3-слой: `color-scheme`, `--md-sys-shape-corner-*`, `--md-sys-state-*`, `--md-sys-motion-*`, `--md-ref-typeface-*`; FOUC `:not(:defined){visibility:hidden}`; **мост** `--tl-*` → `--md-sys-*` (поверхности/текст/линия прямые; accent 50–900 через `color-mix(primary…)`; sig → `--md-sig-*`; danger → error). Tailwind utilities (`@theme inline`) подхватывают мост автоматически.
4. **`src/components/m3/MdRegistry.tsx`** (`'use client'`) — typescale CSS import; список md-* импортов пуст (наполняем в Ф1+); смонтирован в `layout`.
5. **`src/types/material-web.d.ts`** — JSX-типы md-* (широкий `MdElement`, augmentation `react`→`JSX.IntrinsicElements`).
6. **Roboto Flex** через `next/font` (`subsets: latin+cyrillic`, `--font-roboto-flex`) → `--md-ref-typeface-*` и `body font-family` (Inter убран).
7. **next-themes** → `attribute="data-theme"` в `providers.tsx`.
8. ✅ `tsc --noEmit`, `pnpm lint`, `pnpm build` — зелёные. material-color-utilities собирается через Next/Turbopack без проблем.

### ✅ Ф1 закрыта. Что сделано:
- **MdRegistry** переведён на SSR-safe регистрацию: `useEffect` + покомпонентный `import()` (статический side-effect import компонентов падает на сервере — `customElements` нет). typescale CSS остаётся статическим import.
- **ui/Button** → `md-filled-button`/`md-filled-tonal-button`/`md-text-button` (primary/secondary/ghost); danger — `md-filled-button` + error-токены; размеры sm/md/lg через `--md-*-button-container-height`. API (variant/size/type/onClick/disabled/children) сохранён.
- **ui/Input + ui/Textarea** → `md-outlined-text-field` (textarea — `type="textarea"`). Controlled через ref-sync `el.value` (research-паттерн, без hydration-проблем), `onInput`→`onChange(value)`. **API изменён**: `onChange` теперь `(value: string)=>void` (было событие) — обновлены вызовы.
- **ui/Select** → `md-outlined-select` + `md-select-option` (иконки категорий в `slot="start"`, цвета inline). API (options/value/onChange) сохранён.
- **ui/SegmentedControl** → `md-chip-set` + `md-filter-chip` (single-select; в @material/web нет segmented buttons). API сохранён; цвет значимости — точкой в `slot="icon"`.
- **ui/Toast** → перекрашен под M3 Snackbar (inverse-surface/inverse-on-surface), API `useToast`/`ToastProvider` без изменений.
- Обновлены вызовы: EventForm (Input/Textarea), CategoryForm (Input). Исправлены state-opacity Ф0 → 0.12 (focus/pressed, по M3-спеке).
- ✅ tsc/lint/build зелёные. md-* грузятся отдельными чанками после гидрации (First Load JS не вырос).

**✅ Проверено в браузере (desktop 1920×1080)**, консоль чистая (только Lit dev-mode). Подтверждено: M3-палитра/seed, кнопки (filled/tonal/text), controlled md-text-field (value подгружается), md-select с иконками/цветами категорий + дропдаун, filter-chips как single-select (галочки + цветные точки значимости), логика «Период» (поле «Конец»), **сабмит формы** (md-button type=submit создаёт событие), поиск. Тестовое событие создано и удалено (БД чистая).

**🐞 Найден и исправлен баг (Tailwind × Material Web):** Tailwind Preflight (`*{padding:0;margin:0}`) перебивает `:host`-стили web components — для **normal**-правил внешнее дерево побеждает `:host`, поэтому у md-кнопок обнулялся host-padding и лейбл обрезался («Создать»→«Создат»). Фикс в `ui/Button.tsx`: возвращаем M3-модель отступов inline-стилем (inline побеждает Tailwind как outer-author с высшим приоритетом) — `padding-block: (высота−20px)/2`, `padding-inline` 24px (filled/tonal) / 12px (text). **Важно для Ф2:** новые md-* (md-fab, md-icon-button, NavigationRail) столкнутся с тем же конфликтом — закладывать восстановление host-модели сразу.

### ✅ Ф2 закрыта (desktop). Что сделано:
- **`m3/NavigationRail.tsx`** — кастомный rail 80px слева (surface): md-fab «Создать событие» в шапке, destinations Таймлайн/Галерея/Календарь (active indicator = secondary-container pill + on-secondary-container, hover state-layer 8%, ARIA `aria-current="page"`, `nav[aria-label]`), Настройки (link) внизу. lucide-иконки (не md-icon), без md-ripple (CSS state-layer — надёжнее, M3-вид сохранён).
- **Верхняя панель** — по решению пользователя **плавающий ряд** (поиск + ThemeToggle) поверх контента справа-сверху, canvas остаётся полноэкранным (не сплошной TopAppBar).
- **md-fab** (primary/medium, `<Plus slot="icon">`) — создаёт событие в любом режиме через общий create-поповер (`createPopover`, дата = `todayISO()`). Раньше calCreate был только для календаря — обобщён.
- **AppShell перестроен**: `flex` (rail + `<main relative flex-1>` с контентом). Режимы переключаются через rail (localStorage/useViewMode без изменений). md-fab НЕ сломан Tailwind-ом (проверено).
- **Решения пользователя:** desktop-only (адаптив отложен), плавающий top-row, FAB в шапке rail.

**✅ Проверено в браузере (1920×1080), консоль чистая:** rail + active indicator, переключение всех 3 режимов, FAB→форма с датой «сегодня», коллизий нет.

**🐞 Найден и исправлен:** `TimelineControls` использовал `fixed bottom-4 left-4` (к вьюпорту) → «Месяцы»-индикатор налезал на rail (0–80px). Фикс: `fixed` → `absolute` (контролы внутри `relative`-контейнера stage, позиционируются относительно области контента, правее rail). EventDetails/SearchPanel `fixed inset-0` — намеренные модалки-оверлеи, не трогал.

### Следующий шаг — Ф3 (Формы и диалоги)
Кастомный SideSheet (360dp) для EventForm (замена EventPopover), EventDetails → md-dialog/sheet, категории/настройки → md-dialog, DatePicker под M3-токены. Подробности — ROADMAP Ф3 / research/04 §8 (Side Sheet). **Примечание:** create-поповер FAB сейчас якорится к FAB слева — на Ф3 заменить на правый SideSheet.

**Заметки для Ф1+:**
- `/` собирается как **static** (layout читает seed на build-time). При вводе seed-пикера (Ф7) нужен `revalidatePath('/')`/динамика, иначе смена seed не применится в prod.
- Build warning: несколько lockfile (worktree + корень) → Next выбрал корневой как workspace root. Безвредно; при желании задать `outputFileTracingRoot` в `next.config.ts`.
- Мост `--tl-*` использует равную специфичность + порядок (мост-блок идёт ПОСЛЕ легаси-палитры). При добавлении правил палитры не нарушать порядок.

### ✅ Сверенный API `@material/material-color-utilities@0.4.0` (для dynamic-color.ts)
```ts
import {
  Hct, SchemeTonalSpot, MaterialDynamicColors,
  hexFromArgb, argbFromHex, customColor,
} from "@material/material-color-utilities";

const mdc = new MaterialDynamicColors();           // ИНСТАНС (статика @deprecated)
const scheme = new SchemeTonalSpot(
  Hct.fromInt(argbFromHex(seedHex)), isDark, 0,    // contrastLevel=0
);
for (const dc of mdc.allColors) {                  // allColors — инстансное свойство
  const cssVar = "--md-sys-color-" + dc.name.replace(/_/g, "-");
  const hex = hexFromArgb(dc.getArgb(scheme));
  // ПРОПУСКАТЬ имена, оканчивающиеся на "_palette_key_color" (это не sys-color роли)
}
```
- `dc.name` — snake_case. Реальные имена: background, on_background, surface, surface_dim, surface_bright, surface_container(_lowest/_low/_high/_highest), on_surface, surface_variant, on_surface_variant, outline, outline_variant, inverse_surface, inverse_on_surface, inverse_primary, shadow, scrim, surface_tint, primary, on_primary, primary_container, on_primary_container, primary_fixed(_dim), on_primary_fixed(_variant), secondary*, tertiary*, error*, и `*_palette_key_color` (ФИЛЬТРОВАТЬ).
- **Значимость (customColors, blend к seed):**
```ts
const SIG = [
  { name: "sig-1", base: "#64748b" }, // обычное
  { name: "sig-2", base: "#c4f94a" }, // важное
  { name: "sig-3", base: "#f59e0b" }, // самое важное
];
const g = customColor(argbFromHex(seedHex), { value: argbFromHex(base), name, blend: true });
// g.light / g.dark : { color, onColor, colorContainer, onColorContainer } (числа argb)
// → --md-sig-N, --md-sig-N-on, --md-sig-N-container, --md-sig-N-on-container
```
- **ВАЖНО:** API нельзя проверить сырым `node` (ESM extensionless-импорты внутри пакета падают). Turbopack/TS в Next собирают нормально — проверять только сборкой/`tsc`.
- `@material/web` 2.4.1: 27 компонентов; НЕТ Rail/TopBar/SideSheet/Drawer/Snackbar/DatePicker/Card (кастом). Регистрация только в `'use client'`, импорт покомпонентно (не `all.js`).

---

## Журнал
- Сессия 1: создан форк, поставлены deps, проведён research (5 агентов) + инвентарь (1 агент), зафиксированы ROADMAP/решения, сверен API material-color-utilities. Начат Ф0. Пауза по контексту перед написанием `dynamic-color.ts`.
- Сессия 2: создан корневой `CLAUDE.md` (на него ссылался README). Закрыта **Ф0** целиком (dynamic-color, инжект токенов, M3-слой + мост в globals, MdRegistry, JSX-типы md-*, Roboto Flex, next-themes data-theme). tsc/lint/build зелёные. Коммит Ф0. Затем закрыта **Ф1** (примитивы ui/* → md-*: Button, Input/Textarea, Select, SegmentedControl→chips, Toast→Snackbar). tsc/lint/build зелёные. Коммит Ф1. Визуально проверена в браузере, найден+пофикшен баг padding кнопок (Tailwind Preflight). Затем закрыта **Ф2** (NavigationRail + плавающий top-row + md-fab, перестройка AppShell). Проверено в браузере, пофикшена коллизия TimelineControls с rail. Все коммиты пофазно.
