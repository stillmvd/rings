"use client";

import { createElement, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { getSignificanceMeta } from "@/lib/significance";
import { eventAccent } from "@/lib/accent";
import { resolveIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";
import { SideSheet } from "@/components/m3/SideSheet";
import { EventForm, type EventFormPayload, type EventFormValues } from "./EventForm";
import type { CategoryNode } from "@/db/queries/categories";
import type { TimelineEvent } from "@/db/queries/events";
import type { EventMedia } from "@/db/queries/media";
import type { Significance } from "@/lib/constants";

export type EventSheetState =
  | { mode: "create"; dateISO: string }
  | { mode: "view"; event: TimelineEvent; media: EventMedia[] }
  | { mode: "edit"; event: TimelineEvent; media: EventMedia[] };

export function splitCategory(
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

interface Props {
  state: EventSheetState | null;
  categories: CategoryNode[];
  onStartEdit: () => void;
  onCreate: (payload: EventFormPayload) => void;
  onUpdate: (id: number, payload: EventFormPayload) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function EventSheet({
  state,
  categories,
  onStartEdit,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: Props) {
  const [lbIndex, setLbIndex] = useState(-1);

  const close = () => {
    setLbIndex(-1);
    onClose();
  };

  const title =
    state?.mode === "create"
      ? "Новое событие"
      : state?.mode === "edit"
        ? "Редактирование"
        : undefined;

  return (
    <>
      <SideSheet open={state !== null} onClose={close} title={title} width={380}>
        {state?.mode === "create" && (
          <EventForm
            key={`create-${state.dateISO}`}
            categories={categories}
            initial={{ date: state.dateISO }}
            onSubmit={onCreate}
            onCancel={close}
          />
        )}

        {state?.mode === "edit" && (
          <EventForm
            key={`edit-${state.event.id}`}
            mode="edit"
            categories={categories}
            initialMedia={state.media}
            initial={
              {
                title: state.event.title,
                description: state.event.description ?? "",
                date: state.event.date,
                endDate: state.event.end_date,
                significance: state.event.significance as Significance,
                ...splitCategory(categories, state.event.category_id),
              } satisfies Partial<EventFormValues>
            }
            onSubmit={(payload) => onUpdate(state.event.id, payload)}
            onCancel={close}
            onDelete={() => onDelete(state.event.id)}
          />
        )}

        {state?.mode === "view" && (
          <EventView event={state.event} media={state.media} onLightbox={setLbIndex} />
        )}

        {state?.mode === "view" && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button variant="danger" onClick={() => onDelete(state.event.id)}>
              <Trash2 size={16} />
              Удалить
            </Button>
            <Button variant="secondary" onClick={onStartEdit}>
              <Pencil size={16} />
              Редактировать
            </Button>
          </div>
        )}
      </SideSheet>

      <Lightbox
        open={state?.mode === "view" && lbIndex >= 0}
        images={(state?.mode === "view" ? state.media : []).map((m) => ({
          key: `m-${m.id}`,
          src: `/media/${m.path}`,
        }))}
        index={lbIndex < 0 ? 0 : lbIndex}
        onIndexChange={setLbIndex}
        onClose={() => setLbIndex(-1)}
      />
    </>
  );
}

function EventView({
  event,
  media,
  onLightbox,
}: {
  event: TimelineEvent;
  media: EventMedia[];
  onLightbox: (i: number) => void;
}) {
  const sig = getSignificanceMeta(event.significance);
  const accent = eventAccent(event);
  const Icon = resolveIcon(event.category_icon);
  const images = media.map((m) => ({ key: `m-${m.id}`, src: `/media/${m.path}` }));
  const dateLabel = event.end_date
    ? `${formatDayMonthRu(event.date)} — ${formatFullRu(event.end_date)}`
    : formatFullRu(event.date);

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 ? (
        <button
          type="button"
          onClick={() => onLightbox(0)}
          className="-mx-6 -mt-2 block aspect-video w-[calc(100%+3rem)] overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0].src}
            alt=""
            decoding="async"
            className="h-full w-full object-cover"
          />
        </button>
      ) : (
        <div
          className="-mx-6 -mt-2 flex aspect-video w-[calc(100%+3rem)] items-center justify-center rounded-xl"
          style={{ background: accent.container }}
        >
          {createElement(Icon, {
            size: 64,
            strokeWidth: 1.25,
            style: { color: accent.onContainer, opacity: 0.85 },
          })}
        </div>
      )}

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.key}
              type="button"
              onClick={() => onLightbox(i)}
              className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--md-sys-color-outline-variant)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
          {event.title}
        </h3>
        <p className="mt-0.5 text-sm text-[var(--md-sys-color-on-surface-variant)]">{dateLabel}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: accent.fill, color: accent.onFill }}
        >
          {createElement(Icon, { size: 14 })}
          {event.category_name ?? "Без категории"}
        </span>
        <span className="text-[var(--md-sys-color-on-surface-variant)]">{sig.label}</span>
      </div>

      {event.description && (
        <p className="whitespace-pre-wrap text-sm text-[var(--md-sys-color-on-surface)]/90">
          {event.description}
        </p>
      )}
    </div>
  );
}
