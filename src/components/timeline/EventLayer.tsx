"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { type Viewport, msToX, xToMs } from "@/lib/projection";
import { isoToMs, formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { isVisibleAtLod, getSignificanceMeta } from "@/lib/significance";
import { type Lod, lodRank } from "./lod";
import { EventDot } from "./EventDot";
import type { TimelineEvent } from "@/db/queries/events";

const CLUSTER_GAP_PX = 18;

type Cluster = { x: number; events: TimelineEvent[] };

type Props = {
  events: TimelineEvent[];
  viewport: Viewport;
  width: number;
  height: number;
  lod: Lod;
  onEventClick?: (event: TimelineEvent, anchor: { x: number; y: number }) => void;
};

export function EventLayer({ events, viewport, width, height, lod, onEventClick }: Props) {
  const axisY = height / 2;
  const rank = lodRank(lod);
  const [hovered, setHovered] = useState<Cluster | null>(null);

  const clusters = useMemo<Cluster[]>(() => {
    const visible = events
      .filter((ev) => isVisibleAtLod(ev.significance, rank))
      .map((ev) => ({ ev, x: msToX(isoToMs(ev.date), viewport) }))
      .filter((it) => it.x >= -24 && it.x <= width + 24)
      .sort((a, b) => a.x - b.x);

    const out: Array<Cluster & { sumX: number }> = [];
    for (const { ev, x } of visible) {
      const last = out[out.length - 1];
      if (last && x - last.x <= CLUSTER_GAP_PX) {
        last.events.push(ev);
        last.sumX += x;
        last.x = last.sumX / last.events.length;
      } else {
        out.push({ x, sumX: x, events: [ev] });
      }
    }
    return out.map(({ x, events: e }) => ({ x, events: e }));
  }, [events, viewport, width, rank]);

  // Подсказка для пустого диапазона: считаем по времени, без LOD-фильтра.
  const emptyHint = useMemo<string | null>(() => {
    if (width <= 0) return null;
    const fromMs = xToMs(0, viewport);
    const toMs = xToMs(width, viewport);
    const hasInRange = events.some((ev) => {
      const ms = isoToMs(ev.date);
      return ms >= fromMs && ms <= toMs;
    });
    if (hasInRange) return null;
    return events.length === 0
      ? "Пока нет событий. Кликните по оси, чтобы добавить первое."
      : "Здесь пока пусто. Кликните по оси, чтобы добавить событие.";
  }, [events, viewport, width]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        {clusters.map((cluster) => {
          const key = cluster.events[0].id;
          // Центрирование через motion x/y — иначе animate scale перетирает translate.
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
          return (
            <motion.div
              key={key}
              {...common}
              className={`${common.className} flex items-center justify-center rounded-full text-[10px] font-semibold`}
              style={{
                ...common.style,
                width: size,
                height: size,
                background: meta.color,
                color: "#0a0a0b",
                boxShadow: "0 0 0 2px var(--tl-surface-0)",
              }}
            >
              {cluster.events.length}
            </motion.div>
          );
        })}
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
            className="pointer-events-none absolute z-20 max-w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface-1 px-3 py-2 shadow-lg"
            style={{ left: hovered.x, top: axisY - 16 }}
          >
            {hovered.events.length === 1 ? (
              <>
                <div className="text-sm font-semibold text-app-text">
                  {hovered.events[0].title}
                </div>
                <div className="text-xs text-muted">{formatFullRu(hovered.events[0].date)}</div>
              </>
            ) : (
              <>
                <div className="mb-1 text-xs font-semibold text-muted">
                  {hovered.events.length} событий
                </div>
                {hovered.events.slice(0, 4).map((e) => (
                  <div key={e.id} className="truncate text-sm text-app-text">
                    <span className="text-muted">{formatDayMonthRu(e.date)}</span> {e.title}
                  </div>
                ))}
                {hovered.events.length > 4 && (
                  <div className="text-xs text-muted">…ещё {hovered.events.length - 4}</div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
