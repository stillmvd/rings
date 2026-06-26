"use client";

import { useOptimistic, useTransition } from "react";
import { createEventAction, updateEventAction, deleteEventAction } from "@/actions/events";
import { uploadMediaAction, deleteMediaAction, reorderMediaAction } from "@/actions/media";
import { useToast } from "@/components/ui/Toast";
import type { TimelineEvent } from "@/db/queries/events";
import type { Category, CategoryNode } from "@/db/queries/categories";
import type { EventFormPayload } from "./EventForm";

function findCategory(cats: CategoryNode[], id: number | null): Category | null {
  if (id === null) return null;
  for (const c of cats) {
    if (c.id === id) return c;
    const sub = c.children.find((ch) => ch.id === id);
    if (sub) return sub;
  }
  return null;
}

type OptimisticAction =
  | { type: "add"; event: TimelineEvent }
  | { type: "update"; event: TimelineEvent }
  | { type: "delete"; id: number };

export function useEventCrud(events: TimelineEvent[], categories: CategoryNode[]) {
  const { show } = useToast();
  const [, startTransition] = useTransition();

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

  const buildEvent = (
    id: number,
    payload: EventFormPayload,
    cover: string | null = null,
  ): TimelineEvent => {
    const cat = findCategory(categories, payload.categoryId);
    return {
      id,
      title: payload.title,
      description: payload.description || null,
      date: payload.date,
      end_date: payload.endDate,
      significance: payload.significance,
      category_id: payload.categoryId,
      track: payload.track ? 1 : 0,
      category_name: cat?.name ?? null,
      category_icon: cat?.icon ?? null,
      category_color: cat?.color ?? null,
      cover,
    };
  };

  const actionInput = (payload: EventFormPayload) => ({
    title: payload.title,
    description: payload.description,
    date: payload.date,
    endDate: payload.endDate,
    significance: payload.significance,
    categoryId: payload.categoryId,
    track: payload.track,
  });

  const finalizeMedia = async (eventId: number, media: EventFormPayload["media"]) => {
    for (const mediaId of media.removedIds) await deleteMediaAction(eventId, mediaId);
    if (media.orderedIds.length > 0) await reorderMediaAction(eventId, media.orderedIds);
    if (media.files.length > 0) {
      const fd = new FormData();
      for (const f of media.files) fd.append("files", f);
      const res = await uploadMediaAction(eventId, fd);
      if (!res.ok) show(res.error, "error");
    }
  };

  const create = (payload: EventFormPayload) => {
    const temp = buildEvent(-Date.now(), payload);
    startTransition(async () => {
      applyOptimistic({ type: "add", event: temp });
      const res = await createEventAction(actionInput(payload));
      if (res.ok && res.id != null) await finalizeMedia(res.id, payload.media);
      show(res.ok ? "Событие создано" : res.error, res.ok ? "success" : "error");
    });
  };

  const update = (id: number, payload: EventFormPayload) => {
    const cover = optimisticEvents.find((e) => e.id === id)?.cover ?? null;
    const updated = buildEvent(id, payload, cover);
    startTransition(async () => {
      applyOptimistic({ type: "update", event: updated });
      const res = await updateEventAction(id, actionInput(payload));
      if (res.ok) await finalizeMedia(id, payload.media);
      show(res.ok ? "Изменения сохранены" : res.error, res.ok ? "success" : "error");
    });
  };

  const remove = (id: number) => {
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const res = await deleteEventAction(id);
      show(res.ok ? "Событие удалено" : res.error, res.ok ? "success" : "error");
    });
  };

  return { events: optimisticEvents, create, update, remove };
}
