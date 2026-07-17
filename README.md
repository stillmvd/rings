# Rings

Личный таймлайн жизни — десктопное приложение для Windows. Визуализация событий в пяти режимах: Canvas-ось времени с зумом и панорамой, галерея карточек, календарь, «Отслеживание» и «Дни рождения». Живёт в трее, шлёт нативные уведомления о днях рождения, умеет резервное копирование.

## Возможности

- **Таймлайн** — Canvas-сетка времени с зумом колесом и панорамой перетаскиванием; уровни детализации (LOD) скрывают незначимые события при отдалении; кластеризация близких точек со счётчиком и tooltip
- **Галерея** — карточки событий с медиа и скраббером по датам
- **Календарь** — месячная сетка с событиями и быстрыми отметками дня
- **Отслеживание** — отсчёты до будущих событий и годовщины прошедших с живым обратным отсчётом
- **Дни рождения** — люди с датами рождения: текущий возраст, отсчёт до ближайшего ДР, аватар; нативные Windows-уведомления
- События: точечные и периоды (`end_date`), значимость 1–3, иерархические категории с иконкой и цветом
- Быстрые отметки дня без названия по справочнику типов (трекеров)
- Медиа (фото) у событий, поиск и фильтрация (по `/` или Ctrl/Cmd+F)
- Трей с монохромной иконкой, автостарт в трей, single instance
- Резервное копирование в ZIP (ручное и авто, с ротацией), восстановление
- Optimistic UI + toast-уведомления, темы light/dark/system

## Стек

Tauri 2 (Rust) · React 19 · Vite · Tailwind CSS 4 · tauri-plugin-sql (SQLite) · TypeScript · pnpm

Бренд — **Rings** (`brand/brandbook.html`). Данные (SQLite + медиа) — в `%APPDATA%\com.stillmvd.rings`.

## Разработка

```bash
cd desktop
pnpm install
pnpm tauri dev     # окно приложения (dev)
npx tsc --noEmit   # проверка типов фронта
cargo check        # из desktop/src-tauri — проверка Rust
```

## Сборка релиза

```bash
cd desktop
pnpm tauri build   # NSIS-инсталлятор → src-tauri/target/release/bundle/nsis/
bash cleanup.sh    # очистка тяжёлых артефактов target/ после сборки
```

Установщик `Rings_<version>_x64-setup.exe` ставит приложение в `Program Files\Rings` (perMachine, ярлык в Пуске, деинсталлятор).

## Обновление версии

Перед релизом поднять `version` в `desktop/src-tauri/tauri.conf.json` и `desktop/src-tauri/Cargo.toml`. **Не менять** `productName` (`Rings`) и `identifier` (`com.stillmvd.rings`) — от них зависят обнаружение прошлой установки и путь к данным. Подробнее — в [CLAUDE.md](./CLAUDE.md).

## Структура

```
desktop/
  src/          React-фронт: pages/ · components/ (timeline, gallery, calendar,
                tracking, birthdays, search, settings, ui) · db/ · lib/
  src-tauri/    Rust: команды (медиа, бэкап, трей), плагины, tauri.conf.json
  cleanup.sh    очистка артефактов сборки
brand/          брендбук и логотипы Rings
```

Подробности архитектуры и конвенций — в [CLAUDE.md](./CLAUDE.md).
