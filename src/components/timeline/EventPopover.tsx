"use client";

import type { CategoryNode } from "@/db/queries/categories";
import type { TimelineEvent } from "@/db/queries/events";
import type { EventMedia } from "@/db/queries/media";
import { Popover, type PopoverAnchor } from "@/components/ui/Popover";
import {
  EventForm,
  type EventFormPayload,
  type EventFormValues,
} from "./EventForm";
import type { Significance } from "@/lib/constants";

interface EventPopoverProps {
  open: boolean;
  anchor: PopoverAnchor | null;
  mode: "create" | "edit";
  dateISO: string | null;
  event: TimelineEvent | null;
  media: EventMedia[];
  categories: CategoryNode[];
  onCreate: (payload: EventFormPayload) => void;
  onUpdate: (id: number, payload: EventFormPayload) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

function splitCategory(
  cats: CategoryNode[],
  catId: number | null,
): { categoryId: number | null; subcategoryId: number | null } {
  if (catId === null) return { categoryId: null, subcategoryId: null };
  for (const c of cats) {
    if (c.id === catId) return { categoryId: c.id, subcategoryId: null };
    const sub = c.children.find((ch) => ch.id === catId);
    if (sub) return { categoryId: c.id, subcategoryId: sub.id };
  }
  return { categoryId: null, subcategoryId: null };
}

export function EventPopover({
  open,
  anchor,
  mode,
  dateISO,
  event,
  media,
  categories,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: EventPopoverProps) {
  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={490}>
      {mode === "create" && dateISO && (
        <>
          <h3 className="mb-3 text-sm font-semibold text-app-text">Новое событие</h3>
          <EventForm
            key={`create-${dateISO}`}
            categories={categories}
            initial={{ date: dateISO }}
            onSubmit={onCreate}
            onCancel={onClose}
          />
        </>
      )}

      {mode === "edit" && event && (
        <>
          <h3 className="mb-3 text-sm font-semibold text-app-text">Событие</h3>
          <EventForm
            key={`edit-${event.id}`}
            mode="edit"
            categories={categories}
            initialMedia={media}
            initial={
              {
                title: event.title,
                description: event.description ?? "",
                date: event.date,
                endDate: event.end_date,
                significance: event.significance as Significance,
                ...splitCategory(categories, event.category_id),
              } satisfies Partial<EventFormValues>
            }
            onSubmit={(payload) => onUpdate(event.id, payload)}
            onCancel={onClose}
            onDelete={() => onDelete(event.id)}
          />
        </>
      )}
    </Popover>
  );
}
