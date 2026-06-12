# Material You редизайн — прогресс

Ветка: `material-you` (worktree). База: `aa5f287` (master, v3.0).

## Статус фаз

| Фаза | Название | Статус |
|------|----------|--------|
| Ф0 | Фундамент M3 (токены, dynamic color, регистрация) | ✅ ГОТОВО |
| Ф1 | UI-примитивы → md-* | ✅ ГОТОВО |
| Ф2 | Навигационная оболочка (Rail + TopBar + FAB) | ✅ ГОТОВО |
| Ф3 | Формы и диалоги (Side Sheet, dialogs) | ✅ ГОТОВО |
| Ф4 | Canvas под M3 | ✅ ГОТОВО |
| Ф5 | Галерея под M3 | ⏳ (следующая) |
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

### ✅ Ф3 закрыта. Что сделано:
- **`m3/SideSheet.tsx`** — кастомный modal side sheet справа (380px): scrim (`scrim` 32%), slide-in (motion x 100%→0, emphasized easing), `surface-container-high`, левые углы `rounded-l-2xl`, header (title + close на lucide-X со state-layer), скроллируемый body. createPortal + `useMounted` (SSR-safe), Esc/scrim-клик закрывают. z-[80/81] (ниже Lightbox z-90).
- **`m3/Dialog.tsx`** — центральный M3-диалог: scrim + `surface-container-high`, corner `rounded-[28px]`, spring-анимация, опц. title/close, проп `z` для вложенности (база 80, вложенные 88).
- **`timeline/EventSheet.tsx`** — **единый** компонент формы/просмотра события на базе SideSheet, заменил EventPopover + EventDetails. 3 режима: `create` (EventForm), `view` (фото edge-to-edge `-mx-6`, заголовок/дата/категория-chip/значимость, кнопки Удалить/Редактировать → `view→edit`), `edit` (EventForm). Lightbox для фото. `splitCategory` перенесён сюда.
- **AppShell**: вместо `createPopover`+`detail` — единый стейт `sheet: EventSheetState | null`. Колбэки `openCreate(dateISO)` / `openView(event)` / `openEdit(event)` (грузят media через `listMediaAction`) / `startEdit`. FAB → create (todayISO), календарь create → create, gallery/calendar клик → view, таймлайн клик по точке → edit. + `settingsOpen` → `SettingsDialog`.
- **TimelineStage**: убраны EventPopover, media-загрузка, popover-стейт, `popoverOpenAtDown`. Новые пропсы `onCreateAt(dateISO)` / `onEventEdit(event)`. Клик по оси → create, по точке → edit (форма в правом sheet AppShell). Modal-scrim sheet перехватывает фон, поэтому «клик-закрывает-поповер» больше не нужен.
- **NavigationRail**: `onCreate()` без anchor; «Настройки» — `<button onClick={onSettings}>` вместо `<Link href="/settings">`.
- **SettingsDialog**: настройки в большом центральном M3-диалоге (maxWidth 640) — Оформление (ThemeToggle) + CategoryManager + BackupPanel. Открывается из rail поверх AppShell (categories из серверного page → revalidate `/` обновляет).
- **CategoryManager/BackupPanel**: вложенные Overlay-диалоги перекрашены под M3 (scrim 32%, `surface-container-high`, `rounded-[28px]`) и подняты на **z-[88]** (чтобы быть поверх settings-диалога z-81, но под Lightbox z-90).
- **DatePicker + `.tl-calendar`**: триггер как M3-outlined (h-14, `rounded-[4px]`, border `outline`→focus `primary`, `surface-container-low`); дропдаун `surface-container-high` `rounded-2xl`; `.tl-calendar` `--rdp-*` привязаны к прямым `--md-sys-color-*`, день круглый (`corner-full`), selected = `primary`/`on-primary`.
- **`/settings` страница оставлена** как fallback по прямому URL (rail теперь открывает диалог).
- ✅ tsc/lint/build зелёные. **Проверено в браузере (prod `next start`, тёмная тема), консоль чистая:** FAB→SideSheet, DatePicker (M3 круглые дни, primary-selected, месяц/год), «Период»→2-й DatePicker, Настройки→большой диалог, вложенный диалог категории поверх (z-index ок), создание события, view (календарь→sheet), view→edit, удаление. Тестовое событие создано и удалено (БД чистая).

**🐞 Dev-сервер (`next dev --turbopack`) падает на резолве Google-шрифта** (`@vercel/turbopack-next/internal/font/google/font` для Roboto Flex) — внутренняя проблема turbopack dev (вероятно нет сети для подгрузки). **Prod `build`+`start` работают штатно.** Также: смешивание dev (turbopack) и build артефактов в одном `.next` ломает `next start` (`routesManifest.dataRoutes is not iterable`) — лечится `rm -rf .next && pnpm build`. Для визуальной проверки использовать prod `pnpm start`.

