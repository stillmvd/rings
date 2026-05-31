"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { type Viewport, msToX, xToMs } from "@/lib/projection";
import {
  msToISO,
  isoToMs,
  todayISO,
  formatYear,
  formatMonthShortRu,
  formatDayNum,
  formatWeekdayShortRu,
} from "@/lib/dates";
import { MIN_DATE } from "@/lib/constants";
import {
  eachYearStart,
  eachMonthStart,
  eachDayStart,
  eachWeekDivider,
  isJanuary,
} from "@/lib/ticks";
import type { Lod } from "./lod";

type GridColors = {
  line: string;
  lineStrong: string;
  text: string;
  muted: string;
  accent: string;
  grayZone: string;
};

function readColors(): GridColors {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    line: v("--tl-line", "#2a2a30"),
    lineStrong: v("--tl-surface-4", "#34343b"),
    text: v("--tl-text", "#f5f5f7"),
    muted: v("--tl-text-muted", "#8a8a93"),
    accent: v("--tl-accent-500", "#6366f1"),
    grayZone: v("--tl-surface-2", "#1c1c20"),
  };
}

const MIN_MS = isoToMs(MIN_DATE);

type Props = {
  viewport: Viewport;
  width: number;
  height: number;
  lod: Lod;
};

export function GridCanvas({ viewport, width, height, lod }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);

    function draw() {
      if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const colors = readColors();
    const axisY = Math.round(height / 2);
    const fromMs = xToMs(0, viewport);
    const toMs = xToMs(width, viewport);

    // Серая недоступная зона до даты рождения (18.03.2002).
    const minX = msToX(MIN_MS, viewport);
    if (minX > 0) {
      ctx.fillStyle = colors.grayZone;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(0, 0, Math.min(width, minX), height);
      ctx.globalAlpha = 1;
      // граница зоны
      const bx = Math.round(minX) + 0.5;
      ctx.strokeStyle = colors.lineStrong;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, height);
      ctx.stroke();
    }

    // Центральная ось.
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, axisY + 0.5);
    ctx.lineTo(width, axisY + 0.5);
    ctx.stroke();

    ctx.textBaseline = "middle";

    const drawTick = (ms: number, tickH: number, strong: boolean) => {
      const x = Math.round(msToX(ms, viewport)) + 0.5;
      ctx.strokeStyle = strong ? colors.lineStrong : colors.line;
      ctx.beginPath();
      ctx.moveTo(x, axisY - tickH);
      ctx.lineTo(x, axisY + tickH);
      ctx.stroke();
      return x;
    };

    if (lod === "years") {
      ctx.font = "600 13px system-ui, sans-serif";
      for (const ms of eachYearStart(fromMs, toMs)) {
        const x = drawTick(ms, 10, true);
        ctx.fillStyle = colors.text;
        ctx.textAlign = "left";
        ctx.fillText(formatYear(msToISO(ms)), x + 5, axisY - 18);
      }
    } else if (lod === "months") {
      for (const ms of eachMonthStart(fromMs, toMs)) {
        const jan = isJanuary(ms);
        const x = drawTick(ms, jan ? 10 : 6, jan);
        ctx.textAlign = "left";
        if (jan) {
          ctx.font = "600 13px system-ui, sans-serif";
          ctx.fillStyle = colors.text;
          ctx.fillText(formatYear(msToISO(ms)), x + 5, axisY - 18);
        }
        ctx.font = "500 11px system-ui, sans-serif";
        ctx.fillStyle = colors.muted;
        ctx.fillText(formatMonthShortRu(msToISO(ms)), x + 4, axisY + 16);
      }
    } else {
      // days/weeks
      const ppd = viewport.pxPerDay;
      // недельные делители — заметные линии
      for (const ms of eachWeekDivider(fromMs, toMs)) {
        drawTick(ms, 12, true);
      }
      // дни — число + день недели (если помещается)
      const showWeekday = ppd >= 22;
      for (const ms of eachDayStart(fromMs, toMs)) {
        const x = drawTick(ms, 5, false);
        const iso = msToISO(ms);
        ctx.textAlign = "center";
        ctx.font = "500 11px system-ui, sans-serif";
        ctx.fillStyle = colors.text;
        ctx.fillText(formatDayNum(iso), x + ppd / 2, axisY + 16);
        if (showWeekday) {
          ctx.font = "400 9px system-ui, sans-serif";
          ctx.fillStyle = colors.muted;
          ctx.fillText(formatWeekdayShortRu(iso), x + ppd / 2, axisY + 30);
        }
      }
    }

    // Маркер «сегодня» — акцентная вертикаль (правая граница доступного времени).
    const todayMs = isoToMs(todayISO());
    const todayX = msToX(todayMs, viewport);
    if (todayX >= 0 && todayX <= width) {
      const tx = Math.round(todayX) + 0.5;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx, height);
      ctx.stroke();
      ctx.lineWidth = 1;
      // точка-маркер на оси
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(tx, axisY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    }
  }, [viewport, width, height, lod, resolvedTheme]);

  return <canvas ref={ref} className="absolute inset-0" />;
}
