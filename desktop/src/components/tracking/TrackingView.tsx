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
  showHeader,
  onEventClick,
}: {
  title: string;
  events: TimelineEvent[];
  variant: "past" | "future";
  showHeader: boolean;
  onEventClick: (event: TimelineEvent) => void;
}) {
  return (
    <section>
      {showHeader && (
        <div className="sticky top-0 z-30 mb-4 flex justify-center">
          <h2
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-app-text backdrop-blur"
            style={{
              background: "color-mix(in srgb, var(--rg-surface) 85%, transparent)",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.25)",
            }}
          >
            {title}
            <span
              className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium text-app-text"
              style={{ background: "var(--ds-surface-2)" }}
            >
              {events.length}
            </span>
          </h2>
        </div>
      )}
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
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-muted">
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
            <Section
              title="Уже прошло"
              events={past}
              variant="past"
              showHeader={future.length > 0}
              onEventClick={onEventClick}
            />
          )}
          {future.length > 0 && (
            <Section
              title="Предстоящее"
              events={future}
              variant="future"
              showHeader={past.length > 0}
              onEventClick={onEventClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
