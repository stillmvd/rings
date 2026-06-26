"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { DayPicker, type DayProps, type MonthCaptionProps } from "react-day-picker";
import { ru } from "date-fns/locale";
import { parseISO, format, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ChevronUp, ChevronDown, CalendarDays } from "lucide-react";
import "react-day-picker/style.css";
import { type PopoverAnchor } from "@/components/ui/Popover";
import { getSignificanceMeta } from "@/lib/significance";
import { onColorFor } from "@/lib/colors";
import { resolveIconOrNull } from "@/lib/icons";
import {
  EMPTY_FILTER,
  isFilterActive,
  matchesFilter,
  matchesMarkFilter,
  type EventFilter,
} from "@/lib/filter";
import { BIRTH_DATE } from "@/lib/constants";
import { holidayName } from "@/lib/holidays";
import { getNonWorkingDaysAction } from "@/actions/calendar";
import type { TimelineEvent } from "@/db/queries/events";
import type { Mark } from "@/db/queries/marks";

const START_MONTH = parseISO(BIRTH_DATE);
const MAX_CHIPS = 3;

// Горизонт будущего: «напоминания» можно листать и создавать на 15 лет вперёд от сегодня.
const FUTURE_HORIZON_YEARS = 15;

// M3 elevation level 1 — приподнятый контейнер месяца (как Elevated-карточки галереи, Ф5).
const ELEVATION_1 =
  "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent), 0 1px 3px 1px color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent)";

// Допустимый диапазон месяцев (0–11) для года в пределах [START_MONTH … limit]:
// в год рождения снизу режет месяц рождения, в год горизонта сверху — месяц limit.
function monthBounds(limit: Date, year: number): { lo: number; hi: number } {
  const lo = year === START_MONTH.getFullYear() ? START_MONTH.getMonth() : 0;
  const hi = year === limit.getFullYear() ? limit.getMonth() : 11;
  return { lo, hi };
}

// Линейный сдвиг месяца с переносом года (январь−1 → декабрь прошлого года); кламп [START_MONTH … limit].
function stepMonth(limit: Date, current: Date, delta: number): Date {
  const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
  const lo = new Date(START_MONTH.getFullYear(), START_MONTH.getMonth(), 1);
  const hi = new Date(limit.getFullYear(), limit.getMonth(), 1);
  return next < lo ? lo : next > hi ? hi : next;
}

// Сдвиг года с клампом по диапазону [START_MONTH … limit]; месяц подтягивается в границы нового года.
function shiftYear(limit: Date, current: Date, delta: number): Date {
  const minY = START_MONTH.getFullYear();
  const maxY = limit.getFullYear();
  const year = Math.min(Math.max(current.getFullYear() + delta, minY), maxY);
  const { lo, hi } = monthBounds(limit, year);
  const m = Math.min(Math.max(current.getMonth(), lo), hi);
  return new Date(year, m, 1);
}

type DayIndex = Map<string, TimelineEvent[]>;
type MarkIndex = Map<string, Mark[]>;

const isPeriod = (e: TimelineEvent) => !!e.end_date && e.end_date > e.date;

const anchorFrom = (e: { clientX: number; currentTarget: HTMLElement }): PopoverAnchor => {
  const rect = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX, y: rect.top + rect.height / 2 };
};

// Индекс «день → события». Только разовые — события-периоды в календаре не показываем.
function buildDayIndex(events: TimelineEvent[], filter: EventFilter): DayIndex {
  const filterOn = isFilterActive(filter);
  const map: DayIndex = new Map();
  const push = (key: string, e: TimelineEvent) => {
    const bucket = map.get(key);
    if (bucket) bucket.push(e);
    else map.set(key, [e]);
  };
  for (const e of events) {
    if (filterOn && !matchesFilter(e, filter)) continue;
    if (isPeriod(e)) continue;
    push(e.date, e);
  }
  // Важные сверху — при переполнении первыми обрезаются менее значимые.
  for (const bucket of map.values()) {
    bucket.sort((a, b) => b.significance - a.significance || b.id - a.id);
  }
  return map;
}

