"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MS_PER_DAY,
  type Viewport,
  originForAnchor,
  xToMs,
} from "@/lib/projection";
import { isoToMs, todayISO } from "@/lib/dates";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { type Lod, baseLod, computeLod } from "./lod";

export const PX_PER_DAY_MAX = 60;
const PADDING_DAYS = 45;
const ZOOM_SENSITIVITY = 0.0015;
/** Шаг зума по клавишам +/- (эквивалент нескольких щелчков колеса). */
const ZOOM_STEP_DELTA = 240;
const STORAGE_KEY = "timeline:viewport";

const SCROLL_MIN_MS = isoToMs(TIMELINE_MIN_DATE);
const SCROLL_MAX_MS = isoToMs(TIMELINE_MAX_DATE);

type Bounds = { minMs: number; maxMs: number };
type State = { vp: Viewport; lod: Lod };

function currentBounds(): Bounds {
  return { minMs: SCROLL_MIN_MS, maxMs: SCROLL_MAX_MS };
}

function minPxPerDay(width: number, bounds: Bounds): number {
  const totalDays = (bounds.maxMs - bounds.minMs) / MS_PER_DAY + PADDING_DAYS * 2;
  if (totalDays <= 0 || width <= 0) return 0.02;
  return Math.max(0.02, width / totalDays);
}

function clampViewport(vp: Viewport, width: number, bounds: Bounds): Viewport {
  const minPpd = minPxPerDay(width, bounds);
  const pxPerDay = Math.min(PX_PER_DAY_MAX, Math.max(minPpd, vp.pxPerDay));

  const padMs = PADDING_DAYS * MS_PER_DAY;
  const spanMs = (width / pxPerDay) * MS_PER_DAY;
  const minOrigin = bounds.minMs - padMs;
  const maxOrigin = bounds.maxMs + padMs - spanMs;

  let originMs: number;
  if (minOrigin > maxOrigin) {
    originMs = (bounds.minMs + bounds.maxMs) / 2 - spanMs / 2;
  } else {
    originMs = Math.min(maxOrigin, Math.max(minOrigin, vp.originMs));
  }
  return { pxPerDay, originMs };
}

function defaultViewport(width: number, bounds: Bounds): Viewport {
  // Стартуем у «сегодня»: ~год истории, сегодня ближе к правому краю.
  const visibleDays = 365;
  const pxPerDay = width > 0 ? width / visibleDays : 1;
  const todayMs = isoToMs(todayISO());
  const originMs = todayMs - visibleDays * 0.85 * MS_PER_DAY;
  return clampViewport({ pxPerDay, originMs }, width, bounds);
}

function loadStored(): Viewport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Viewport>;
    if (typeof parsed.pxPerDay === "number" && typeof parsed.originMs === "number") {
      return { pxPerDay: parsed.pxPerDay, originMs: parsed.originMs };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Применить новый viewport: клампинг + пересчёт LOD с гистерезисом относительно prev. */
function nextState(prev: State, vp: Viewport, width: number, bounds: Bounds): State {
  const clamped = clampViewport(vp, width, bounds);
  return { vp: clamped, lod: computeLod(clamped.pxPerDay, prev.lod) };
}

export type UseViewportResult = {
  viewport: Viewport;
  lod: Lod;
  zoomAt: (offsetX: number, deltaY: number) => void;
  zoomStep: (direction: 1 | -1) => void;
  panByPixels: (dx: number) => void;
  setAnchored: (ms: number, x: number, pxPerDay: number) => void;
  centerToday: () => void;
  centerToMs: (ms: number) => void;
};

export function useViewport(width: number): UseViewportResult {
  const [state, setState] = useState<State>(() => ({
    vp: { pxPerDay: 1, originMs: SCROLL_MIN_MS },
    lod: "days",
  }));
  const initialized = useRef(false);

  useEffect(() => {
    if (width <= 0) return;
    const bounds = currentBounds();
    if (!initialized.current) {
      initialized.current = true;
      const stored = loadStored();
      const vp = clampViewport(stored ?? defaultViewport(width, bounds), width, bounds);
      setState({ vp, lod: baseLod(vp.pxPerDay) });
    } else {
      setState((prev) => nextState(prev, prev.vp, width, bounds));
    }
  }, [width]);

  useEffect(() => {
    if (!initialized.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.vp));
    } catch {
      /* ignore */
    }
  }, [state.vp]);

  const zoomAt = useCallback(
    (offsetX: number, deltaY: number) => {
      if (width <= 0) return;
      const bounds = currentBounds();
      setState((prev) => {
        const anchorMs = xToMs(offsetX, prev.vp);
        const factor = Math.exp(-deltaY * ZOOM_SENSITIVITY);
        // Клампим масштаб ДО вычисления origin: на упоре в макс/мин зум якорь
        // не должен «уезжать» — origin считается под тот же ppd, что и рендер.
        const minPpd = minPxPerDay(width, bounds);
        const nextPpd = Math.min(PX_PER_DAY_MAX, Math.max(minPpd, prev.vp.pxPerDay * factor));
        const originMs = originForAnchor(anchorMs, offsetX, nextPpd);
        return nextState(prev, { pxPerDay: nextPpd, originMs }, width, bounds);
      });
    },
    [width],
  );

  // Зум к центру экрана по клавишам: direction +1 приближает, -1 отдаляет.
  const zoomStep = useCallback(
    (direction: 1 | -1) => {
      zoomAt(width / 2, direction === 1 ? -ZOOM_STEP_DELTA : ZOOM_STEP_DELTA);
    },
    [width, zoomAt],
  );

  const panByPixels = useCallback(
    (dx: number) => {
      if (width <= 0) return;
      const bounds = currentBounds();
      setState((prev) => {
        const originMs = prev.vp.originMs - (dx / prev.vp.pxPerDay) * MS_PER_DAY;
        return nextState(prev, { ...prev.vp, originMs }, width, bounds);
      });
    },
    [width],
  );

  const setAnchored = useCallback(
    (ms: number, x: number, pxPerDay: number) => {
      if (width <= 0) return;
      const bounds = currentBounds();
      setState((prev) =>
        nextState(prev, { pxPerDay, originMs: originForAnchor(ms, x, pxPerDay) }, width, bounds),
      );
    },
    [width],
  );

  // Центрировать ось к произвольной дате (ms), сохраняя текущий масштаб.
  const centerToMs = useCallback(
    (ms: number) => {
      if (width <= 0) return;
      const bounds = currentBounds();
      setState((prev) =>
        nextState(
          prev,
          { pxPerDay: prev.vp.pxPerDay, originMs: originForAnchor(ms, width / 2, prev.vp.pxPerDay) },
          width,
          bounds,
        ),
      );
    },
    [width],
  );

  // «К сегодня»: центрируем today, сохраняя текущий масштаб.
  const centerToday = useCallback(() => {
    centerToMs(isoToMs(todayISO()));
  }, [centerToMs]);

  return {
    viewport: state.vp,
    lod: state.lod,
    zoomAt,
    zoomStep,
    panByPixels,
    setAnchored,
    centerToday,
    centerToMs,
  };
}
