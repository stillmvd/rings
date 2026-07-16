import { createElement, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { type Viewport, msToX, xToMs } from "@/lib/projection";
import { isoToMs, formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { isVisibleAtLod, getSignificanceMeta } from "@/lib/significance";
import { isFuture } from "@/lib/duration";
import { eventAccent } from "@/lib/accent";
import { onColorFor } from "@/lib/colors";
import { resolveIconOrNull } from "@/lib/icons";
import { mediaSrc } from "@/lib/paths";
import {
  EMPTY_FILTER,
  isFilterActive,
  matchesFilter,
  matchesMarkFilter,
  type EventFilter,
} from "@/lib/filter";
import { type Lod, lodRank } from "./lod";
import { EventDot } from "./EventDot";
import type { TimelineEvent } from "@/db/queries/events";
import type { Mark } from "@/db/queries/marks";

const CLUSTER_GAP_PX = 18;
const MIN_BAR_PX = 14;
const MARK_BASE_DY = 54;
const MARK_STEP_PX = 20;
const MARK_STACK_MAX = 3;
const TOOLTIP_HALF_PX = 196;
const RING_GAP = "0 0 0 2px var(--rg-bg)";
const PLUS_BG = "color-mix(in srgb, var(--rg-amber) 18%, var(--rg-surface))";

type Cluster = { x: number; events: TimelineEvent[] };
type Bar = { ev: TimelineEvent; x1: number; x2: number; tip: Cluster };

type Props = {
  events: TimelineEvent[];
  marks?: Mark[];
  viewport: Viewport;
  width: number;
  height: number;
  lod: Lod;
  filter?: EventFilter;
  highlightId?: number | null;
  onEventClick?: (event: TimelineEvent, anchor: { x: number; y: number }) => void;
  onMarkOpen?: (dateISO: string) => void;
  onMarkMenu?: (mark: Mark, x: number, y: number) => void;
};

export function EventLayer({
  events,
  marks = [],
  viewport,
  width,
  height,
  lod,
  filter = EMPTY_FILTER,
  highlightId = null,
  onEventClick,
  onMarkOpen,
  onMarkMenu,
}: Props) {
  const axisY = height / 2;
  const rank = lodRank(lod);
  const [hovered, setHovered] = useState<Cluster | null>(null);
  const filterOn = isFilterActive(filter);
  // Точки/метки по центру ячейки дня (как число на оси). На отдалении полдня ≈ 0 px.
  const cellShift = viewport.pxPerDay / 2;

  const { bars, clusters } = useMemo<{ bars: Bar[]; clusters: Cluster[] }>(() => {
    const bars: Bar[] = [];
    const points: Array<{ ev: TimelineEvent; x: number }> = [];

    for (const ev of events) {
      if (filterOn && !matchesFilter(ev, filter)) continue;
      if (!isVisibleAtLod(ev.significance, rank)) continue;
      const x1 = msToX(isoToMs(ev.date), viewport) + cellShift;
      if (ev.end_date) {
        const x2 = msToX(isoToMs(ev.end_date), viewport) + cellShift;
        if (x2 - x1 >= MIN_BAR_PX) {
          if (x2 >= -24 && x1 <= width + 24) {
            const cx = Math.min(Math.max((x1 + x2) / 2, 8), Math.max(8, width - 8));
            bars.push({ ev, x1, x2, tip: { x: cx, events: [ev] } });
          }
          continue;
        }
      }
      if (x1 >= -24 && x1 <= width + 24) points.push({ ev, x: x1 });
    }

    points.sort((a, b) => a.x - b.x);
    const out: Array<Cluster & { sumX: number }> = [];
    for (const { ev, x } of points) {
      const last = out[out.length - 1];
      if (last && x - last.x <= CLUSTER_GAP_PX) {
        last.events.push(ev);
        last.sumX += x;
        last.x = last.sumX / last.events.length;
      } else {
        out.push({ x, sumX: x, events: [ev] });
      }
    }
    return { bars, clusters: out.map(({ x, events: e }) => ({ x, events: e })) };
  }, [events, viewport, width, rank, filter, filterOn, cellShift]);

  // Отметки видны только на днях. Группируем по дню — столбиком под числом.
  const markDays = useMemo<Array<{ x: number; date: string; marks: Mark[] }>>(() => {
    if (rank < 2) return [];
    const byDay = new Map<string, Mark[]>();
    for (const m of marks) {
      if (filterOn && !matchesMarkFilter(m, filter)) continue;
      const arr = byDay.get(m.date);
      if (arr) arr.push(m);
      else byDay.set(m.date, [m]);
    }
    const out: Array<{ x: number; date: string; marks: Mark[] }> = [];
    for (const [date, ms] of byDay) {
      const x = msToX(isoToMs(date), viewport) + cellShift;
      if (x >= -24 && x <= width + 24) out.push({ x, date, marks: ms });
    }
    return out;
  }, [marks, viewport, width, rank, filter, filterOn, cellShift]);

  const emptyHint = useMemo<string | null>(() => {
    if (width <= 0) return null;
    const fromMs = xToMs(0, viewport);
    const toMs = xToMs(width, viewport);
    const considered = filterOn ? events.filter((ev) => matchesFilter(ev, filter)) : events;
    const hasInRange = considered.some((ev) => {
      const ms = isoToMs(ev.date);
      const endMs = ev.end_date ? isoToMs(ev.end_date) : ms;
      return endMs >= fromMs && ms <= toMs;
    });
    if (hasInRange) return null;
    if (filterOn) return "Ничего не найдено по фильтру в этом диапазоне.";
    return events.length === 0
      ? "Пока нет событий. Кликните по оси, чтобы добавить первое."
      : "Здесь пока пусто. Кликните по оси, чтобы добавить событие.";
  }, [events, viewport, width, filter, filterOn]);

  // Позиция подсвеченного события (результат поиска) — для пульс-кольца.
  const highlightX = useMemo<number | null>(() => {
    if (highlightId == null) return null;
    const bar = bars.find((b) => b.ev.id === highlightId);
    if (bar) return (bar.x1 + bar.x2) / 2;
    const cluster = clusters.find((c) => c.events.some((e) => e.id === highlightId));
    return cluster ? cluster.x : null;
  }, [highlightId, bars, clusters]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        {bars.map((bar) => {
          const color = eventAccent(bar.ev).fill;
          const future = isFuture(bar.ev.date);
          return (
            <motion.div
              key={`bar-${bar.ev.id}`}
              className="pointer-events-auto absolute cursor-pointer rounded-full"
              style={{
                left: bar.x1,
                top: axisY,
                y: "-50%",
                width: bar.x2 - bar.x1,
                height: 3,
                background: future
                  ? `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 11px)`
                  : color,
              }}
              initial={{ opacity: 0, scaleY: 0.4 }}
              animate={{ opacity: future ? 0.75 : 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.4 }}
              transition={{ duration: 0.18, ease: "easeOut" as const }}
              onMouseEnter={() => setHovered(bar.tip)}
              onMouseLeave={() => setHovered((h) => (h === bar.tip ? null : h))}
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
              onPointerUp={(e: React.PointerEvent) => e.stopPropagation()}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                onEventClick?.(bar.ev, { x: e.clientX, y: r.top + r.height / 2 });
              }}
            />
          );
        })}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {clusters.map((cluster) => {
          const key = cluster.events[0].id;
          const common = {
            className: "pointer-events-auto absolute cursor-pointer",
            style: { left: cluster.x, top: axisY, x: "-50%", y: "-50%" },
            initial: { opacity: 0, scale: 0.4 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.4 },
            transition: { duration: 0.18, ease: "easeOut" as const },
            onMouseEnter: () => setHovered(cluster),
            onMouseLeave: () => setHovered((h) => (h === cluster ? null : h)),
            onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
            onPointerUp: (e: React.PointerEvent) => e.stopPropagation(),
          };

          if (cluster.events.length === 1) {
            const ev = cluster.events[0];
            return (
              <motion.div
                key={key}
                {...common}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  onEventClick?.(ev, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                }}
              >
                <EventDot event={ev} />
              </motion.div>
            );
          }

          const maxSig = Math.max(...cluster.events.map((e) => e.significance));
          const meta = getSignificanceMeta(maxSig);
          const size = meta.dotRadius * 2 + 6;
          const clusterFuture = cluster.events.every((e) => isFuture(e.date));
          return (
            <motion.div
              key={key}
              {...common}
              className={`${common.className} flex items-center justify-center rounded-full text-[10px] font-semibold`}
              style={{
                ...common.style,
                width: size,
                height: size,
                background: clusterFuture
                  ? `color-mix(in srgb, ${meta.color} 30%, var(--rg-bg))`
                  : meta.color,
                color: clusterFuture ? meta.color : meta.onColor,
                border: clusterFuture ? `1.5px dashed ${meta.color}` : undefined,
                boxShadow: RING_GAP,
              }}
              animate={{ opacity: clusterFuture ? 0.8 : 1, scale: 1 }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                onEventClick?.(cluster.events[0], { x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
            >
              {cluster.events.length}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {markDays.map(({ x, date, marks: ms }) => {
        const overflow = ms.length > MARK_STACK_MAX ? ms.length - (MARK_STACK_MAX - 1) : 0;
        const shown = overflow ? ms.slice(0, MARK_STACK_MAX - 1) : ms;
        return (
          <div
            key={`markday-${date}`}
            className="pointer-events-none absolute"
            style={{ left: x, top: axisY + MARK_BASE_DY }}
          >
            {shown.map((m, i) => {
              const Icon = resolveIconOrNull(m.type_icon);
              return (
                <div
                  key={m.id}
                  className="pointer-events-auto absolute flex cursor-pointer items-center justify-center rounded-full"
                  style={{
                    top: i * MARK_STEP_PX,
                    width: 18,
                    height: 18,
                    transform: "translate(-50%, -50%)",
                    background: m.type_color,
                    color: onColorFor(m.type_color),
                    boxShadow: RING_GAP,
                  }}
                  title={`${m.type_name} · ${formatFullRu(m.date)}`}
                  onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                  onPointerUp={(e: React.PointerEvent) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkOpen?.(date);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onMarkMenu?.(m, e.clientX, e.clientY);
                  }}
                >
                  {Icon && createElement(Icon, { size: 11 })}
                </div>
              );
            })}
            {overflow > 0 && (
              <div
                className="pointer-events-auto absolute flex cursor-pointer items-center justify-center rounded-full text-[10px] font-semibold text-app-text"
                style={{
                  top: (MARK_STACK_MAX - 1) * MARK_STEP_PX,
                  width: 20,
                  height: 20,
                  transform: "translate(-50%, -50%)",
                  background: PLUS_BG,
                  boxShadow: RING_GAP,
                }}
                title={`${ms.length} отметок`}
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                onPointerUp={(e: React.PointerEvent) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkOpen?.(date);
                }}
              >
                +{overflow}
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {highlightX != null && (
          <motion.div
            key="highlight"
            className="pointer-events-none absolute z-10 rounded-full border-2 border-amber"
            style={{ left: highlightX, top: axisY, x: "-50%", y: "-50%", width: 30, height: 30 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.9, 0], scale: [0.6, 2.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" as const }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emptyHint && (
          <motion.div
            key="empty-hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute left-1/2 max-w-sm -translate-x-1/2 px-4 text-center text-sm text-muted"
            style={{ top: axisY + 36 }}
          >
            {emptyHint}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute z-20 w-max min-w-[13rem] max-w-sm -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface-1 px-3.5 py-2.5 shadow-lg"
            style={{
              left: Math.min(
                Math.max(hovered.x, TOOLTIP_HALF_PX),
                Math.max(TOOLTIP_HALF_PX, width - TOOLTIP_HALF_PX),
              ),
              top: axisY - 16,
            }}
          >
            {hovered.events.length === 1 ? (
              <>
                {hovered.events[0].cover && (
                  <img
                    src={mediaSrc(hovered.events[0].cover)}
                    alt=""
                    className="mb-1.5 h-24 w-full rounded-md object-cover"
                  />
                )}
                <div className="text-sm font-semibold text-app-text">
                  {hovered.events[0].title}
                </div>
                <div className="text-xs text-muted">
                  {hovered.events[0].end_date
                    ? `${formatDayMonthRu(hovered.events[0].date)} — ${formatFullRu(hovered.events[0].end_date)}`
                    : formatFullRu(hovered.events[0].date)}
                </div>
              </>
            ) : (
              <>
                <div className="mb-1 text-xs font-semibold text-muted">
                  {hovered.events.length} событий
                </div>
                {hovered.events.slice(0, 6).map((e) => (
                  <div key={e.id} className="truncate text-sm text-app-text">
                    <span className="text-muted">{formatDayMonthRu(e.date)}</span> {e.title}
                  </div>
                ))}
                {hovered.events.length > 6 && (
                  <div className="text-xs text-muted">…ещё {hovered.events.length - 6}</div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
