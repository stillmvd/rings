"use client";

import { type Viewport, msToX, xToMs } from "@/lib/projection";
import { msToISO, formatRu } from "@/lib/dates";
import type { Lod } from "./lod";

const YEAR_H = 26;
const MONTH_H = 20;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Блок sticky-метки с push-эффектом: текущий период закреплён слева, при подходе
 * границы следующего периода (boundaryX < высоты блока) текущий выталкивается вверх.
 */
function StickyBlock({
  height,
  current,
  next,
  boundaryX,
  bold,
}: {
  height: number;
  current: string;
  next: string;
  boundaryX: number;
  bold: boolean;
}) {
  const push = boundaryX < height ? height - Math.max(0, boundaryX) : 0;
  const cls = bold
    ? "text-app-text text-base font-semibold leading-none"
    : "text-muted text-sm font-medium leading-none";
  return (
    <div style={{ height, overflow: "hidden", position: "relative" }}>
      <div style={{ transform: `translateY(${-push}px)` }}>
        <div className={cls} style={{ height, display: "flex", alignItems: "center" }}>
          {current}
        </div>
        <div className={cls} style={{ height, display: "flex", alignItems: "center" }}>
          {next}
        </div>
      </div>
    </div>
  );
}

type Props = {
  viewport: Viewport;
  lod: Lod;
};

export function StickyContext({ viewport, lod }: Props) {
  if (lod === "years") return null;

  const edgeMs = xToMs(0, viewport);
  const d = new Date(edgeMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();

  // Год.
  const nextYearMs = Date.UTC(year + 1, 0, 1);
  const yearBoundaryX = msToX(nextYearMs, viewport);

  // Месяц (только на days).
  const monthLabel = capitalize(formatRu(msToISO(Date.UTC(year, month, 1)), "LLLL"));
  const nextMonthMs = Date.UTC(year, month + 1, 1);
  const nextMonthLabel = capitalize(formatRu(msToISO(nextMonthMs), "LLLL"));
  const monthBoundaryX = msToX(nextMonthMs, viewport);

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-xl bg-surface-1/80 px-3 py-2 backdrop-blur-sm">
      <StickyBlock
        height={YEAR_H}
        current={String(year)}
        next={String(year + 1)}
        boundaryX={yearBoundaryX}
        bold
      />
      {lod === "days" && (
        <StickyBlock
          height={MONTH_H}
          current={monthLabel}
          next={nextMonthLabel}
          boundaryX={monthBoundaryX}
          bold={false}
        />
      )}
    </div>
  );
}