// Индекс «день → отметки» (быстрый лог без названия, рендерятся иконкой).
function buildMarkIndex(marks: Mark[], filter: EventFilter): MarkIndex {
  const filterOn = isFilterActive(filter);
  const map: MarkIndex = new Map();
  for (const m of marks) {
    if (filterOn && !matchesMarkFilter(m, filter)) continue;
    const bucket = map.get(m.date);
    if (bucket) bucket.push(m);
    else map.set(m.date, [m]);
  }
  return map;
}

type CalCtx = {
  dayIndex: DayIndex;
  markIndex: MarkIndex;
  onEventOpen: (event: TimelineEvent) => void;
  onCreateAt: (iso: string, anchor: PopoverAnchor) => void;
  onDayOpen: (iso: string) => void;
  onMarkOpen: (iso: string) => void;
  onMarkMenu: (mark: Mark, x: number, y: number) => void;
  displayMonth: Date;
  onShift: (unit: "month" | "year", delta: number) => void;
  onToday: () => void;
  isTodayMonth: boolean;
  dayKind: (iso: string, date: Date, disabled: boolean) => "" | "weekend" | "holiday";
};

const CalendarContext = createContext<CalCtx>({
  dayIndex: new Map(),
  markIndex: new Map(),
  onEventOpen: () => {},
  onCreateAt: () => {},
  onDayOpen: () => {},
  onMarkOpen: () => {},
  onMarkMenu: () => {},
  displayMonth: new Date(0),
  onShift: () => {},
  onToday: () => {},
  isTodayMonth: true,
  dayKind: () => "",
});

