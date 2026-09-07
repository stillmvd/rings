import { useCallback, useEffect, useRef } from "react";
import { animate } from "motion/react";
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
import { BIRTH_DATE } from "@/lib/constants";
import {
  eachYearStart,
  eachMonthStart,
  eachDayStart,
  eachWeekDivider,
  isJanuary,
} from "@/lib/ticks";
import { useResolvedTheme } from "@/lib/theme";
import type { Lod } from "./lod";

type GridColors = {
  line: string;
  lineStrong: string;
  text: string;
  muted: string;
  today: string;
  grayZone: string;
};

// Чтение CSS-переменных Trail: canvas реагирует на тему.
function readColors(): GridColors {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    line: v("--rg-line", "#232327"),
    lineStrong: v("--rg-muted", "#8d897e"),
    text: v("--rg-text", "#f5f1ea"),
    muted: v("--rg-muted", "#8d897e"),
    today: v("--rg-amber", "#ffb224"),
    grayZone: v("--rg-muted", "#8d897e"),
  };
}

const BIRTH_MS = isoToMs(BIRTH_DATE);
const OUT_OF_LIFE_ALPHA = 0.4;
const LOD_FADE_S = 0.26;
const AXIS_GAP_PX = 16;

type DrawCtx = {
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  axisY: number;
  fromMs: number;
  toMs: number;
  colors: GridColors;
  inLife: (ms: number) => boolean;
};

function drawTick(d: DrawCtx, ms: number, tickH: number, strong: boolean): number {
  const { ctx, viewport, axisY, colors } = d;
  const x = Math.round(msToX(ms, viewport)) + 0.5;
  ctx.strokeStyle = strong ? colors.lineStrong : colors.line;
  ctx.beginPath();
  ctx.moveTo(x, axisY - tickH);
  ctx.lineTo(x, axisY + tickH);
  ctx.stroke();
  return x;
}

function drawLodLayer(d: DrawCtx, lod: Lod, layerAlpha: number) {
  if (layerAlpha <= 0.001) return;
  const { ctx, viewport, axisY, colors, fromMs, toMs, inLife } = d;
  const alpha = (ms: number) => (inLife(ms) ? 1 : OUT_OF_LIFE_ALPHA) * layerAlpha;
  ctx.textBaseline = "middle";

  if (lod === "years") {
    ctx.font = "600 13px system-ui, sans-serif";
    const pxPerYear = viewport.pxPerDay * 365.25;
    const step = pxPerYear >= 46 ? 1 : pxPerYear >= 22 ? 5 : pxPerYear >= 11 ? 10 : pxPerYear >= 5 ? 25 : 50;
    const minorTicks = pxPerYear >= 11;
    for (const ms of eachYearStart(fromMs, toMs)) {
      const year = Number(formatYear(msToISO(ms)));
      const labeled = year % step === 0;
      if (!labeled && !minorTicks) continue;
      ctx.globalAlpha = alpha(ms);
      const x = drawTick(d, ms, labeled ? 10 : 6, labeled);
      if (labeled) {
        ctx.fillStyle = colors.text;
        ctx.textAlign = "left";
        ctx.fillText(String(year), x + 5, axisY - 26);
      }
    }
  } else if (lod === "months") {
    for (const ms of eachMonthStart(fromMs, toMs)) {
      ctx.globalAlpha = alpha(ms);
      const jan = isJanuary(ms);
      const x = drawTick(d, ms, jan ? 10 : 6, jan);
      ctx.textAlign = "left";
      if (jan) {
        ctx.font = "600 13px system-ui, sans-serif";
        ctx.fillStyle = colors.text;
        ctx.fillText(formatYear(msToISO(ms)), x + 5, axisY - 26);
      }
      ctx.font = "500 11px system-ui, sans-serif";
      ctx.fillStyle = colors.muted;
      ctx.fillText(formatMonthShortRu(msToISO(ms)), x + 4, axisY + 16);
    }
  } else {
    const ppd = viewport.pxPerDay;
    for (const ms of eachMonthStart(fromMs, toMs)) {
      ctx.globalAlpha = alpha(ms);
      const x = drawTick(d, ms, 16, true);
      const iso = msToISO(ms);
      ctx.textAlign = "left";
      ctx.font = "500 12px system-ui, sans-serif";
      ctx.fillStyle = colors.text;
      ctx.fillText(formatMonthShortRu(iso), x + 5, axisY - 20);
      if (isJanuary(ms)) {
        ctx.font = "600 13px system-ui, sans-serif";
        ctx.fillText(formatYear(iso), x + 5, axisY - 38);
      }
    }
    for (const ms of eachWeekDivider(fromMs, toMs)) {
      ctx.globalAlpha = alpha(ms);
      drawTick(d, ms, 12, true);
    }
    const showWeekday = ppd >= 22;
    for (const ms of eachDayStart(fromMs, toMs)) {
      ctx.globalAlpha = alpha(ms);
      const x = drawTick(d, ms, 5, false);
      const iso = msToISO(ms);
      ctx.textAlign = "center";
      ctx.font = "500 11px system-ui, sans-serif";
      ctx.fillStyle = colors.text;
      ctx.fillText(formatDayNum(iso), x + ppd / 2, axisY + 24);
      if (showWeekday) {
        ctx.font = "400 9px system-ui, sans-serif";
        ctx.fillStyle = colors.muted;
        ctx.fillText(formatWeekdayShortRu(iso), x + ppd / 2, axisY + 38);
      }
    }
  }
  ctx.globalAlpha = 1;
}

