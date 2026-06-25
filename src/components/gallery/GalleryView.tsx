"use client";

import { useMemo, useRef } from "react";
import { formatMonthRu } from "@/lib/dates";
import { EventCard, MarkCard } from "./EventCard";
import { DateScrubber } from "./DateScrubber";
import {
  EMPTY_FILTER,
  isFilterActive,
  matchesFilter,
  matchesMarkFilter,
  type EventFilter,
} from "@/lib/filter";
import type { TimelineEvent } from "@/db/queries/events";
import type { Mark } from "@/db/queries/marks";

const GALLERY_MIN_SIGNIFICANCE = 2;

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const byDateDesc = <T extends { date: string; id: number }>(a: T, b: T) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id;

type MonthGroup = {
  key: string;
  label: string;
  events: TimelineEvent[];
  marks: Mark[];
};

function buildGroups(events: TimelineEvent[], marks: Mark[], filter: EventFilter): MonthGroup[] {
  const filterOn = isFilterActive(filter);
  const evMap = new Map<string, TimelineEvent[]>();
  const mkMap = new Map<string, Mark[]>();
  for (const e of events) {
    // Базовый порог галереи sig 2–3 + пользовательский фильтр поверх.
    if (e.significance < GALLERY_MIN_SIGNIFICANCE) continue;
    if (filterOn && !matchesFilter(e, filter)) continue;
    const key = e.date.slice(0, 7);
    const bucket = evMap.get(key);
    if (bucket) bucket.push(e);
    else evMap.set(key, [e]);
  }
  for (const m of marks) {
    if (filterOn && !matchesMarkFilter(m, filter)) continue;
    const key = m.date.slice(0, 7);
    const bucket = mkMap.get(key);
    if (bucket) bucket.push(m);
    else mkMap.set(key, [m]);
  }
  const keys = new Set([...evMap.keys(), ...mkMap.keys()]);
  return [...keys]
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => {
      const evs = (evMap.get(key) ?? []).sort(byDateDesc);
      const mks = (mkMap.get(key) ?? []).sort(byDateDesc);
      return {
        key,
        label: capitalize(formatMonthRu((evs[0] ?? mks[0]).date)),
        events: evs,
        marks: mks,
      };
    });
}

export function GalleryView({
  events,
  marks = [],
  filter = EMPTY_FILTER,
  onFilterChange,
  onEventClick,
  onMarkOpen = () => {},
}: {
  events: TimelineEvent[];
  marks?: Mark[];
  filter?: EventFilter;
  onFilterChange?: (filter: EventFilter) => void;
  onEventClick: (event: TimelineEvent) => void;
  onMarkOpen?: (dateISO: string) => void;
}) {
  const groups = useMemo(() => buildGroups(events, marks, filter), [events, marks, filter]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (groups.length === 0) {
    const filterOn = isFilterActive(filter);
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        {filterOn ? "Ничего не найдено по фильтру." : "Нет важных событий для галереи."}
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
              <h2
                className="sticky top-0 z-10 -mx-2 mb-4 px-2 py-2 text-lg font-semibold backdrop-blur"
                style={{
                  background:
                    "color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                {group.label}
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 [contain-intrinsic-size:auto_400px] [content-visibility:auto]">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} onClick={onEventClick} />
                ))}
                {group.marks.map((mark) => (
                  <MarkCard key={`m-${mark.id}`} mark={mark} onClick={() => onMarkOpen(mark.date)} />
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
