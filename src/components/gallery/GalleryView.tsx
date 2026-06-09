"use client";

import { useMemo, useRef } from "react";
import { formatMonthRu } from "@/lib/dates";
import { EventCard } from "./EventCard";
import { DateScrubber } from "./DateScrubber";
import { EMPTY_FILTER, isFilterActive, matchesFilter, type EventFilter } from "@/lib/filter";
import type { TimelineEvent } from "@/db/queries/events";

const GALLERY_MIN_SIGNIFICANCE = 2;

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

type MonthGroup = {
  key: string;
  label: string;
  events: TimelineEvent[];
};

function groupByMonth(events: TimelineEvent[], filter: EventFilter): MonthGroup[] {
  const filterOn = isFilterActive(filter);
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    // Базовый порог галереи sig 2–3 + пользовательский фильтр поверх.
    if (e.significance < GALLERY_MIN_SIGNIFICANCE) continue;
    if (filterOn && !matchesFilter(e, filter)) continue;
    const key = e.date.slice(0, 7);
    const bucket = map.get(key);
    if (bucket) bucket.push(e);
    else map.set(key, [e]);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, evs]) => ({
      key,
      label: capitalize(formatMonthRu(evs[0].date)),
      events: evs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id)),
    }));
}

export function GalleryView({
  events,
  filter = EMPTY_FILTER,
  onFilterChange,
  onEventClick,
}: {
  events: TimelineEvent[];
  filter?: EventFilter;
  onFilterChange?: (filter: EventFilter) => void;
  onEventClick: (event: TimelineEvent) => void;
}) {
  const groups = useMemo(() => groupByMonth(events, filter), [events, filter]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (groups.length === 0) {
    const filterOn = isFilterActive(filter);
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-muted">
        {filterOn ? "Ничего не найдено по фильтру." : "Нет важных событий для галереи."}
        {filterOn && onFilterChange && (
          <button
            type="button"
            onClick={() => onFilterChange(EMPTY_FILTER)}
            className="text-sm text-app-text underline-offset-4 transition-colors hover:underline"
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={scrollRef}
        className="h-full w-full overflow-y-auto px-6 py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto max-w-6xl">
          {groups.map((group) => (
            <section key={group.key} data-scrubber-key={group.key} className="mb-10">
              <h2 className="sticky top-0 z-10 -mx-2 mb-4 bg-surface-0/80 px-2 py-2 text-lg font-semibold text-app-text backdrop-blur">
                {group.label}
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 [contain-intrinsic-size:auto_400px] [content-visibility:auto]">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} onClick={onEventClick} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <DateScrubber scrollRef={scrollRef} groups={groups} />
    </div>
  );
}
