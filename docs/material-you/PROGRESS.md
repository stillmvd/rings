# Material You редизайн — прогресс

Ветка: `material-you` (worktree). База: `aa5f287` (master, v3.0).

## Статус фаз

| Фаза | Название | Статус |
|------|----------|--------|
| Ф0 | Фундамент M3 (токены, dynamic color, регистрация) | 🔄 В РАБОТЕ (начат) |
| Ф1 | UI-примитивы → md-* | ⏳ |
| Ф2 | Навигационная оболочка (Rail + TopBar + FAB) | ⏳ |
| Ф3 | Формы и диалоги (Side Sheet, dialogs) | ⏳ |
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

### Следующий шаг — закончить Ф0. Осталось:
1. **`src/lib/m3/dynamic-color.ts`** — генератор токенов (API ниже, всё сверено).
2. **Применение токенов** в layout: инжект `<style>` с light/dark наборами `--md-sys-color-*` под `[data-theme]`. Дефолт seed `#6750A4`. Чтение сохранённого seed (пока можно хардкод-дефолт, пикер — Ф7).
3. **`src/app/globals.css`** — добавить слой M3: import `@material/web/typography/md-typescale-styles.css` (или через JS в registry), базовые `--md-sys-shape-corner-*`, `--md-sys-state-*`, `color-scheme`. Мост `--tl-*` → `--md-sys-*` (старый UI должен продолжать работать!).
4. **`src/components/m3/MdRegistry.tsx`** (`'use client'`) — пока пустой список импортов (наполняем в Ф1+) + FOUC CSS `md-*:not(:defined){visibility:hidden}`. Смонтировать в `layout.tsx`.
5. **`src/types/material-web.d.ts`** — JSX-типы для `md-*` (augmentation `JSX.IntrinsicElements`).
6. **Roboto Flex** через `next/font` → связать с `--md-ref-typeface-brand/plain` (заменить Inter в globals.css `font-family`).
7. **next-themes** → `attribute="data-theme"` (проверить `providers.tsx`), связать dark-набор токенов.
8. Прогон `npx tsc --noEmit`, `pnpm lint`, `pnpm build`. Коммит Ф0.

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
