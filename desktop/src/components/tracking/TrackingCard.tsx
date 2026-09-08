import { createElement, type ReactNode } from "react";
import { CalendarDays, CalendarClock, Cake, Hourglass, BellRing } from "lucide-react";
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
import type { TimelineEvent } from "@/db/queries/events";
import type { Significance } from "@/lib/constants";

const ELEVATION_1 = "var(--ds-shadow-1)";
const ELEVATION_2 = "var(--ds-shadow-2)";
const METRIC_BG = "var(--ds-surface-2)";
const HERO_BG = "var(--ds-surface-3)";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function Metric({
  icon,
  label,
  value,
  wide,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 ${wide ? "col-span-2" : ""}`}
      style={{ background: METRIC_BG }}
    >
      <span className="flex items-center gap-1 text-xs text-muted">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium tabular-nums text-app-text">{value}</span>
    </div>
  );
}

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



  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-surface-1 text-left text-app-text transition-[box-shadow,scale] duration-200 ease-[var(--rg-ease)] active:scale-[0.96]"
      style={{ boxShadow: ELEVATION_1 }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = ELEVATION_2)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = ELEVATION_1)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-app-text opacity-0 transition-opacity duration-200 group-hover:opacity-[0.08]"
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
          <CoverPlaceholder fill={accent.fill} icon={event.category_icon} />
        )}
        {event.category_name && (
          <span
            className="absolute left-3 top-3 z-10 inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-medium"
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
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-app-text backdrop-blur"
          style={{
            background: "color-mix(in srgb, var(--rg-surface) 85%, transparent)",
            boxShadow: "var(--ds-shadow-1)",
          }}
        >
          <SignificanceIcon level={event.significance as Significance} size={14} />
          {sig.label}
        </span>

        {isFuture && (
          <span
            className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: "var(--rg-amber)", color: "var(--rg-bg)" }}
          >
            <BellRing size={13} strokeWidth={1.75} />
            Напоминание
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-xl font-bold text-app-text">{event.title}</h3>
          <p className="mt-0.5 text-sm text-muted">{formatFullRu(event.date)}</p>
        </div>

        <div className="rounded-2xl px-4 py-3" style={{ background: HERO_BG, color: "var(--rg-text)" }}>
          <span className="flex items-center gap-1.5 text-xs font-medium opacity-80">
            {isFuture ? <BellRing size={14} strokeWidth={1.75} /> : <Hourglass size={14} strokeWidth={1.75} />}
            {isFuture ? "Осталось" : "Уже прошло"}
          </span>
          <span
            className="mt-0.5 block text-2xl font-bold leading-tight tabular-nums"
            style={{ color: highlight ? "var(--ds-accent-ink)" : "var(--rg-text)" }}
          >
            {countdown
              ? countdown.done
                ? "Наступило"
                : formatCountdown(countdown)
              : isFuture
                ? remainingUntil(event.date)
                : elapsedSince(event.date)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric
            icon={<CalendarDays size={13} strokeWidth={1.75} />}
            label="Всего дней"
            value={formatTotalDays(event.date)}
          />
          <Metric
            icon={<CalendarClock size={13} strokeWidth={1.75} />}
            label="День недели"
            value={cap(formatWeekdayFullRu(event.date))}
          />
          {anniversary && (
            <Metric icon={<Cake size={13} strokeWidth={1.75} />} label="Годовщина" value={anniversary} wide />
          )}
        </div>
      </div>
    </button>
  );
}
