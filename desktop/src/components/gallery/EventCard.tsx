import { createElement } from "react";
import { CalendarClock } from "lucide-react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { eventAccent } from "@/lib/accent";
import { resolveIconOrNull } from "@/lib/icons";
import { isFuture } from "@/lib/duration";
import { mediaSrc } from "@/lib/paths";
import { CoverPlaceholder } from "@/components/ui/CoverPlaceholder";
import type { TimelineEvent } from "@/db/queries/events";

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
  const future = isFuture(event.date);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-surface-1 text-left shadow-sm transition-[box-shadow,scale] duration-200 ease-[var(--rg-ease)] hover:shadow-lg active:scale-[0.96] ${
        future ? "border-[1.5px] border-dashed border-muted" : "border border-line"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 z-20 bg-app-text opacity-0 transition-opacity duration-200 group-hover:opacity-[0.06]" />
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {event.cover ? (
          <img
            src={mediaSrc(event.cover)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ opacity: future ? 0.6 : undefined }}
          />
        ) : (
          <CoverPlaceholder fill={accent.fill} icon={event.category_icon} dimmed={future} />
        )}
        {future && (
          <span
            className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-surface-1 text-muted shadow-sm"
            title="Запланировано"
          >
            <CalendarClock size={15} strokeWidth={1.75} />
          </span>
        )}
        {Icon && (
          <span
            className="absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full shadow-sm"
            style={{ background: accent.fill, color: accent.onFill }}
            title={event.category_name ?? undefined}
          >
            {createElement(Icon, { size: 15 })}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <p className="m-0 truncate font-medium text-app-text">{event.title}</p>
        <p className="m-0 text-sm text-muted">{dateLabel}</p>
      </div>
    </button>
  );
}
