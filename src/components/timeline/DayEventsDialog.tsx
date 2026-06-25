"use client";

import { createElement, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, Trash2, MoveHorizontal, Plus, X } from "lucide-react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { getSignificanceMeta } from "@/lib/significance";
import { eventAccent } from "@/lib/accent";
import { resolveIconOrNull } from "@/lib/icons";
import { Button } from "@/components/ui/Button";
import { ContextMenu } from "@/components/m3/ContextMenu";
import type { TimelineEvent } from "@/db/queries/events";

interface DayEventsDialogProps {
  open: boolean;
  dateISO: string | null;
  events: TimelineEvent[];
  onView: (event: TimelineEvent) => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (event: TimelineEvent) => void;
  onCreate: (dateISO: string) => void;
  onClose: () => void;
}

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const isPeriod = (e: TimelineEvent) => !!e.end_date && e.end_date > e.date;

const dateLabel = (e: TimelineEvent) =>
  e.end_date ? `${formatDayMonthRu(e.date)} — ${formatFullRu(e.end_date)}` : formatFullRu(e.date);

// M3 dialog: предпросмотр всех событий календарного дня. ЛКМ — просмотр, ПКМ — контекстное меню.
export function DayEventsDialog({
  open,
  dateISO,
  events,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onClose,
}: DayEventsDialogProps) {
  const mounted = useMounted();
  const [menu, setMenu] = useState<{ event: TimelineEvent; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[86] flex items-center justify-center p-4"
          style={{ background: "color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-[28px] shadow-2xl"
            style={{
              background: "var(--md-sys-color-surface-container-high)",
              color: "var(--md-sys-color-on-surface)",
            }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.18 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 px-6 pb-3 pt-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
                  {dateISO ? formatFullRu(dateISO) : "События"}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  {events.length} {plural(events.length)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)] hover:text-[var(--md-sys-color-on-surface)]"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={() => onView(event)}
                  onContextMenu={(x, y) => setMenu({ event, x, y })}
                />
              ))}
            </div>

            <div className="flex shrink-0 justify-end px-6 pb-5 pt-3">
              <Button variant="secondary" onClick={() => dateISO && onCreate(dateISO)}>
                <Plus size={16} />
                Добавить событие
              </Button>
            </div>
          </motion.div>

          <ContextMenu
            open={menu !== null}
            x={menu?.x ?? 0}
            y={menu?.y ?? 0}
            onClose={() => setMenu(null)}
            items={
              menu
                ? [
                    {
                      label: "Редактировать",
                      icon: <Pencil size={16} />,
                      onSelect: () => onEdit(menu.event),
                    },
                    {
                      label: "Удалить",
                      icon: <Trash2 size={16} />,
                      danger: true,
                      onSelect: () => onDelete(menu.event),
                    },
                  ]
                : []
            }
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function EventCard({
  event,
  onView,
  onContextMenu,
}: {
  event: TimelineEvent;
  onView: () => void;
  onContextMenu: (x: number, y: number) => void;
}) {
  const accent = eventAccent(event);
  const sig = getSignificanceMeta(event.significance);
  const Icon = resolveIconOrNull(event.category_icon);

  return (
    <button
      type="button"
      onClick={onView}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e.clientX, e.clientY);
      }}
      className="flex items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_6%,transparent)]"
    >
      {event.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/media/${event.cover}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span
          className="grid h-16 w-16 shrink-0 place-items-center rounded-xl"
          style={{ background: accent.container, color: accent.onContainer }}
        >
          {Icon && createElement(Icon, { size: 26, strokeWidth: 1.5 })}
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-[var(--md-sys-color-on-surface)]">
          {event.title}
        </span>
        <span className="flex items-center gap-1.5 truncate text-xs text-[var(--md-sys-color-on-surface-variant)]">
          {isPeriod(event) && <MoveHorizontal size={12} className="shrink-0" />}
          {dateLabel(event)}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: accent.fill, color: accent.onFill }}
          >
            {Icon && createElement(Icon, { size: 11 })}
            {event.category_name ?? "Без категории"}
          </span>
          <span className="text-[var(--md-sys-color-on-surface-variant)]">{sig.label}</span>
        </span>
      </span>
    </button>
  );
}

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "событие";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "события";
  return "событий";
}
