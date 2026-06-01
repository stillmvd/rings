"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { GridCanvas } from "./GridCanvas";
import { StickyContext } from "./StickyContext";
import { EventLayer } from "./EventLayer";
import { EventPopover } from "./EventPopover";
import { useViewport } from "./useViewport";
import { xToMs } from "@/lib/projection";
import { msToISO } from "@/lib/dates";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { createEventAction, updateEventAction, deleteEventAction } from "@/actions/events";
import { useToast } from "@/components/ui/Toast";
import type { TimelineEvent } from "@/db/queries/events";
import type { Category, CategoryNode } from "@/db/queries/categories";
import type { PopoverAnchor } from "@/components/ui/Popover";
import type { EventFormPayload } from "./EventForm";

const CLICK_THRESHOLD_PX = 4;

function findCategory(cats: CategoryNode[], id: number | null): Category | null {
  if (id === null) return null;
  for (const c of cats) {
    if (c.id === id) return c;
    const sub = c.children.find((ch) => ch.id === id);
    if (sub) return sub;
  }
  return null;
}

export function TimelineStage({
  events,
  categories,
}: {
  events: TimelineEvent[];
  categories: CategoryNode[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { viewport, lod, zoomAt, panByPixels } = useViewport(size.width);

  type PopoverState =
    | { mode: "create"; anchor: PopoverAnchor; date: string }
    | { mode: "edit"; anchor: PopoverAnchor; event: TimelineEvent };

  const [popover, setPopover] = useState<PopoverState | null>(null);

  const { show } = useToast();
  const [, startTransition] = useTransition();

  type OptimisticAction =
    | { type: "add"; event: TimelineEvent }
    | { type: "update"; event: TimelineEvent }
    | { type: "delete"; id: number };

  const [optimisticEvents, applyOptimistic] = useOptimistic(
    events,
    (state: TimelineEvent[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [...state, action.event];
        case "update":
          return state.map((e) => (e.id === action.event.id ? action.event : e));
        case "delete":
          return state.filter((e) => e.id !== action.id);
      }
    },
  );

  const buildEvent = (id: number, payload: EventFormPayload): TimelineEvent => {
    const cat = findCategory(categories, payload.categoryId);
    return {
      id,
      title: payload.title,
      description: payload.description || null,
      date: payload.date,
      significance: payload.significance,
      category_id: payload.categoryId,
      category_name: cat?.name ?? null,
      category_icon: cat?.icon ?? null,
      category_color: cat?.color ?? null,
    };
  };

  const actionInput = (payload: EventFormPayload) => ({
    title: payload.title,
    description: payload.description,
    date: payload.date,
    significance: payload.significance,
    categoryId: payload.categoryId,
  });

  const handleCreate = (payload: EventFormPayload) => {
    setPopover(null);
    const temp = buildEvent(-Date.now(), payload);
    startTransition(async () => {
      applyOptimistic({ type: "add", event: temp });
      const res = await createEventAction(actionInput(payload));
      show(res.ok ? "Событие создано" : res.error, res.ok ? "success" : "error");
    });
  };

  const handleUpdate = (id: number, payload: EventFormPayload) => {
    setPopover(null);
    const updated = buildEvent(id, payload);
    startTransition(async () => {
      applyOptimistic({ type: "update", event: updated });
      const res = await updateEventAction(id, actionInput(payload));
      show(res.ok ? "Изменения сохранены" : res.error, res.ok ? "success" : "error");
    });
  };

  const handleDelete = (id: number) => {
    setPopover(null);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const res = await deleteEventAction(id);
      show(res.ok ? "Событие удалено" : res.error, res.ok ? "success" : "error");
    });
  };

  const handleEventClick = (event: TimelineEvent, anchor: PopoverAnchor) => {
    setPopover({ mode: "edit", anchor, event });
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
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

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
        events={optimisticEvents}
        viewport={viewport}
        width={size.width}
        height={size.height}
        lod={lod}
        onEventClick={handleEventClick}
      />
      <StickyContext viewport={viewport} width={size.width} height={size.height} lod={lod} />
      <EventPopover
        open={popover !== null}
        anchor={popover?.anchor ?? null}
        mode={popover?.mode ?? "create"}
        dateISO={popover?.mode === "create" ? popover.date : null}
        event={popover?.mode === "edit" ? popover.event : null}
        categories={categories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={() => setPopover(null)}
      />
    </div>
  );
}
