"use client";

import { createElement, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, Trash2, X } from "lucide-react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { getSignificanceMeta } from "@/lib/significance";
import { resolveIcon } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { Lightbox } from "@/components/ui/Lightbox";
import {
  EventForm,
  type EventFormPayload,
  type EventFormValues,
} from "@/components/timeline/EventForm";
import { splitCategory } from "@/components/timeline/EventPopover";
import type { TimelineEvent } from "@/db/queries/events";
import type { EventMedia } from "@/db/queries/media";
import type { CategoryNode } from "@/db/queries/categories";
import type { Significance } from "@/lib/constants";

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

interface Props {
  open: boolean;
  event: TimelineEvent | null;
  media: EventMedia[];
  editing: boolean;
  categories: CategoryNode[];
  onSetEditing: (editing: boolean) => void;
  onUpdate: (id: number, payload: EventFormPayload) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function EventDetails({
  open,
  event,
  media,
  editing,
  categories,
  onSetEditing,
  onUpdate,
  onDelete,
  onClose,
}: Props) {
  const mounted = useMounted();
  const [lbIndex, setLbIndex] = useState(-1);

  // Закрытие/переключение режимов всегда гасит lightbox — без эффекта на смену события.
  const close = () => {
    setLbIndex(-1);
    onClose();
  };
  const startEdit = () => {
    setLbIndex(-1);
    onSetEditing(true);
  };
  const submitUpdate = (id: number, payload: EventFormPayload) => {
    setLbIndex(-1);
    onUpdate(id, payload);
  };
  const submitDelete = (id: number) => {
    setLbIndex(-1);
    onDelete(id);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  const sig = event ? getSignificanceMeta(event.significance) : null;
  const accent = event ? (event.category_color ?? sig!.color) : "#000";
  const Icon = resolveIcon(event?.category_icon);
  const images = media.map((m) => ({ key: `m-${m.id}`, src: `/media/${m.path}` }));
  const dateLabel = event
    ? event.end_date
      ? `${formatDayMonthRu(event.date)} — ${formatFullRu(event.end_date)}`
      : formatFullRu(event.date)
    : "";

  return createPortal(
    <>
      <AnimatePresence>
        {open && event && (
          <motion.div
            key="details-overlay"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={close}
          >
            <motion.div
              key="details-card"
              className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface-1 shadow-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Закрыть"
                onClick={close}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
              >
                <X size={18} />
              </button>

              {editing ? (
                <div className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-app-text">Редактирование</h3>
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
                    onSubmit={(payload) => submitUpdate(event.id, payload)}
                    onCancel={() => onSetEditing(false)}
                    onDelete={() => submitDelete(event.id)}
                  />
                </div>
              ) : (
                <>
                  {images.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setLbIndex(0)}
                      className="block aspect-video w-full overflow-hidden"
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
                      className="flex aspect-video w-full items-center justify-center"
                      style={{ background: accent }}
                    >
                      {createElement(Icon, {
                        size: 72,
                        strokeWidth: 1.25,
                        className: "text-white/70",
                      })}
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto px-5 pt-3">
                      {images.map((img, i) => (
                        <button
                          key={img.key}
                          type="button"
                          onClick={() => setLbIndex(i)}
                          className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line"
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

                  <div className="flex flex-col gap-3 p-5">
                    <div>
                      <h2 className="text-xl font-semibold text-app-text">{event.title}</h2>
                      <p className="mt-0.5 text-sm text-muted">{dateLabel}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white"
                        style={{ background: accent }}
                      >
                        {createElement(Icon, { size: 14 })}
                        {event.category_name ?? "Без категории"}
                      </span>
                      <span className="text-muted">{sig!.label}</span>
                    </div>

                    {event.description && (
                      <p className="whitespace-pre-wrap text-sm text-app-text/90">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <Button variant="danger" onClick={() => submitDelete(event.id)}>
                        <Trash2 size={16} />
                        Удалить
                      </Button>
                      <Button variant="secondary" onClick={startEdit}>
                        <Pencil size={16} />
                        Редактировать
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Lightbox
        open={open && !editing && lbIndex >= 0}
        images={images}
        index={lbIndex < 0 ? 0 : lbIndex}
        onIndexChange={setLbIndex}
        onClose={() => setLbIndex(-1)}
      />
    </>,
    document.body,
  );
}
