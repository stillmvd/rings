# @material/web v2.4.1 — Справочник компонентов и интеграция с Next.js 15 + React 19

> Источники: реальный код `node_modules/@material/web/` (all.js, *.d.ts), context7 docs, github.com/material-components/material-web, frontendmasters.com, css-tricks.com

---

## Статус библиотеки

**Maintenance mode** — официально объявлено в [discussions/5642](https://github.com/material-components/material-web/discussions/5642).

- Новые компоненты и features не планируются
- Bug fixes принимаются case-by-case
- Набор компонентов зафиксирован на версии v1.0 (Q3 2023) и v2.x
- **Не реализованы**: Autocomplete, Badge, Banner, Bottom App Bar, Data Table, Date Picker, Navigation Drawer, Snackbar, Time Picker, Top App Bar

Для production-проекта это означает: набор компонентов стабилен, API не меняется, но критические баги могут не фикситься.

---

## Полный каталог компонентов (проверено по all.js)

Пакет экспортирует **38 файлов** (27 публичных компонентов + утилиты).

### Кнопки

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-elevated-button` | `@material/web/button/elevated-button.js` | Низкий акцент, тень | `disabled`, `softDisabled`, `href`, `target`, `trailingIcon`, `hasIcon`, `type`, `value`, `name` |
| `md-filled-button` | `@material/web/button/filled-button.js` | Высокий акцент, основное действие | то же |
| `md-filled-tonal-button` | `@material/web/button/filled-tonal-button.js` | Средний акцент | то же |
| `md-outlined-button` | `@material/web/button/outlined-button.js` | Средний акцент, граница | то же |
| `md-text-button` | `@material/web/button/text-button.js` | Низкий акцент | то же |

Все кнопки: form-associated (`type=submit/reset/button`), поддерживают `href` для link-режима.
Слоты: default (label text), `icon` (leading icon).

### Icon Button

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-icon-button` | `@material/web/iconbutton/icon-button.js` | Иконка-кнопка | `disabled`, `softDisabled`, `toggle`, `selected`, `href`, `target`, `flipIconInRtl`, `ariaLabelSelected`, `type`, `value` |
| `md-filled-icon-button` | `@material/web/iconbutton/filled-icon-button.js` | Filled вариант | то же |
| `md-filled-tonal-icon-button` | `@material/web/iconbutton/filled-tonal-icon-button.js` | Tonal вариант | то же |
| `md-outlined-icon-button` | `@material/web/iconbutton/outlined-icon-button.js` | Outlined вариант | то же |

События: `input` (composed), `change` — при toggle.
Слоты: default (иконка), `selected` (иконка в selected-состоянии).

### FAB (Floating Action Button)

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-fab` | `@material/web/fab/fab.js` | Стандартный FAB | `variant` (`surface`/`primary`/`secondary`/`tertiary`), `size` (`medium`/`small`/`large`), `label`, `lowered` |
| `md-branded-fab` | `@material/web/fab/branded-fab.js` | Брендированный FAB (кастомная иконка) | `size` (`medium`/`large`), `label`, `lowered` — без `variant` |

Слоты: `icon` (иконка).

### Ввод данных

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-filled-text-field` | `@material/web/textfield/filled-text-field.js` | Текстовое поле (filled) | `label`, `value`, `type`, `placeholder`, `disabled`, `required`, `error`, `errorText`, `supportingText`, `maxLength`, `minLength`, `pattern`, `readOnly`, `prefixText`, `suffixText`, `rows`, `cols`, `noSpinner`, `step`, `min`, `max`, `autocomplete` |
| `md-outlined-text-field` | `@material/web/textfield/outlined-text-field.js` | Текстовое поле (outlined) | то же |
| `md-checkbox` | `@material/web/checkbox/checkbox.js` | Чекбокс | `checked`, `indeterminate`, `disabled`, `required`, `value`, `name` |
| `md-radio` | `@material/web/radio/radio.js` | Radio button | `checked`, `disabled`, `required`, `value`, `name` |
| `md-switch` | `@material/web/switch/switch.js` | Toggle switch | `selected`, `disabled`, `required`, `value`, `name`, `icons`, `showOnlySelectedIcon` |
| `md-slider` | `@material/web/slider/slider.js` | Слайдер | `min`, `max`, `value`, `step`, `disabled`, `range`, `valueStart`, `valueEnd`, `labeled`, `ticks`, `valueLabel`, `valueLabelStart`, `valueLabelEnd`, `name`, `nameStart`, `nameEnd` |

Типы для `md-filled-text-field`: `text`, `textarea`, `email`, `number`, `password`, `search`, `tel`, `url`.
Слоты text-field: `leading-icon`, `trailing-icon`.

### Select

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-filled-select` | `@material/web/select/filled-select.js` | Select (filled) | `label`, `value`, `disabled`, `required`, `error`, `errorText`, `supportingText`, `quick`, `menuPositioning`, `clampMenuWidth`, `menuAlign`, `hasLeadingIcon`, `displayText` |
| `md-outlined-select` | `@material/web/select/outlined-select.js` | Select (outlined) | то же |
| `md-select-option` | `@material/web/select/select-option.js` | Опция для select | `value`, `selected`, `disabled` |

События: `change`, `input`, `opening`, `opened`, `closing`, `closed`.
Методы: `select(value)`, `selectIndex(index)`, `reset()`, `showPicker()`.

### Chips

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-chip-set` | `@material/web/chips/chip-set.js` | Контейнер для чипов | — |
| `md-assist-chip` | `@material/web/chips/assist-chip.js` | Вспомогательный чип | `disabled`, `softDisabled`, `elevated`, `href`, `target`, `download`, `hasIcon` |
| `md-filter-chip` | `@material/web/chips/filter-chip.js` | Фильтр-чип | `disabled`, `softDisabled`, `elevated`, `selected`, `removable`, `hasSelectedIcon`, `hasIcon` |
| `md-input-chip` | `@material/web/chips/input-chip.js` | Input-чип (тег) | `disabled`, `softDisabled`, `avatar`, `href`, `target`, `selected`, `removeOnly`, `hasIcon` |
| `md-suggestion-chip` | `@material/web/chips/suggestion-chip.js` | Чип-подсказка | `disabled`, `softDisabled`, `elevated`, `href`, `target`, `hasIcon` |

События: `remove` (filter-chip, input-chip при нажатии кнопки удаления).
Слоты: `icon` (leading), `selected-icon` (filter-chip).

### Navigation: Tabs

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-tabs` | `@material/web/tabs/tabs.js` | Контейнер вкладок | `activeTabIndex`, `autoActivate` |
| `md-primary-tab` | `@material/web/tabs/primary-tab.js` | Основная вкладка | `active`, `hasIcon`, `iconOnly` |
| `md-secondary-tab` | `@material/web/tabs/secondary-tab.js` | Вторичная вкладка | `active`, `hasIcon`, `iconOnly` |

События tabs: `change` (при смене активной вкладки).
Методы tabs: `scrollToTab(tab?)`.
Слоты tab: default (label), `icon`.

### Диалог и меню

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-dialog` | `@material/web/dialog/dialog.js` | Диалог | `open`, `quick`, `returnValue`, `type` (`alert`), `noFocusTrap` |
| `md-menu` | `@material/web/menu/menu.js` | Контекстное меню | `anchor`, `open`, `quick`, `positioning` (`absolute`/`fixed`/`document`/`popover`), `anchorCorner`, `menuCorner`, `xOffset`, `yOffset`, `hasOverflow`, `stayOpenOnOutsideClick`, `stayOpenOnFocusout` |
| `md-menu-item` | `@material/web/menu/menu-item.js` | Пункт меню | `disabled`, `type`, `href`, `target`, `keepOpen` |
| `md-sub-menu` | `@material/web/menu/sub-menu.js` | Подменю | — |

События dialog: `open`, `opened`, `close`, `closed`, `cancel`.
События menu: `opening`, `opened`, `closing`, `closed`.
Методы dialog: `show()`, `close(returnValue?)`.
Методы menu: `show()`, `close()`, `activateNextItem()`, `activatePreviousItem()`.
Слоты dialog: default (content), `headline`, `actions`, `icon`.

### List

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-list` | `@material/web/list/list.js` | Список | — |
| `md-list-item` | `@material/web/list/list-item.js` | Элемент списка | `disabled`, `type` (`text`/`button`/`link`), `href`, `target` |

Слоты list-item: default (headline), `supporting-text`, `start`, `end`.

### Progress

| Тег | Import | Назначение | Ключевые атрибуты |
|-----|--------|------------|-------------------|
| `md-circular-progress` | `@material/web/progress/circular-progress.js` | Круговой прогресс | `value` (0..max), `max` (default 1), `indeterminate`, `fourColor` |
| `md-linear-progress` | `@material/web/progress/linear-progress.js` | Линейный прогресс | то же |

### Утилиты

| Тег | Import | Назначение |
|-----|--------|------------|
| `md-icon` | `@material/web/icon/icon.js` | Material Symbols/Icons иконка |
| `md-divider` | `@material/web/divider/divider.js` | Разделитель |
| `md-elevation` | `@material/web/elevation/elevation.js` | Тень (используется внутри компонентов) |
| `md-ripple` | `@material/web/ripple/ripple.js` | Ripple-эффект |
| `md-focus-ring` | `@material/web/focus/md-focus-ring.js` | Кольцо фокуса |

> `md-field` (`filled-field`, `outlined-field`) — внутренние компоненты для text-field. Публично не документированы.

---

## Импорт и регистрация

Custom elements регистрируются через side-effect импорт. Элемент доступен как только выполнился его модуль.

```ts
// Отдельные компоненты (рекомендуется для production)
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/textfield/outlined-text-field.js';

// Все компоненты (только для разработки/прототипирования)
import '@material/web/all.js';
```

### Typography

Типографика — отдельный JS-модуль, добавляет CSS-классы `md-typescale-*`:

```ts
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
// для Lit/browser:
document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
```

Классы: `md-typescale-display-{small,medium,large}`, `md-typescale-headline-{small,medium,large}`, `md-typescale-title-{small,medium,large}`, `md-typescale-body-{small,medium,large}`, `md-typescale-label-{small,medium,large}` (+ `-prominent` варианты).

В Next.js типографику удобнее подключить через CSS-файл или глобальные стили, а не через `adoptedStyleSheets`.

---

## Theming: CSS Custom Properties

### Архитектура токенов (3 уровня)

```
Reference tokens (--md-ref-*)      ← конкретные значения
        ↓
System tokens (--md-sys-*)         ← семантические роли
        ↓
Component tokens (--md-<comp>-*)   ← компонентные свойства
```

### System Color Tokens (основные)

```css
:root {
  /* Primary */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;

  /* Secondary */
  --md-sys-color-secondary: #625B71;
  --md-sys-color-secondary-container: #E8DEF8;

  /* Tertiary */
  --md-sys-color-tertiary: #7D5260;
  --md-sys-color-tertiary-container: #FFD8E4;

  /* Error */
  --md-sys-color-error: #B3261E;
  --md-sys-color-error-container: #F9DEDC;

  /* Surface */
  --md-sys-color-surface: #FEF7FF;
  --md-sys-color-on-surface: #1C1B1F;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-outline: #79747E;
  --md-sys-color-outline-variant: #CAC4D0;
}
```

### Typography Reference Tokens

```css
:root {
  --md-ref-typeface-brand: 'Roboto';       /* для Display, Headline, Title */
  --md-ref-typeface-plain: 'Roboto';       /* для Body, Label */
  --md-ref-typeface-weight-regular: 400;
  --md-ref-typeface-weight-medium: 500;
  --md-ref-typeface-weight-bold: 700;
}
```

### Per-Component Customization

Компонентные токены позволяют точечную кастомизацию без изменения глобальной темы:

```css
/* Скруглить все filled-button */
.square-buttons {
  --md-filled-button-container-shape: 0px;
}

/* Кнопка ошибки */
md-filled-button.error {
  --md-filled-button-container-color: var(--md-sys-color-error);
  --md-filled-button-label-text-color: var(--md-sys-color-on-error);
}

/* Кастомный text-field */
md-outlined-text-field.custom {
  --md-outlined-text-field-container-shape: 8px;
  --md-outlined-text-field-label-text-color: var(--md-sys-color-secondary);
}

/* CSS ::part() для вложенных элементов */
md-checkbox::part(focus-ring) {
  --md-focus-ring-color: hotpink;
}
```

---

## Интеграция с React 19 + Next.js 15 App Router

### React 19 и Custom Elements — как работает

React 19 добавил нативную поддержку custom elements (web components).

**Правила передачи props/атрибутов:**

| Контекст | Поведение |
|----------|-----------|
| Client-side render | Если свойство существует в DOM-инстанции custom element — передаётся как **property**; иначе — как **attribute** |
| Server-side render (SSR) | Примитивы (`string`, `number`, `true`) → **attribute**; объекты/функции → игнорируются |

```tsx
// React 19 — всё работает нативно
<md-filled-button disabled={isLoading}>
  Сохранить
</md-filled-button>

// Пример с value (property, не attribute)
<md-filled-text-field
  label="Название"
  value={title}  // React 19 установит .value на DOM-элемент
  onInput={(e) => setTitle((e.target as any).value)}
/>
```

### События

**Стандартные события** (`change`, `input`, `click`) работают через обычные React-хендлеры:

```tsx
<md-checkbox
  checked={isChecked}
  onChange={(e) => setIsChecked((e.target as any).checked)}
/>

<md-slider
  min={0}
  max={100}
  value={sliderValue}
  onInput={(e) => setSliderValue(Number((e.target as any).value))}
/>
```

**Кастомные события** (например, `opening`, `opened`, `change` у `md-tabs`) — React 19 поддерживает через `on + EventName`:

```tsx
<md-tabs
  activeTabIndex={activeTab}
  onChange={(e) => setActiveTab((e.target as any).activeTabIndex)}
>
  <md-primary-tab>Таймлайн</md-primary-tab>
  <md-primary-tab>Галерея</md-primary-tab>
</md-tabs>
```

Если автоматическое связывание не работает — используй `useRef` + `addEventListener`:

```tsx
const dialogRef = useRef<HTMLElement>(null);

useEffect(() => {
  const el = dialogRef.current;
  if (!el) return;
  const onClosed = () => setOpen(false);
  el.addEventListener('closed', onClosed);
  return () => el.removeEventListener('closed', onClosed);
}, []);

<md-dialog ref={dialogRef} open={open}>
  ...
</md-dialog>
```

### SSR-проблема и решения

Web components работают только в браузере (`customElements.define` требует `window`). Next.js рендерит на сервере — это вызывает ошибки.

#### Решение 1: `'use client'` + side-effect import (рекомендуется)

```tsx
// components/MdComponents.tsx
'use client';

import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/checkbox/checkbox.js';
// ... остальные компоненты

// Ре-экспортируй пустой компонент или просто импортируй в корне client-компонента
export function MaterialWebProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

```tsx
// app/layout.tsx (server component)
import { MaterialWebProvider } from '@/components/MdComponents';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MaterialWebProvider>
          {children}
        </MaterialWebProvider>
      </body>
    </html>
  );
}
```

#### Решение 2: useEffect в корневом client-компоненте

```tsx
'use client';
import { useEffect } from 'react';

export function MdLoader() {
  useEffect(() => {
    import('@material/web/all.js');
  }, []);
  return null;
}
```

#### Решение 3: dynamic import с ssr:false

```tsx
import dynamic from 'next/dynamic';

const MdLoader = dynamic(() => import('./MdLoader'), { ssr: false });
```

### FOUC (Flash of Unstyled Content)

**Проблема**: до загрузки JS компоненты рендерятся как неизвестные HTML-элементы без стилей.

**Решения:**

1. **CSS для pending-состояния** (Lit DSD pattern):
```css
/* globals.css */
body[dsd-pending] {
  display: none;
}
```

2. **Скрывать контент до hydration**:
```css
md-filled-button:not(:defined),
md-outlined-text-field:not(:defined) {
  opacity: 0;
}
```

3. **Blocking script в `<head>`** — загрузить registration bundle синхронно (ухудшает TTI).

4. **SSR-атрибуты** — некоторые компоненты имеют специальные SSR-атрибуты для избежания FOUC:
   - `md-text-field`: `hasLeadingIcon`, `hasTrailingIcon`
   - `md-select`: `hasLeadingIcon`, `displayText`
   - `md-chip`: `hasIcon`, `hasSelectedIcon`
   - `md-tab`: `hasIcon`, `iconOnly`

### TypeScript: типизация md-* в JSX

Библиотека регистрирует элементы в `HTMLElementTagNameMap` через файлы `*.d.ts`, но React JSX их не видит автоматически.

**Вариант 1: глобальная декларация**

```ts
// src/types/material-web.d.ts
import type { MdFilledButton } from '@material/web/button/filled-button.js';
import type { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import type { MdCheckbox } from '@material/web/checkbox/checkbox.js';
// ... и т.д.

type MdProps<T extends HTMLElement> = Partial<{
  [K in keyof T]: T[K];
}> & React.HTMLAttributes<T> & { ref?: React.Ref<T> };

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'md-filled-button': MdProps<MdFilledButton>;
        'md-outlined-button': MdProps<MdFilledButton>; // упрощённо
        'md-outlined-text-field': MdProps<MdOutlinedTextField>;
        'md-checkbox': MdProps<MdCheckbox>;
        // ... остальные
      }
    }
  }
}
```

**Вариант 2: простой без строгих типов** (быстрее, достаточно для большинства случаев)

```ts
// src/types/material-web.d.ts
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      [key: `md-${string}`]: React.HTMLAttributes<HTMLElement> & {
        [attr: string]: unknown;
      };
    }
  }
}
```

### Controlled Inputs с md-text-field

`md-text-field` — не обычный React controlled input. Значение нужно устанавливать через DOM-свойство:

```tsx
'use client';
import { useRef, useEffect } from 'react';

function ControlledTextField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLElement & { value: string }>(null);

  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  return (
    <md-outlined-text-field
      ref={ref}
      label="Название"
      onInput={(e) => onChange((e.target as any).value)}
    />
  );
}
```

В React 19 передача `value` как prop должна работать напрямую (React установит `.value` как DOM-свойство на client), но при hydration могут быть несоответствия — лучше использовать `ref`.

### Формы

`md-*` компоненты form-associated — они участвуют в нативных HTML-формах:

```tsx
<form onSubmit={handleSubmit}>
  <md-outlined-text-field name="title" label="Заголовок" required />
  <md-checkbox name="public" value="true" />
  <md-filled-button type="submit">Сохранить</md-filled-button>
</form>
```

Данные доступны через `FormData(formElement)`. При использовании с Server Actions в Next.js это работает корректно.

### Label Association

`md-checkbox`, `md-radio`, `md-switch` — **нельзя** обернуть в `<label>` для автоматической связи. Вместо этого:

```tsx
// Неработает:
<label>
  <md-checkbox /> Принять
</label>

// Работает (нативный label + id):
<>
  <label htmlFor="accept-cb">Принять условия</label>
  <md-checkbox id="accept-cb" />
</>

// Или текст рядом с компонентом (без label):
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <md-checkbox id="cb" />
  <span>Принять условия</span>
</div>
```

---

## Практический пример для Next.js 15

### Структура файлов

```
src/
  components/
    md/
      register.ts          // side-effect imports всех используемых md-*
      MdButton.tsx         // обёртки (опционально)
      types.d.ts           // JSX типы
  app/
    layout.tsx             // server component
    providers.tsx          // 'use client' — регистрирует md-*
```

### register.ts

```ts
// src/components/md/register.ts
// 'use client' не нужен — этот файл импортируется из client-компонента

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/switch/switch.js';
import '@material/web/icon/icon.js';
import '@material/web/dialog/dialog.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
```

### providers.tsx (client)

```tsx
'use client';
import '@/components/md/register';

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### layout.tsx (server)

```tsx
import { Providers } from '@/components/providers';
import '@/styles/md-theme.css'; // CSS с --md-sys-color-* переменными

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### md-theme.css

```css
/* src/styles/md-theme.css */
:root {
  --md-ref-typeface-brand: 'Inter', sans-serif;
  --md-ref-typeface-plain: 'Inter', sans-serif;

  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;

  --md-sys-color-secondary: #625B71;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #E8DEF8;

  --md-sys-color-surface: #FEF7FF;
  --md-sys-color-on-surface: #1C1B1F;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-outline: #79747E;
}
```

---

## Известные подводные камни

### 1. TypeScript и `ts2882` (side-effect imports)

Импорты без использования экспортов могут давать предупреждения. Решение — декларация типов:

```ts
// src/types/side-effects.d.ts
declare module '@material/web/button/filled-button.js';
declare module '@material/web/all.js';
// ... или через tsconfig paths
```

### 2. Hydration Mismatch

На сервере md-* элементы рендерятся как неизвестные HTML-теги (нет Shadow DOM). После hydration Lit инициализирует Shadow DOM. Это ожидаемое поведение, но может вызывать React hydration warnings.

**Решение**: добавить `suppressHydrationWarning` к контейнеру или использовать `ssr:false`.

### 3. Event Re-dispatch через Shadow DOM

Некоторые события `--composed` (проходят через Shadow DOM boundary), другие нет. `change` у `md-checkbox` — bubbles, но **не** composed. При использовании React event delegation (события через корневой element) это может не работать.

**Решение**: слушать события непосредственно на элементе через `ref`.

### 4. md-menu + positioning

`md-menu` требует настройки `anchor` (id элемента) или `anchorElement` (ref). При использовании `positioning="popover"` нужен браузер с поддержкой Popover API (все современные — OK).

### 5. Зависимость от Lit

Пакет тянет `lit` (^2.8.0 || ^3.0.0) как peer/direct dependency. Вес `lit` ~40KB минифицированного.

### 6. Нет SSR-рендеринга компонентов

Не существует официальной поддержки Declarative Shadow DOM (DSD) для @material/web. Компоненты при SSR отдаются как пустые custom elements. На клиенте Lit инициализирует их. FOUC неизбежен без дополнительных мер.

### 7. Tailwind CSS 4 конфликты

md-* используют Shadow DOM — Tailwind-классы на host-элементе не проникают внутрь. CSS custom properties (переменные) работают корректно, так как они наследуются через Shadow DOM.

---

## Открытые вопросы / Риски

1. **Maintenance mode** — если найдут критический баг совместимости с React 19 / Next.js 15, фикс может не выйти. Форк или обёртка?

2. **FOUC при first paint** — без blocking script или Declarative Shadow DOM первый рендер будет с unstyled компонентами. Насколько это критично для проекта?

3. **Bundle size** — `lit` + компоненты. При импорте только нужных компонентов: ~5-15KB на компонент gzip. При `all.js` — ~150KB+. Нужен анализ.

4. **Недостающие компоненты** — нет Date Picker, Snackbar, Navigation Drawer, Data Table. Придётся реализовать самостоятельно или взять из другого источника (совместимость тем?).

5. **TypeScript strict mode** — типизация `md-*` в JSX требует либо ручной декларации, либо компромисса с `[key: string]: unknown`. WC Toolkit (wc-toolkit.com) может генерировать типы автоматически из Custom Elements Manifest.

6. **React 19 `onXxx` для custom events** — синтаксис `onChange` / `onInput` работает, но для кастомных событий типа `opening`, `opened`, `cancel` нужна проверка React 19 dispatcher. В крайнем случае — `useRef` + `addEventListener`.

7. **Form Server Actions** — при использовании Next.js Server Actions с `md-*` form-associated элементами нужно убедиться, что `FormData` корректно читает значения. Протестировано ли это?

8. **Цветовая тема (dark mode)** — переключение темы через CSS `[data-theme=dark]` или `prefers-color-scheme` требует задать оба набора `--md-sys-color-*`. Интеграция с `next-themes` (используется в проекте) — нужна проверка.
