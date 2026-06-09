"use client";

import { useEffect, useRef, useState } from "react";
import { GridCanvas } from "./GridCanvas";
import { StickyContext } from "./StickyContext";
import { EventLayer } from "./EventLayer";
import { EventPopover } from "./EventPopover";
import { TimelineControls } from "./TimelineControls";
import { useViewport } from "./useViewport";
import { xToMs } from "@/lib/projection";
import { msToISO } from "@/lib/dates";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { listMediaAction } from "@/actions/media";
import type { TimelineEvent } from "@/db/queries/events";
import type { EventMedia } from "@/db/queries/media";
import type { CategoryNode } from "@/db/queries/categories";
import type { PopoverAnchor } from "@/components/ui/Popover";
import type { EventFormPayload } from "./EventForm";

const CLICK_THRESHOLD_PX = 4;

export function TimelineStage({
  events,
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: {
  events: TimelineEvent[];
  categories: CategoryNode[];
  onCreate: (payload: EventFormPayload) => void;
  onUpdate: (id: number, payload: EventFormPayload) => void;
  onDelete: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { viewport, lod, zoomAt, zoomStep, panByPixels, centerToday } = useViewport(size.width);

  type PopoverState =
    | { mode: "create"; anchor: PopoverAnchor; date: string }
    | { mode: "edit"; anchor: PopoverAnchor; event: TimelineEvent; media: EventMedia[] };

  const [popover, setPopover] = useState<PopoverState | null>(null);

  const handleCreate = (payload: EventFormPayload) => {
    setPopover(null);
    onCreate(payload);
  };

  const handleUpdate = (id: number, payload: EventFormPayload) => {
    setPopover(null);
    onUpdate(id, payload);
  };

  const handleDelete = (id: number) => {
    setPopover(null);
    onDelete(id);
  };

  const handleEventClick = (event: TimelineEvent, anchor: PopoverAnchor) => {
    // Грузим фото ДО открытия — форма берёт initialMedia в useState-инициализаторе
    // один раз при монтировании, поэтому media должны быть готовы заранее.
    listMediaAction(event.id)
      .then((media) => setPopover({ mode: "edit", anchor, event, media }))
      .catch(() => setPopover({ mode: "edit", anchor, event, media: [] }));
  };

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

  // Drag-панорама. Захват указателя — только после превышения порога,
  // иначе capture перехватывает click по точкам и ломает открытие поповера.
  const pointerActive = useRef(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const downX = useRef(0);
  const downY = useRef(0);
  const popoverOpenAtDown = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerActive.current = true;
    dragging.current = false;
    lastX.current = e.clientX;
    downX.current = e.clientX;
    downY.current = e.clientY;
    popoverOpenAtDown.current = popover !== null;
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

    if (popoverOpenAtDown.current) {
      setPopover(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    let date = msToISO(xToMs(offsetX, viewport));
    if (date < TIMELINE_MIN_DATE) date = TIMELINE_MIN_DATE;
    if (date > TIMELINE_MAX_DATE) date = TIMELINE_MAX_DATE;

    setPopover({
      mode: "create",
      anchor: { x: e.clientX, y: rect.top + rect.height / 2 },
      date,
    });
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
        viewport={viewport}
        width={size.width}
        height={size.height}
        lod={lod}
        onEventClick={handleEventClick}
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
      <EventPopover
        open={popover !== null}
        anchor={popover?.anchor ?? null}
        mode={popover?.mode ?? "create"}
        dateISO={popover?.mode === "create" ? popover.date : null}
        event={popover?.mode === "edit" ? popover.event : null}
        media={popover?.mode === "edit" ? popover.media : []}
        categories={categories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={() => setPopover(null)}
      />
    </div>
  );
}
