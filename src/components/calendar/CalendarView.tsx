"use client";

import {
  createContext,
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
import { parseISO, eachDayOfInterval, format, startOfMonth, isSameMonth } from "date-fns";
import { MoveHorizontal, ChevronUp, ChevronDown, CalendarDays } from "lucide-react";
import "react-day-picker/style.css";
import { Popover, type PopoverAnchor } from "@/components/ui/Popover";
import { getSignificanceMeta } from "@/lib/significance";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { EMPTY_FILTER, isFilterActive, matchesFilter, type EventFilter } from "@/lib/filter";
import { BIRTH_DATE } from "@/lib/constants";
import { holidayName } from "@/lib/holidays";
import { getNonWorkingDaysAction } from "@/actions/calendar";
import type { TimelineEvent } from "@/db/queries/events";

const START_MONTH = parseISO(BIRTH_DATE);
const MAX_CHIPS = 3;

// Допустимый диапазон месяцев (0–11) для конкретного года:
// в год рождения снизу режет месяц рождения, в текущий год сверху — текущий месяц.
function monthBounds(today: Date, year: number): { lo: number; hi: number } {
  const lo = year === START_MONTH.getFullYear() ? START_MONTH.getMonth() : 0;
  const hi = year === today.getFullYear() ? today.getMonth() : 11;
  return { lo, hi };
}

// Линейный сдвиг месяца с переносом года (январь−1 → декабрь прошлого года); кламп по диапазону.
function stepMonth(today: Date, current: Date, delta: number): Date {
  const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
  const lo = new Date(START_MONTH.getFullYear(), START_MONTH.getMonth(), 1);
  const hi = new Date(today.getFullYear(), today.getMonth(), 1);
  return next < lo ? lo : next > hi ? hi : next;
}

// Сдвиг года с клампом по диапазону; месяц подтягивается в границы нового года.
function shiftYear(today: Date, current: Date, delta: number): Date {
  const minY = START_MONTH.getFullYear();
  const maxY = today.getFullYear();
  const year = Math.min(Math.max(current.getFullYear() + delta, minY), maxY);
  const { lo, hi } = monthBounds(today, year);
  const m = Math.min(Math.max(current.getMonth(), lo), hi);
  return new Date(year, m, 1);
}

type DayIndex = Map<string, TimelineEvent[]>;

const isPeriod = (e: TimelineEvent) => !!e.end_date && e.end_date > e.date;

const dateLabel = (e: TimelineEvent) =>
  e.end_date ? `${formatDayMonthRu(e.date)} — ${formatFullRu(e.end_date)}` : formatFullRu(e.date);

const anchorFrom = (e: { clientX: number; currentTarget: HTMLElement }): PopoverAnchor => {
  const rect = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX, y: rect.top + rect.height / 2 };
};

// Индекс «день → события». Период (end_date) попадает в каждый день интервала.
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
    if (isPeriod(e)) {
      for (const d of eachDayOfInterval({ start: parseISO(e.date), end: parseISO(e.end_date!) })) {
        push(format(d, "yyyy-MM-dd"), e);
      }
    } else {
      push(e.date, e);
    }
  }
  // Важные сверху — при переполнении первыми обрезаются менее значимые.
  for (const bucket of map.values()) {
    bucket.sort((a, b) => b.significance - a.significance || b.id - a.id);
  }
  return map;
}

type CalCtx = {
  dayIndex: DayIndex;
  onEventOpen: (event: TimelineEvent) => void;
  onCreateAt: (iso: string, anchor: PopoverAnchor) => void;
  onOverflowOpen: (events: TimelineEvent[], anchor: PopoverAnchor) => void;
  displayMonth: Date;
  onShift: (unit: "month" | "year", delta: number) => void;
  onToday: () => void;
  isTodayMonth: boolean;
  dayKind: (iso: string, date: Date, disabled: boolean) => "" | "weekend" | "holiday";
};

const CalendarContext = createContext<CalCtx>({
  dayIndex: new Map(),
  onEventOpen: () => {},
  onCreateAt: () => {},
  onOverflowOpen: () => {},
  displayMonth: new Date(0),
  onShift: () => {},
  onToday: () => {},
  isTodayMonth: true,
  dayKind: () => "",
});