type Transition = { from: Lod; to: Lod; progress: number };

type Props = {
  viewport: Viewport;
  width: number;
  height: number;
  lod: Lod;
};

export function GridCanvas({ viewport, width, height, lod }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const resolvedTheme = useResolvedTheme();

  const transitionRef = useRef<Transition | null>(null);
  const prevLodRef = useRef<Lod>(lod);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const rafRef = useRef(0);
  const drawRef = useRef<() => void>(() => {});

  // Полный кадр; пересоздаётся каждый рендер, замыкая актуальные пропсы и transitionRef.
  const draw = () => {
    const canvas = ref.current;
    if (!canvas || width <= 0 || height <= 0) return;
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
    // На днях под осью числа+день недели (до ~axisY+43) — расширяем нижний разрыв вертикалей.
    const bottomGap = lod === "days" ? 58 : AXIS_GAP_PX;
    const fromMs = xToMs(0, viewport);
    const toMs = xToMs(width, viewport);

    const cellShift = viewport.pxPerDay / 2;
    const todayMs = isoToMs(todayISO());
    const birthX = msToX(BIRTH_MS, viewport) + cellShift;
    const todayX = msToX(todayMs, viewport) + cellShift;
    const inLife = (ms: number) => ms >= BIRTH_MS && ms <= todayMs;

    // Лёгкая вуаль вне «прожитой жизни» (прошлое до рождения и будущее).
    ctx.fillStyle = colors.grayZone;
    ctx.globalAlpha = 0.14;
    if (birthX > 0) ctx.fillRect(0, 0, Math.min(width, birthX), height);
    if (todayX < width) {
      const x0 = Math.max(0, todayX);
      ctx.fillRect(x0, 0, width - x0, height);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, axisY + 0.5);
    ctx.lineTo(width, axisY + 0.5);
    ctx.stroke();

    const d: DrawCtx = { ctx, viewport, axisY, fromMs, toMs, colors, inLife };
    const t = transitionRef.current;
    if (t) {
      drawLodLayer(d, t.from, 1 - t.progress);
      drawLodLayer(d, t.to, t.progress);
    } else {
      drawLodLayer(d, lod, 1);
    }

    // Отметка дня рождения — с разрывом у оси под точки.
    if (birthX >= 0 && birthX <= width) {
      const bx = Math.round(birthX) + 0.5;
      ctx.strokeStyle = colors.lineStrong;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, axisY - AXIS_GAP_PX);
      ctx.moveTo(bx, axisY + bottomGap);
      ctx.lineTo(bx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Маркер «сегодня» — amber-вертикаль с разрывом у оси.
    if (todayX >= 0 && todayX <= width) {
      const tx = Math.round(todayX) + 0.5;
      ctx.strokeStyle = colors.today;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx, axisY - AXIS_GAP_PX);
      ctx.moveTo(tx, axisY + bottomGap);
      ctx.lineTo(tx, height);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  };

  useEffect(() => {
    drawRef.current = draw;
  });

  const schedule = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawRef.current());
  }, []);

  useEffect(() => {
    schedule();
    return () => cancelAnimationFrame(rafRef.current);
  }, [viewport, width, height, resolvedTheme, schedule]);

  // Перерисовка при смене devicePixelRatio (перенос окна между мониторами).
  useEffect(() => {
    let mql: MediaQueryList | null = null;
    const onChange = () => {
      schedule();
      subscribe();
    };
    const subscribe = () => {
      const dpr = window.devicePixelRatio || 1;
      mql = window.matchMedia(`(resolution: ${dpr}dppx)`);
      mql.addEventListener("change", onChange, { once: true });
    };
    subscribe();
    return () => mql?.removeEventListener("change", onChange);
  }, [schedule]);

  // Смена LOD → кроссфейд уходящего и приходящего слоёв через motion animate.
  useEffect(() => {
    const from = prevLodRef.current;
    if (from === lod) return;
    prevLodRef.current = lod;
    controlsRef.current?.stop();
    transitionRef.current = { from, to: lod, progress: 0 };
    const controls = animate(0, 1, {
      duration: LOD_FADE_S,
      ease: "easeInOut",
      onUpdate: (p) => {
        const t = transitionRef.current;
        if (t) t.progress = p;
        schedule();
      },
      onComplete: () => {
        transitionRef.current = null;
        controlsRef.current = null;
        schedule();
      },
    });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [lod, schedule]);

  return <canvas ref={ref} className="absolute inset-0" />;
}
