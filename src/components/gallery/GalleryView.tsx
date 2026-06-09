"use client";

import { useMemo, useRef } from "react";
import { formatMonthRu } from "@/lib/dates";
import { EventCard } from "./EventCard";
import { DateScrubber } from "./DateScrubber";
import type { TimelineEvent } from "@/db/queries/events";

const GALLERY_MIN_SIGNIFICANCE = 2;

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

type MonthGroup = {
  key: string;
  label: string;
  events: TimelineEvent[];
};

function groupByMonth(events: TimelineEvent[]): MonthGroup[] {
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    if (e.significance < GALLERY_MIN_SIGNIFICANCE) continue;
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
  onEventClick,
}: {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
}) {
  const groups = useMemo(() => groupByMonth(events), [events]);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (groups.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-center text-muted">
        Нет важных событий для галереи.
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
