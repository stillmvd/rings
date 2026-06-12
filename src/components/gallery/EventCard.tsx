"use client";

import { createElement } from "react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { getSignificanceMeta } from "@/lib/significance";
import { resolveIcon } from "@/lib/icons";
import { onColorFor } from "@/lib/colors";
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
  const sig = getSignificanceMeta(event.significance);
  // Фон акцента и контрастный контент: для произвольного category_color — авто-контраст по YIQ,
  // для роли значимости — готовый on-цвет (как в Ф4 EventDot).
  const accent = event.category_color ?? sig.color;
  const onAccent = event.category_color ? onColorFor(event.category_color) : sig.onColor;
  const Icon = resolveIcon(event.category_icon);
  const dateLabel = event.end_date
    ? `${formatDayMonthRu(event.date)} — ${formatFullRu(event.end_date)}`
    : formatFullRu(event.date);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="group relative flex flex-col overflow-hidden rounded-[12px] text-left transition-shadow duration-200"
      style={{
        background: "var(--md-sys-color-surface-container-low)",
        color: "var(--md-sys-color-on-surface)",
        boxShadow: ELEVATION_1,
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
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: accent }}
          >
            {createElement(Icon, { size: 48, strokeWidth: 1.5, style: { color: onAccent } })}
          </div>
        )}
        <span
          className="absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full"
          style={{
            background: accent,
            color: onAccent,
            boxShadow: "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent)",
          }}
          title={event.category_name ?? undefined}
        >
          {createElement(Icon, { size: 15 })}
        </span>
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
