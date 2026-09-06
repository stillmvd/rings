import { type Viewport, msToX, MS_PER_DAY } from "@/lib/projection";
import { isoToMs } from "@/lib/dates";
import { isPeriod } from "@/lib/timelineLayer";
import type { TimelineEvent } from "@/db/queries/events";

export type PeriodPlacement = {
  ev: TimelineEvent;
  ms1: number;
  ms2: number;
  lane: number;
  depth: number;
  side: -1 | 1;
};

export type PeriodPlan = {
  placements: PeriodPlacement[];
  maxDepth: number;
};

export type PeriodBar = PeriodPlacement & { x1: number; x2: number };

export type PeriodLayout = {
  bars: PeriodBar[];
  barHeight: number;
  step: number;
};

const MIN_BAR_PX = 6;
const OFF_SCREEN_PX = 24;
const LANE_GAP_MS = MS_PER_DAY;
const V_GAP_PX = 6;
const MIN_BAR_HEIGHT = 2;

const H_MIN = 3;
const H_MAX = 22;
const PPD_MIN = 0.6;
const PPD_MAX = 30;

const LOG_MIN = Math.log(PPD_MIN);
const LOG_SPAN = Math.log(PPD_MAX) - LOG_MIN;

// Толщина полосы растёт с зумом логарифмически: 3px на «годах» → 14px на «днях».
export function barHeightFor(pxPerDay: number): number {
  const t = (Math.log(Math.max(pxPerDay, 0.001)) - LOG_MIN) / LOG_SPAN;
  return Math.round(H_MIN + Math.min(1, Math.max(0, t)) * (H_MAX - H_MIN));
}

// Дорожки считаются по датам и по всем периодам сразу — при зуме и панораме они не меняются.
export function planPeriods(events: TimelineEvent[]): PeriodPlan {
  const items = events
    .filter(isPeriod)
    .map((ev) => ({ ev, ms1: isoToMs(ev.date), ms2: isoToMs(ev.end_date as string) }));

  // Длинные периоды укладываются первыми — они оседают на дорожках у самой оси.
  items.sort(
    (a, b) => b.ms2 - b.ms1 - (a.ms2 - a.ms1) || a.ms1 - b.ms1 || a.ev.id - b.ev.id,
  );

  const lanes: Array<Array<[number, number]>> = [];
  const placements: PeriodPlacement[] = [];

  for (const { ev, ms1, ms2 } of items) {
    let lane = lanes.findIndex((spans) =>
      spans.every(([s1, s2]) => ms1 > s2 + LANE_GAP_MS || ms2 + LANE_GAP_MS < s1),
    );
    if (lane === -1) {
      lane = lanes.length;
      lanes.push([[ms1, ms2]]);
    } else {
      lanes[lane].push([ms1, ms2]);
    }
    placements.push({
      ev,
      ms1,
      ms2,
      lane,
      depth: Math.floor(lane / 2) + 1,
      side: lane % 2 === 0 ? -1 : 1,
    });
  }

  return { placements, maxDepth: lanes.length > 0 ? Math.floor((lanes.length - 1) / 2) + 1 : 1 };
}

export function layoutPeriods(
  plan: PeriodPlan,
  viewport: Viewport,
  width: number,
  availableHalfPx: number,
): PeriodLayout {
  const cellShift = viewport.pxPerDay / 2;
  const bars: PeriodBar[] = [];

  for (const p of plan.placements) {
    const x1 = msToX(p.ms1, viewport) + cellShift;
    const x2 = Math.max(msToX(p.ms2, viewport) + cellShift, x1 + MIN_BAR_PX);
    if (x2 < -OFF_SCREEN_PX || x1 > width + OFF_SCREEN_PX) continue;
    bars.push({ ...p, x1, x2 });
  }

  let barHeight = barHeightFor(viewport.pxPerDay);
  let step = barHeight + V_GAP_PX;

  if (availableHalfPx > 0 && plan.maxDepth * step > availableHalfPx) {
    step = availableHalfPx / plan.maxDepth;
    barHeight = Math.max(MIN_BAR_HEIGHT, Math.min(barHeight, Math.floor(step - V_GAP_PX)));
  }

  return { bars, barHeight, step };
}

export const barOffsetY = (bar: PeriodPlacement, step: number): number =>
  bar.side * bar.depth * step;