function EventMarker({ event }: { event: TimelineEvent }) {
  if (!event.cover) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/media/${event.cover}`}
      alt=""
      loading="lazy"
      decoding="async"
      className="tl-cal-chip-thumb"
    />
  );
}

// Кастомная ячейка-gridcell: число + чипы событий (НЕ DayButton — чипы не вложены в button).
function DayCell({ day, modifiers, className, ...rest }: DayProps) {
  const { dayIndex, markIndex, onEventOpen, onCreateAt, onDayOpen, onMarkOpen, onMarkMenu, dayKind } =
    useContext(CalendarContext);
  const dayEvents = modifiers.disabled ? [] : dayIndex.get(day.isoDate) ?? [];
  const dayMarks = modifiers.disabled ? [] : markIndex.get(day.isoDate) ?? [];
  const shown = dayEvents.slice(0, MAX_CHIPS);
  const extra = dayEvents.length - shown.length;
  const kind = dayKind(day.isoDate, day.date, !!modifiers.disabled);
  const holiday = kind === "holiday" ? holidayName(day.isoDate) : null;

  return (
    <td {...(rest as HTMLAttributes<HTMLTableCellElement>)} className={`${className ?? ""} tl-cal-td`}>
      <div
        onClick={
          modifiers.disabled
            ? undefined
            : (e) =>
                dayEvents.length > 0 || dayMarks.length > 0
                  ? onDayOpen(day.isoDate)
                  : onCreateAt(day.isoDate, anchorFrom(e))
        }
        title={holiday ?? undefined}
        className={`tl-cal-cell${modifiers.today ? " is-today" : ""}${
          modifiers.disabled ? " is-disabled" : ""
        }${kind ? ` is-${kind}` : ""}`}
      >
        <div className="tl-cal-head">
          <span className="tl-cal-num">{day.date.getDate()}</span>
          {dayMarks.length > 0 && (
            <div className="tl-cal-marks">
              {dayMarks.slice(0, 3).map((m) => {
                const Icon = resolveIconOrNull(m.type_icon);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className="tl-cal-mark"
                    title={m.type_name}
                    style={{ background: m.type_color, color: onColorFor(m.type_color) }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onMarkOpen(day.isoDate);
                    }}
                    onContextMenu={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      onMarkMenu(m, ev.clientX, ev.clientY);
                    }}
                  >
                    {Icon && createElement(Icon, { size: 11 })}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {shown.length > 0 && (
          <div className="tl-cal-chips">
            {shown.map((e) => {
              const sig = getSignificanceMeta(e.significance);
              return (
                <button
                  key={e.id}
                  type="button"
                  className="tl-cal-chip"
                  style={{
                    background: sig.color,
                    color: sig.onColor,
                    borderLeft: e.category_color ? `4px solid ${e.category_color}` : undefined,
                  }}
                  title={e.title}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onEventOpen(e);
                  }}
                >
                  <EventMarker event={e} />
                  <span className="tl-cal-chip-title">{e.title}</span>
                </button>
              );
            })}
            {extra > 0 && (
              <button
                type="button"
                className="tl-cal-more"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onDayOpen(day.isoDate);
                }}
              >
                +{extra}
              </button>
            )}
          </div>
        )}
      </div>
    </td>
  );
}

// Поле «месяц»/«год»: колесо мыши = ±1 (вверх — назад, вниз — вперёд), шевроны кликабельны.
function WheelField({
  label,
  ariaLabel,
  isMonth,
  onShift,
}: {
  label: string;
  ariaLabel: string;
  isMonth?: boolean;
  onShift: (delta: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(onShift);

  useEffect(() => {
    shiftRef.current = onShift;
  });

  // Нативный non-passive listener: React-овый onWheel passive, preventDefault в нём не работает.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      shiftRef.current(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className={`tl-cal-wheel${isMonth ? " is-month" : ""}`}
      role="spinbutton"
      aria-label={ariaLabel}
      title="Прокрутите колёсиком"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Назад"
        className="tl-cal-wheel-chev"
        onClick={() => onShift(-1)}
      >
        <ChevronUp size={13} />
      </button>
      <span className="tl-cal-wheel-val">{label}</span>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Вперёд"
        className="tl-cal-wheel-chev"
        onClick={() => onShift(1)}
      >
        <ChevronDown size={13} />
      </button>
    </div>
  );
}

function MonthCaption({ calendarMonth, displayIndex, ...rest }: MonthCaptionProps) {
  const { displayMonth, onShift, onToday, isTodayMonth } = useContext(CalendarContext);
  void calendarMonth;
  void displayIndex;
  return (
    <div {...rest} className={`${rest.className ?? ""} tl-cal-caption`}>
      <div className="tl-cal-caption-fields">
        <WheelField
          isMonth
          label={format(displayMonth, "LLLL", { locale: ru })}
          ariaLabel="Месяц"
          onShift={(d) => onShift("month", d)}
        />
        <WheelField
          label={format(displayMonth, "yyyy")}
          ariaLabel="Год"
          onShift={(d) => onShift("year", d)}
        />
      </div>
      {!isTodayMonth && (
        <button type="button" className="tl-cal-today" onClick={onToday}>
          <CalendarDays size={15} />
          Сегодня
        </button>
      )}
    </div>
  );
}

const COMPONENTS = { Day: DayCell, MonthCaption };

export function CalendarView({
  events,
  marks = [],
  filter = EMPTY_FILTER,
  onEventClick = () => {},
  onCreateRequest = () => {},
  onDayOpen = () => {},
  onMarkOpen = () => {},
  onMarkMenu = () => {},
}: {
  events: TimelineEvent[];
  marks?: Mark[];
  filter?: EventFilter;
  onFilterChange?: (filter: EventFilter) => void;
  onEventClick?: (event: TimelineEvent) => void;
  onCreateRequest?: (dateISO: string, anchor: PopoverAnchor) => void;
  onDayOpen?: (dateISO: string) => void;
  onMarkOpen?: (dateISO: string) => void;
  onMarkMenu?: (mark: Mark, x: number, y: number) => void;
}) {
  const today = useMemo(() => new Date(), []);
  // Верхняя граница навигации/создания: сегодня + горизонт будущего.
  const limit = useMemo(() => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() + FUTURE_HORIZON_YEARS);
    return d;
  }, [today]);
  const maxDay = useMemo(() => endOfMonth(limit), [limit]);
  const [month, setMonth] = useState<Date>(() => new Date());
  const dayIndex = useMemo(() => buildDayIndex(events, filter), [events, filter]);
  const markIndex = useMemo(() => buildMarkIndex(marks, filter), [marks, filter]);

  // Нерабочие дни (праздники + переносы РФ) по годам; null — данных нет, fallback на сб/вс.
  const displayYear = month.getFullYear();
  const [nonWork, setNonWork] = useState<Map<number, Set<string> | null>>(() => new Map());
  const loadedYears = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (loadedYears.current.has(displayYear)) return;
    loadedYears.current.add(displayYear);
    let cancelled = false;
    getNonWorkingDaysAction(displayYear)
      .then((iso) => {
        if (cancelled) return;
        setNonWork((prev) => new Map(prev).set(displayYear, iso ? new Set(iso) : null));
      })
      .catch(() => loadedYears.current.delete(displayYear));
    return () => {
      cancelled = true;
    };
  }, [displayYear]);

  const dayKind = useCallback(
    (iso: string, date: Date, disabled: boolean): "" | "weekend" | "holiday" => {
      if (disabled) return "";
      if (holidayName(iso)) return "holiday";
      const set = nonWork.get(Number(iso.slice(0, 4)));
      const nonWorking = set ? set.has(iso) : date.getDay() === 0 || date.getDay() === 6;
      return nonWorking ? "weekend" : "";
    },
    [nonWork],
  );

  const handleShift = useCallback(
    (unit: "month" | "year", delta: number) => {
      setMonth((m) => (unit === "month" ? stepMonth(limit, m, delta) : shiftYear(limit, m, delta)));
    },
    [limit],
  );

  const handleToday = useCallback(() => setMonth(startOfMonth(today)), [today]);

  // Колесо над сеткой дней (не над шапкой) листает месяцы линейно: вверх — раньше, вниз — позже.
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest(".rdp-month_grid")) return;
      e.preventDefault();
      handleShift("month", e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [handleShift]);

  const ctx = useMemo<CalCtx>(
    () => ({
      dayIndex,
      markIndex,
      onEventOpen: onEventClick,
      onCreateAt: onCreateRequest,
      onDayOpen,
      onMarkOpen,
      onMarkMenu,
      displayMonth: month,
      onShift: handleShift,
      onToday: handleToday,
      isTodayMonth: isSameMonth(month, today),
      dayKind,
    }),
    [
      dayIndex,
      markIndex,
      onEventClick,
      onCreateRequest,
      onDayOpen,
      onMarkOpen,
      onMarkMenu,
      month,
      handleShift,
      handleToday,
      today,
      dayKind,
    ],
  );

  return (
    <div className="flex h-full w-full justify-center overflow-auto p-6">
      <div
        ref={cardRef}
        className="tl-calendar tl-calendar-lg m-auto p-5"
        style={{
          background: "var(--md-sys-color-surface-container-low)",
          borderRadius: "var(--md-sys-shape-corner-large)",
          boxShadow: ELEVATION_1,
        }}
      >
        <CalendarContext.Provider value={ctx}>
          <DayPicker
            month={month}
            onMonthChange={setMonth}
            locale={ru}
            captionLayout="label"
            startMonth={START_MONTH}
            endMonth={limit}
            disabled={[{ before: START_MONTH }, { after: maxDay }]}
            components={COMPONENTS}
            aria-label="Календарь событий"
          />
        </CalendarContext.Provider>
      </div>
    </div>
  );
}
