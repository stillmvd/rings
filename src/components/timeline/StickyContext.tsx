"use client";

import { type Viewport, xToMs } from "@/lib/projection";
import { msToISO, formatRu } from "@/lib/dates";
import type { Lod } from "./lod";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = {
  viewport: Viewport;
  width: number;
  height: number;
  lod: Lod;
};

/**
 * Контекст-метка года и месяца по центру экрана над осью — показывает период
 * под центром видимой области. На years скрыта (год и так виден на оси).
 */
export function StickyContext({ viewport, width, height, lod }: Props) {
  if (lod === "years" || width <= 0 || height <= 0) return null;

  const centerMs = xToMs(width / 2, viewport);
  const d = new Date(centerMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const monthLabel = capitalize(formatRu(msToISO(Date.UTC(year, month, 1)), "LLLL"));

  return (
    <div
      className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center gap-0.5 rounded-xl bg-surface-1/70 px-4 py-1.5 backdrop-blur-sm"
      style={{ left: "50%", top: height / 2 - 64 }}
    >
      <span className="text-lg font-semibold leading-none text-app-text">{year}</span>
      {lod === "days" && (
        <span className="text-sm font-medium leading-none text-muted">{monthLabel}</span>
      )}
    </div>
  );
}
