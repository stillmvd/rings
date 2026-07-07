"use client";

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
import { SignificanceIcon } from "@/components/ui/SignificanceIcon";
import { CoverPlaceholder } from "@/components/ui/CoverPlaceholder";
import type { TimelineEvent } from "@/db/queries/events";
import type { Significance } from "@/lib/constants";

const ELEVATION_1 =
  "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent), 0 1px 3px 1px color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent)";
const ELEVATION_2 =
  "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent), 0 2px 6px 2px color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent)";

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
      style={{ background: "var(--md-sys-color-surface-container-high)" }}
    >
      <span
        className="flex items-center gap-1 text-xs"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        {icon}
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--md-sys-color-on-surface)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function TrackingCard({
  event,
  variant,
  onClick,
}: {
  event: TimelineEvent;
  variant: "past" | "future";
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

  const heroBg = isFuture ? "var(--md-sys-color-tertiary-container)" : accent.container;
  const heroColor = isFuture ? "var(--md-sys-color-on-tertiary-container)" : accent.onContainer;

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="group relative flex flex-col overflow-hidden rounded-[16px] text-left transition-shadow duration-200"
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

      <div className="relative aspect-video w-full overflow-hidden">
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
          <CoverPlaceholder
            icon={Icon}
            fill={accent.fill}
            container={accent.container}
            onContainer={accent.onContainer}
            iconSize={56}
          />
        )}
        {event.category_name && (
          <span
            className="absolute left-3 top-3 z-10 inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              background: accent.fill,
              color: accent.onFill,
              boxShadow:
                "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent)",
            }}
            title={event.category_name}
          >
            {Icon && createElement(Icon, { size: 13 })}
            {event.category_name}
          </span>
        )}

        <span
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur"
          style={{
            background: "color-mix(in srgb, var(--md-sys-color-surface-container-high) 85%, transparent)",
            color: "var(--md-sys-color-on-surface)",
            boxShadow:
              "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent)",
          }}
        >
          <SignificanceIcon level={event.significance as Significance} size={14} />
          {sig.label}
        </span>

        {isFuture && (
          <span
            className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              background: "var(--md-sys-color-tertiary)",
              color: "var(--md-sys-color-on-tertiary)",
            }}
          >
            <BellRing size={13} />
            Напоминание
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3
            className="truncate text-xl font-semibold"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            {event.title}
          </h3>
          <p className="mt-0.5 text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            {formatFullRu(event.date)}
          </p>
        </div>

        <div className="rounded-2xl px-4 py-3" style={{ background: heroBg, color: heroColor }}>
          <span className="flex items-center gap-1.5 text-xs font-medium opacity-80">
            {isFuture ? <BellRing size={14} /> : <Hourglass size={14} />}
            {isFuture ? "Осталось" : "Уже прошло"}
          </span>
          <span className="mt-0.5 block text-2xl font-bold leading-tight tabular-nums">
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
            icon={<CalendarDays size={13} />}
            label="Всего дней"
            value={formatTotalDays(event.date)}
          />
          <Metric
            icon={<CalendarClock size={13} />}
            label="День недели"
            value={cap(formatWeekdayFullRu(event.date))}
          />
          {anniversary && (
            <Metric icon={<Cake size={13} />} label="Годовщина" value={anniversary} wide />
          )}
        </div>
      </div>
    </button>
  );
}