function EventMarker({ event }: { event: TimelineEvent }) {
  const color = event.category_color ?? getSignificanceMeta(event.significance).color;
  if (event.cover) {
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
  if (isPeriod(event)) return <MoveHorizontal size={10} style={{ color }} className="shrink-0" />;
  return <span className="tl-cal-chip-dot" style={{ background: color }} />;
}

// Кастомная ячейка-gridcell: число + чипы событий (НЕ DayButton — чипы не вложены в button).
function DayCell({ day, modifiers, className, ...rest }: DayProps) {
  const { dayIndex, onEventOpen, onCreateAt, onOverflowOpen, dayKind } =
    useContext(CalendarContext);
  const dayEvents = modifiers.disabled ? [] : dayIndex.get(day.isoDate) ?? [];
  const shown = dayEvents.slice(0, MAX_CHIPS);
  const extra = dayEvents.length - shown.length;
  const kind = dayKind(day.isoDate, day.date, !!modifiers.disabled);
  const holiday = kind === "holiday" ? holidayName(day.isoDate) : null;

  return (
    <td {...(rest as HTMLAttributes<HTMLTableCellElement>)} className={`${className ?? ""} tl-cal-td`}>
      <div
        onClick={modifiers.disabled ? undefined : (e) => onCreateAt(day.isoDate, anchorFrom(e))}
        title={holiday ?? undefined}
        className={`tl-cal-cell${modifiers.today ? " is-today" : ""}${
          modifiers.disabled ? " is-disabled" : ""
        }${kind ? ` is-${kind}` : ""}`}
      >
        <span className="tl-cal-num">{day.date.getDate()}</span>
        {shown.length > 0 && (
          <div className="tl-cal-chips">
            {shown.map((e) => {
              const color = e.category_color ?? getSignificanceMeta(e.significance).color;
              return (
                <button
                  key={e.id}
                  type="button"
                  className="tl-cal-chip"
                  style={{ borderLeftColor: color }}
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
                  onOverflowOpen(dayEvents, anchorFrom(ev));
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
  filter = EMPTY_FILTER,
  onEventClick = () => {},
  onCreateRequest = () => {},
}: {
  events: TimelineEvent[];
  filter?: EventFilter;
  onFilterChange?: (filter: EventFilter) => void;
  onEventClick?: (event: TimelineEvent) => void;
  onCreateRequest?: (dateISO: string, anchor: PopoverAnchor) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<Date>(() => new Date());
  const [dayList, setDayList] = useState<{ events: TimelineEvent[]; anchor: PopoverAnchor } | null>(
    null,
  );
  const dayIndex = useMemo(() => buildDayIndex(events, filter), [events, filter]);

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
      setMonth((m) => (unit === "month" ? stepMonth(today, m, delta) : shiftYear(today, m, delta)));
    },
    [today],
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
      onEventOpen: onEventClick,
      onCreateAt: onCreateRequest,
      onOverflowOpen: (evs, anchor) => setDayList({ events: evs, anchor }),
      displayMonth: month,
      onShift: handleShift,
      onToday: handleToday,
      isTodayMonth: isSameMonth(month, today),
      dayKind,
    }),
    [dayIndex, onEventClick, onCreateRequest, month, handleShift, handleToday, today, dayKind],
  );

  return (
    <div className="flex h-full w-full justify-center overflow-auto p-6">
      <div
        ref={cardRef}
        className="tl-calendar tl-calendar-lg m-auto rounded-card border border-line bg-surface-1 p-5 shadow-2xl"
      >
        <CalendarContext.Provider value={ctx}>
          <DayPicker
            month={month}
            onMonthChange={setMonth}
            locale={ru}
            captionLayout="label"
            startMonth={START_MONTH}
            endMonth={today}
            disabled={[{ before: START_MONTH }, { after: today }]}
            components={COMPONENTS}
            aria-label="Календарь событий"
          />
        </CalendarContext.Provider>
      </div>

      <Popover
        open={dayList !== null}
        anchor={dayList?.anchor ?? null}
        onClose={() => setDayList(null)}
        width={300}
      >
        {dayList && (
          <div className="flex flex-col gap-1">
            <h3 className="mb-1 px-1 text-sm font-semibold text-app-text">События дня</h3>
            {dayList.events.map((e) => {
              const color = e.category_color ?? getSignificanceMeta(e.significance).color;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setDayList(null);
                    onEventClick(e);
                  }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                    style={{ background: color }}
                  >
                    {isPeriod(e) && <MoveHorizontal size={12} className="text-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-app-text">{e.title}</span>
                    <span className="block truncate text-xs text-muted">{dateLabel(e)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Popover>
    </div>
  );
}
