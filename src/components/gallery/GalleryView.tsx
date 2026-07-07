"use client";

import { useMemo, useRef } from "react";
import { formatMonthRu } from "@/lib/dates";
import { EventCard } from "./EventCard";
import { DateScrubber } from "./DateScrubber";
import { EMPTY_FILTER, isFilterActive, matchesFilter, type EventFilter } from "@/lib/filter";
import type { TimelineEvent } from "@/db/queries/events";

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const byDateDesc = (a: TimelineEvent, b: TimelineEvent) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id;

type MonthGroup = {
  key: string;
  label: string;
  events: TimelineEvent[];
};

function buildGroups(events: TimelineEvent[], filter: EventFilter): MonthGroup[] {
  const filterOn = isFilterActive(filter);
  const evMap = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    if (filterOn && !matchesFilter(e, filter)) continue;
    const key = e.date.slice(0, 7);
    const bucket = evMap.get(key);
    if (bucket) bucket.push(e);
    else evMap.set(key, [e]);
  }
  return [...evMap.keys()]
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => {
      const evs = evMap.get(key)!.sort(byDateDesc);
      return { key, label: capitalize(formatMonthRu(evs[0].date)), events: evs };
    });
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
  const groups = useMemo(() => buildGroups(events, filter), [events, filter]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (groups.length === 0) {
    const filterOn = isFilterActive(filter);
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        {filterOn ? "Ничего не найдено по фильтру." : "Нет событий для галереи."}
        {filterOn && onFilterChange && (
          <button
            type="button"
            onClick={() => onFilterChange(EMPTY_FILTER)}
            className="text-sm underline-offset-4 transition-colors hover:underline"
            style={{ color: "var(--md-sys-color-primary)" }}
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
              <div className="sticky top-0 z-30 mb-4 flex justify-center">
                <h2
                  className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur"
                  style={{
                    background:
                      "color-mix(in srgb, var(--md-sys-color-surface-container-high) 85%, transparent)",
                    color: "var(--md-sys-color-on-surface)",
                    boxShadow:
                      "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 25%, transparent)",
                  }}
                >
                  {group.label}
                </h2>
              </div>
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
