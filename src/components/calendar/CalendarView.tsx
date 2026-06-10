"use client";

import { createContext, useContext, useMemo, useState, type HTMLAttributes } from "react";
import {
  DayPicker,
  Dropdown as RdpDropdown,
  type DayProps,
  type DropdownProps,
} from "react-day-picker";
import { ru } from "date-fns/locale";
import { parseISO, eachDayOfInterval, format } from "date-fns";
import { MoveHorizontal } from "lucide-react";
import "react-day-picker/style.css";
import { Popover, type PopoverAnchor } from "@/components/ui/Popover";
import { getSignificanceMeta } from "@/lib/significance";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { EMPTY_FILTER, isFilterActive, matchesFilter, type EventFilter } from "@/lib/filter";
import { BIRTH_DATE } from "@/lib/constants";
import type { TimelineEvent } from "@/db/queries/events";

const START_MONTH = parseISO(BIRTH_DATE);
const MAX_CHIPS = 3;

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
};

const CalendarContext = createContext<CalCtx>({
  dayIndex: new Map(),
  onEventOpen: () => {},
  onCreateAt: () => {},
  onOverflowOpen: () => {},
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
  const { dayIndex, onEventOpen, onCreateAt, onOverflowOpen } = useContext(CalendarContext);
  const dayEvents = modifiers.disabled ? [] : dayIndex.get(day.isoDate) ?? [];
  const shown = dayEvents.slice(0, MAX_CHIPS);
  const extra = dayEvents.length - shown.length;

  return (
    <td {...(rest as HTMLAttributes<HTMLTableCellElement>)} className={`${className ?? ""} tl-cal-td`}>
      <div
        onClick={modifiers.disabled ? undefined : (e) => onCreateAt(day.isoDate, anchorFrom(e))}
        className={`tl-cal-cell${modifiers.today ? " is-today" : ""}${
          modifiers.disabled ? " is-disabled" : ""
        }`}
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

// Нативные select'ы dropdown'а без name/id триггерят a11y-issue — проставляем name.
function NamedDropdown(props: DropdownProps) {
  return <RdpDropdown {...props} name={(props["aria-label"] as string) || "rdp-dropdown"} />;
}

const COMPONENTS = { Day: DayCell, Dropdown: NamedDropdown };

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

  const ctx = useMemo<CalCtx>(
    () => ({
      dayIndex,
      onEventOpen: onEventClick,
      onCreateAt: onCreateRequest,
      onOverflowOpen: (evs, anchor) => setDayList({ events: evs, anchor }),
    }),
    [dayIndex, onEventClick, onCreateRequest],
  );

  return (
    <div className="flex h-full w-full items-start justify-center overflow-auto p-6">
      <div className="tl-calendar tl-calendar-lg rounded-card border border-line bg-surface-1 p-5 shadow-2xl">
        <CalendarContext.Provider value={ctx}>
          <DayPicker
            month={month}
            onMonthChange={setMonth}
            locale={ru}
            captionLayout="dropdown"
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
