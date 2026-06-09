"use client";

import { createElement } from "react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { getSignificanceMeta } from "@/lib/significance";
import { resolveIcon } from "@/lib/icons";
import type { TimelineEvent } from "@/db/queries/events";

export function EventCard({
  event,
  onClick,
}: {
  event: TimelineEvent;
  onClick: (event: TimelineEvent) => void;
}) {
  const sig = getSignificanceMeta(event.significance);
  const accent = event.category_color ?? sig.color;
  const Icon = resolveIcon(event.category_icon);
  const dateLabel = event.end_date
    ? `${formatDayMonthRu(event.date)} — ${formatFullRu(event.end_date)}`
    : formatFullRu(event.date);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 text-left transition-colors hover:border-app-text/20"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {event.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${event.cover}`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: accent }}
          >
            {createElement(Icon, { size: 48, strokeWidth: 1.5, className: "text-white/70" })}
          </div>
        )}
        <span
          className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full shadow"
          style={{ background: accent }}
          title={event.category_name ?? undefined}
        >
          {createElement(Icon, { size: 15, className: "text-white" })}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <p className="truncate font-medium text-app-text">{event.title}</p>
        <p className="text-sm text-muted">{dateLabel}</p>
      </div>
    </button>
  );
}
