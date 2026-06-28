"use client";

import { useMemo } from "react";
import { Target } from "lucide-react";
import { TrackingCard } from "./TrackingCard";
import { useTodayISO } from "./clock";
import type { TimelineEvent } from "@/db/queries/events";

// Сортировка по близости к сегодня: прошлое — недавнее сверху, будущее — ближайшее сверху.
const byDateDesc = (a: TimelineEvent, b: TimelineEvent) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id;
const byDateAsc = (a: TimelineEvent, b: TimelineEvent) =>
  a.date > b.date ? 1 : a.date < b.date ? -1 : a.id - b.id;

function Section({
  title,
  events,
  variant,
  onEventClick,
}: {
  title: string;
  events: TimelineEvent[];
  variant: "past" | "future";
  onEventClick: (event: TimelineEvent) => void;
}) {
  return (
    <section>
      <h2
        className="sticky top-0 z-30 -mx-2 mb-4 px-2 py-2 text-lg font-semibold backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent)",
          color: "var(--md-sys-color-on-surface)",
        }}
      >
        {title}
        <span className="ml-2 text-sm font-normal" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
          {events.length}
        </span>
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {events.map((event) => (
          <TrackingCard key={event.id} event={event} variant={variant} onClick={onEventClick} />
        ))}
      </div>
    </section>
  );
}

export function TrackingView({
  events,
  onEventClick,
}: {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
}) {
  // Реактивный «сегодня»: в полночь наступившее напоминание само уезжает в «Уже прошло».
  const today = useTodayISO();
  const { past, future } = useMemo(() => {
    const tracked = events.filter((e) => e.track === 1);
    return {
      past: tracked.filter((e) => e.date <= today).sort(byDateDesc),
      future: tracked.filter((e) => e.date > today).sort(byDateAsc),
    };
  }, [events, today]);

  if (past.length === 0 && future.length === 0) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        <Target size={40} strokeWidth={1.5} />
        <p className="max-w-sm">
          Нет отслеживаемых событий. Включите «Отслеживание» при создании или редактировании
          события — и оно появится здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full overflow-y-auto px-6 py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          {past.length > 0 && (
            <Section title="Уже прошло" events={past} variant="past" onEventClick={onEventClick} />
          )}
          {future.length > 0 && (
            <Section
              title="Напоминания"
              events={future}
              variant="future"
              onEventClick={onEventClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
