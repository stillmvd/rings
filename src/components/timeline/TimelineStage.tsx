"use client";

import { useEffect, useRef, useState } from "react";
import { GridCanvas } from "./GridCanvas";
import { StickyContext } from "./StickyContext";
import { EventLayer } from "./EventLayer";
import { TimelineControls } from "./TimelineControls";
import { useViewport } from "./useViewport";
import { xToMs } from "@/lib/projection";
import { msToISO, isoToMs } from "@/lib/dates";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import type { TimelineEvent } from "@/db/queries/events";
import type { Mark } from "@/db/queries/marks";
import type { EventFilter } from "@/lib/filter";

const CLICK_THRESHOLD_PX = 4;

export function TimelineStage({
  events,
  marks,
  filter,
  focus,
  onCreateAt,
  onEventOpen,
  onMarkOpen,
  onMarkMenu,
}: {
  events: TimelineEvent[];
  marks: Mark[];
  filter?: EventFilter;
  onFilterChange?: (filter: EventFilter) => void;
  focus?: { event: TimelineEvent; token: number } | null;
  onCreateAt: (dateISO: string) => void;
  onEventOpen: (event: TimelineEvent) => void;
  onMarkOpen: (dateISO: string) => void;
  onMarkMenu: (mark: Mark, x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { viewport, lod, zoomAt, zoomStep, panByPixels, centerToday, centerToMs } = useViewport(
    size.width,
  );

  // Клик по точке/кластеру открывает модалку предпросмотра событий дня (AppShell).
  const handleEventClick = (event: TimelineEvent) => onEventOpen(event);

  // Размеры контейнера.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Зум колесом (non-passive, чтобы блокировать прокрутку страницы).
  // Ctrl+колесо — точный зум (пониженная чувствительность).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const delta = e.ctrlKey ? e.deltaY * 0.3 : e.deltaY;
      zoomAt(e.clientX - rect.left, delta);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // Горячие клавиши: +/- зум к центру, Home — к сегодня.
  // Игнорируем при вводе в форму поповера и системные шорткаты (Ctrl/Meta/Alt).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "Home") {
        e.preventDefault();
        centerToday();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomStep(1);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomStep(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomStep, centerToday]);

  // Центрирование оси к событию, выбранному в результатах поиска.
  useEffect(() => {
    if (focus && size.width > 0) centerToMs(isoToMs(focus.event.date));
  }, [focus, centerToMs, size.width]);

  // Drag-панорама. Захват указателя — только после превышения порога,
  // иначе capture перехватывает click по точкам и ломает открытие поповера.
  const pointerActive = useRef(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const downX = useRef(0);
  const downY = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerActive.current = true;
    dragging.current = false;
    lastX.current = e.clientX;
    downX.current = e.clientX;
    downY.current = e.clientY;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current) return;
    if (!dragging.current) {
      const moved =
        Math.abs(e.clientX - downX.current) > CLICK_THRESHOLD_PX ||
        Math.abs(e.clientY - downY.current) > CLICK_THRESHOLD_PX;
      if (!moved) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.cursor = "grabbing";
    }
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    panByPixels(dx);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current) return;
    const wasDragging = dragging.current;
    pointerActive.current = false;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    e.currentTarget.style.cursor = "grab";
    if (wasDragging || size.width <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    let date = msToISO(xToMs(offsetX, viewport));
    if (date < TIMELINE_MIN_DATE) date = TIMELINE_MIN_DATE;
    if (date > TIMELINE_MAX_DATE) date = TIMELINE_MAX_DATE;

    onCreateAt(date);
  };

  const onPointerCancel = () => {
    pointerActive.current = false;
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none overflow-hidden"
      style={{ cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <GridCanvas viewport={viewport} width={size.width} height={size.height} lod={lod} />
      <EventLayer
        events={events}
        marks={marks}
        viewport={viewport}
        width={size.width}
        height={size.height}
        lod={lod}
        filter={filter}
        highlightId={focus?.event.id ?? null}
        onEventClick={handleEventClick}
        onMarkOpen={onMarkOpen}
        onMarkMenu={onMarkMenu}
      />
      <StickyContext viewport={viewport} width={size.width} height={size.height} lod={lod} />
      <TimelineControls
        viewport={viewport}
        lod={lod}
        containerRef={containerRef}
        onZoomIn={() => zoomStep(1)}
        onZoomOut={() => zoomStep(-1)}
        onToday={centerToday}
      />
    </div>
  );
}
