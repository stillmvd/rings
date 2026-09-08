import { createElement } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarClock,
  Cake,
  Hourglass,
  BellRing,
} from "lucide-react";
import { formatFullRu, formatWeekdayFullRu } from "@/lib/dates";
import {
  elapsedSince,
  remainingUntil,
  formatTotalDays,
  formatNextAnniversary,
  totalDaysCount,
  countdownParts,
  formatCountdown,
  COUNTDOWN_THRESHOLD_DAYS,
} from "@/lib/duration";
import { useNowMs } from "./clock";
import { eventAccent } from "@/lib/accent";
import { resolveIconOrNull } from "@/lib/icons";
import { getSignificanceMeta } from "@/lib/significance";
import { mediaSrc } from "@/lib/paths";
import { SignificanceIcon } from "@/components/ui/SignificanceIcon";
import { CoverPlaceholder } from "@/components/ui/CoverPlaceholder";
import { MetricChip } from "@/components/ui/MetricChip";
import type { TimelineEvent } from "@/db/queries/events";
import type { Significance } from "@/lib/constants";

const ELEVATION_1 = "var(--ds-shadow-1)";
const ELEVATION_2 = "var(--ds-shadow-2)";

const ON_ACCENT_SOFT = "color-mix(in srgb, var(--ds-on-accent) 10%, transparent)";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function TrackingCard({
  event,
  variant,
  highlight,
  onClick,
}: {
  event: TimelineEvent;
  variant: "past" | "future";
  highlight?: boolean;
  onClick: (event: TimelineEvent) => void;
}) {
  const accent = eventAccent(event);
  const Icon = resolveIconOrNull(event.category_icon);
  const sig = getSignificanceMeta(event.significance);
  const isFuture = variant === "future";

  const live = isFuture && totalDaysCount(event.date) <= COUNTDOWN_THRESHOLD_DAYS;
  const now = useNowMs(live);
  const countdown = live && now !== null ? countdownParts(event.date, now) : null;

  const anniversary = isFuture ? null : formatNextAnniversary(event.date);

  const heroValue = countdown
    ? countdown.done
      ? "Наступило"
      : formatCountdown(countdown)
    : isFuture
      ? remainingUntil(event.date)
      : elapsedSince(event.date);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-4xl text-left transition-[box-shadow,scale] duration-200 ease-[var(--rg-ease)] active:scale-[0.96] ${
        highlight ? "bg-amber text-ink" : "bg-surface-1 text-app-text"
      }`}
      style={{ boxShadow: ELEVATION_1 }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = ELEVATION_2)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = ELEVATION_1)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-app-text opacity-0 transition-opacity duration-200 group-hover:opacity-[0.06]"
      />

      <div className="relative aspect-video w-full overflow-hidden">
        {event.cover ? (
          <img
            src={mediaSrc(event.cover)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverPlaceholder fill={accent.fill} icon={event.category_icon} onAccent={highlight} />
        )}

        {event.category_name && (
          <span
            className="absolute left-4 top-4 z-10 inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: accent.fill,
              color: accent.onFill,
              boxShadow: "var(--ds-shadow-1)",
            }}
            title={event.category_name}
          >
            {Icon && createElement(Icon, { size: 13 })}
            {event.category_name}
          </span>
        )}

        <span
          className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-app-text backdrop-blur"
          style={{
            background: "color-mix(in srgb, var(--rg-surface) 85%, transparent)",
            boxShadow: "var(--ds-shadow-1)",
          }}
        >
          <SignificanceIcon level={event.significance as Significance} size={13} />
          {sig.label}
        </span>

        <span
          aria-hidden
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full transition-[background-color,scale] duration-150 ease-[var(--rg-ease)] group-hover:scale-105"
          style={{
            background: highlight ? "var(--ds-on-accent)" : "var(--rg-bg)",
            color: highlight ? "var(--rg-amber)" : "var(--rg-text)",
          }}
        >
          <ArrowUpRight size={18} strokeWidth={2} />
        </span>
      </div>

      <div className="flex flex-col gap-3.5 p-5">
        <div className="min-h-[4.8rem]">
          <h3 className="line-clamp-2 text-2xl font-bold tracking-tight">{event.title}</h3>
          <p className={`mt-0.5 text-sm ${highlight ? "opacity-60" : "text-muted"}`}>
            {formatFullRu(event.date)}
          </p>
        </div>

        <div
          className="rounded-3xl px-5 py-4"
          style={{ background: highlight ? ON_ACCENT_SOFT : "var(--ds-surface-3)" }}
        >
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              highlight ? "opacity-70" : "text-muted"
            }`}
          >
            {isFuture ? <BellRing size={14} strokeWidth={1.75} /> : <Hourglass size={14} strokeWidth={1.75} />}
            {isFuture ? "Осталось" : "Уже прошло"}
          </span>
          <span
            className="mt-1 block text-[28px] font-bold leading-none tabular-nums"
            style={{ color: highlight ? "var(--ds-on-accent)" : "var(--rg-text)" }}
          >
            {heroValue}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetricChip
            icon={<CalendarDays size={12} strokeWidth={1.75} />}
            label="Всего"
            value={formatTotalDays(event.date)}
            onAccent={highlight}
          />
          <MetricChip
            icon={<CalendarClock size={12} strokeWidth={1.75} />}
            label="День"
            value={cap(formatWeekdayFullRu(event.date))}
            onAccent={highlight}
          />
          {anniversary && (
            <MetricChip
              icon={<Cake size={12} strokeWidth={1.75} />}
              label="Годовщина"
              value={anniversary}
              onAccent={highlight}
            />
          )}
        </div>
      </div>
    </button>
  );
}