### ✅ Ф4 закрыта. Что сделано:
- **`GridCanvas.readColors`** — прямое чтение M3 sys-ролей (без моста `--tl-*`): `line`→`outline-variant`, `lineStrong`→`outline` (сильные деления + пунктир ДР), `text`→`on-surface`, `muted`→`on-surface-variant`, `grayZone` (вуаль «вне жизни»)→`surface-variant`. Поле `accent`→`today`=`tertiary` (маркер «сегодня» отличается от primary-UI: FAB/rail). Canvas теперь реагирует на seed/тему напрямую.
- **`lib/significance.ts`** — единый источник переведён на M3-токены: `color`→`var(--md-sig-N)` (гармонизированы к seed), новое поле `onColor`→`var(--md-sig-N-on)`, `ringColor` sig-3 → `var(--md-sig-3-on-container)`. Затронуло ВСЕ режимы сразу (таймлайн/галерея/календарь/поиск) — только цвет, layout не тронут.
- **`lib/colors.ts`** — `onColorFor(hex)`: авто-контраст контента по YIQ-яркости (порог 140) для произвольного `category_color`.
- **`EventDot`** — контент (иконка) контрастен фактическому фону: `onColorFor(category_color)` если задан, иначе `sig.onColor`. boxShadow-обводка → `var(--md-sys-color-surface)`.
- **`EventLayer`** — boxShadow полос/точек → `surface`; счётчик кластера `color`→`meta.onColor` (фон=значимость), ring sig-3 через M3-токен.
- **Решения пользователя (AskUserQuestion):** «сегодня»→tertiary (ДР-пунктир→outline); контент точек→авто-контраст по яркости; sig-3→кольцо M3-токеном; значимость→единый источник (все режимы сразу).

**✅ Проверено в браузере (prod, 1920×1080, тёмная + светлая темы), консоль чистая.** Подтверждено на тестовых событиях: точки sig-1/2/3 (гармонизированные к seed цвета), кластер со счётчиком (тёмный onColor на amber-фоне), крупные sig-3 с кольцами и иконками (жёлтая категория→тёмная звезда, синяя→белое сердце — авто-контраст), период-полоса, маркер «сегодня» = розовый tertiary (отличается от фиолетового primary), вуаль «вне жизни», StickyContext-плашка. StickyContext/TimelineControls оставлены на Tailwind-мост-утилитах (уже M3, консистентно с остальным DOM). Тестовые события/категории и временный скрипт удалены (БД чистая).

### Следующий шаг — Ф5 (Галерея под M3)
Карточки (кастомный M3 card: surface-container + elevation + shape), лента, date-scrubber, state layers. Цвет значимости в галерее уже M3 (единый `significance.ts` из Ф4) — остаётся layout/карточки. Подробности — ROADMAP Ф5.

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
- Сессия 4: закрыта **Ф4** (Canvas под M3). `GridCanvas.readColors` → прямые M3 sys-роли (outline/on-surface/...), маркер «сегодня» = tertiary, ДР-пунктир = outline, вуаль «вне жизни» = surface-variant. Единый `significance.ts` → `var(--md-sig-N)` + поле `onColor` + ring sig-3 на `--md-sig-3-on-container` (затронуло все режимы). Добавлен `onColorFor` (авто-контраст по YIQ) для контента точек с произвольным category_color; EventDot/EventLayer boxShadow → surface, счётчик кластера → meta.onColor. Решения через AskUserQuestion. tsc/lint/build зелёные, проверено в браузере (prod, dark+light), консоль чистая. Коммит Ф4.
- Сессия 1: создан форк, поставлены deps, проведён research (5 агентов) + инвентарь (1 агент), зафиксированы ROADMAP/решения, сверен API material-color-utilities. Начат Ф0. Пауза по контексту перед написанием `dynamic-color.ts`.
- Сессия 3: закрыта **Ф3** (Формы и диалоги). По решениям пользователя: все формы/просмотр события → единый правый **modal SideSheet** (380px), настройки → **большой центральный md-dialog**. Создан `m3/SideSheet` + `m3/Dialog` + `timeline/EventSheet` (объединил EventPopover+EventDetails, удалены оба). AppShell поднял единый sheet-стейт, TimelineStage очищен (форма ушла наверх), NavigationRail.Настройки → onSettings-диалог, вложенные диалоги категорий/импорта перекрашены под M3 + z-[88]. DatePicker/`.tl-calendar` под прямые M3-токены. tsc/lint/build зелёные, проверено в браузере (prod). Коммит Ф3.
- Сессия 2: создан корневой `CLAUDE.md` (на него ссылался README). Закрыта **Ф0** целиком (dynamic-color, инжект токенов, M3-слой + мост в globals, MdRegistry, JSX-типы md-*, Roboto Flex, next-themes data-theme). tsc/lint/build зелёные. Коммит Ф0. Затем закрыта **Ф1** (примитивы ui/* → md-*: Button, Input/Textarea, Select, SegmentedControl→chips, Toast→Snackbar). tsc/lint/build зелёные. Коммит Ф1. Визуально проверена в браузере, найден+пофикшен баг padding кнопок (Tailwind Preflight). Затем закрыта **Ф2** (NavigationRail + плавающий top-row + md-fab, перестройка AppShell). Проверено в браузере, пофикшена коллизия TimelineControls с rail. Все коммиты пофазно.
