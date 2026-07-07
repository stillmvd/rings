"use client";

import { createElement } from "react";
import { CalendarClock } from "lucide-react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { eventAccent } from "@/lib/accent";
import { resolveIconOrNull } from "@/lib/icons";
import { isFuture } from "@/lib/duration";
import { CoverPlaceholder } from "@/components/ui/CoverPlaceholder";
import type { TimelineEvent } from "@/db/queries/events";

// M3 elevation level 1 → level 2 при hover (карточка Elevated).
const ELEVATION_1 =
  "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent), 0 1px 3px 1px color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent)";
const ELEVATION_2 =
  "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent), 0 2px 6px 2px color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent)";

export function EventCard({
  event,
  onClick,
}: {
  event: TimelineEvent;
  onClick: (event: TimelineEvent) => void;
}) {
  const accent = eventAccent(event);
  const Icon = resolveIconOrNull(event.category_icon);
  const dateLabel = event.end_date
    ? `${formatDayMonthRu(event.date)} ↔ ${formatFullRu(event.end_date)}`
    : formatFullRu(event.date);
  // Будущее ещё не наступило → пунктирная рамка + приглушённое медиа + бейдж.
  const future = isFuture(event.date);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="group relative flex flex-col overflow-hidden rounded-[12px] text-left transition-shadow duration-200"
      style={{
        background: "var(--md-sys-color-surface-container-low)",
        color: "var(--md-sys-color-on-surface)",
        boxShadow: ELEVATION_1,
        border: future ? "1.5px dashed var(--md-sys-color-outline)" : undefined,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = ELEVATION_2)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = ELEVATION_1)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-[0.08]"
        style={{ background: "var(--md-sys-color-on-surface)" }}
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {event.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${event.cover}`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ opacity: future ? 0.6 : undefined }}
          />
        ) : (
          <CoverPlaceholder
            icon={Icon}
            fill={accent.fill}
            container={accent.container}
            onContainer={accent.onContainer}
            iconSize={48}
            dimmed={future}
          />
        )}
        {future && (
          <span
            className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full"
            style={{
              background: "var(--md-sys-color-surface-container-high)",
              color: "var(--md-sys-color-on-surface-variant)",
              boxShadow:
                "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent)",
            }}
            title="Запланировано"
          >
            <CalendarClock size={15} />
          </span>
        )}
        {Icon && (
          <span
            className="absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full"
            style={{
              background: accent.fill,
              color: accent.onFill,
              boxShadow:
                "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent)",
            }}
            title={event.category_name ?? undefined}
          >
            {createElement(Icon, { size: 15 })}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <p
          className="truncate font-medium"
          style={{ color: "var(--md-sys-color-on-surface)" }}
        >
          {event.title}
        </p>
        <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
          {dateLabel}
        </p>
      </div>
    </button>
  );
}
