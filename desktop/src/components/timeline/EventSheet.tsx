import { createElement, useState } from "react";
import { Bell, Pencil, Trash2 } from "lucide-react";
import { useReminders } from "@/components/events/RemindersProvider";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { getSignificanceMeta } from "@/lib/significance";
import { eventAccent } from "@/lib/accent";
import { resolveIconOrNull } from "@/lib/icons";
import { mediaSrc } from "@/lib/paths";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SignificanceIcon } from "@/components/ui/SignificanceIcon";
import { Lightbox } from "@/components/ui/Lightbox";
import { SideSheet } from "@/components/ui/SideSheet";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { CoverPlaceholder } from "@/components/ui/CoverPlaceholder";
import { EventForm, type EventFormPayload, type EventFormValues } from "./EventForm";
import { MarkForm, type MarkFormPayload } from "./MarkForm";
import type { CategoryNode } from "@/db/queries/categories";
import type { MarkType } from "@/db/queries/markTypes";
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
  markTypes: MarkType[];
  onStartEdit: () => void;
  onCreate: (payload: EventFormPayload) => void;
  onCreateMark: (payload: MarkFormPayload) => void;
  onUpdate: (id: number, payload: EventFormPayload) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function EventSheet({
  state,
  categories,
  markTypes,
  onStartEdit,
  onCreate,
  onCreateMark,
  onUpdate,
  onDelete,
  onClose,
}: Props) {
  const [lbIndex, setLbIndex] = useState(-1);
  const [createKind, setCreateKind] = useState<"event" | "mark">("event");
  const { openCreateReminder } = useReminders();

  const close = () => {
    setLbIndex(-1);
    onClose();
  };

  const title =
    state?.mode === "create"
      ? createKind === "mark"
        ? "Новая отметка"
        : "Новое событие"
      : state?.mode === "edit"
        ? "Редактирование"
        : undefined;

  return (
    <>
      <SideSheet open={state !== null} onClose={close} title={title} width={390}>
        {state?.mode === "create" && (
          <div className="flex min-h-full flex-col gap-3.5">
            <SegmentedControl
              segments={[
                { value: "event", label: "Событие" },
                { value: "mark", label: "Отметка" },
              ]}
              value={createKind}
              onChange={setCreateKind}
            />
            {createKind === "event" ? (
              <EventForm
                key={`create-${state.dateISO}`}
                categories={categories}
                initial={{ date: state.dateISO }}
                onSubmit={onCreate}
                onCancel={close}
              />
            ) : (
              <MarkForm
                key={`mark-${state.dateISO}`}
                markTypes={markTypes}
                initialDate={state.dateISO}
                onSubmit={onCreateMark}
                onCancel={close}
              />
            )}
          </div>
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
                track: state.event.track === 1,
                ...splitCategory(categories, state.event.category_id),
              } satisfies Partial<EventFormValues>
            }
            onSubmit={(payload) => onUpdate(state.event.id, payload)}
            onCancel={close}
            onDelete={() => onDelete(state.event.id)}
          />
        )}

        {state?.mode === "view" && (
          <div className="flex min-h-full flex-col">
            <EventView event={state.event} media={state.media} onLightbox={setLbIndex} />
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <Button variant="danger" onClick={() => onDelete(state.event.id)}>
                <Trash2 size={16} strokeWidth={1.75} />
                Удалить
              </Button>
              <div className="flex items-center gap-2">
                <IconButton
                  label="Напомнить об этом событии"
                  onClick={() => {
                    close();
                    openCreateReminder({
                      title: state.event.title,
                      date: state.event.date,
                      eventId: state.event.id,
                    });
                  }}
                >
                  <Bell size={17} strokeWidth={1.75} />
                </IconButton>
                <Button variant="secondary" onClick={onStartEdit}>
                  <Pencil size={16} strokeWidth={1.75} />
                  Редактировать
                </Button>
              </div>
            </div>
          </div>
        )}
      </SideSheet>

      <Lightbox
        open={state?.mode === "view" && lbIndex >= 0}
        images={(state?.mode === "view" ? state.media : []).map((m) => ({
          key: `m-${m.id}`,
          src: mediaSrc(m.path),
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
  const Icon = resolveIconOrNull(event.category_icon);
  const images = media.map((m) => ({ key: `m-${m.id}`, src: mediaSrc(m.path) }));
  const dateLabel = event.end_date
    ? `${formatDayMonthRu(event.date)} ↔ ${formatFullRu(event.end_date)}`
    : formatFullRu(event.date);

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 ? (
        <button
          type="button"
          onClick={() => onLightbox(0)}
          className="-mx-6 -mt-2 block aspect-video w-[calc(100%+3rem)] cursor-pointer overflow-hidden"
        >
          <img src={images[0].src} alt="" decoding="async" className="h-full w-full object-cover" />
        </button>
      ) : (
        <div className="-mx-6 -mt-2 aspect-video w-[calc(100%+3rem)] overflow-hidden">
          <CoverPlaceholder fill={accent.fill} icon={event.category_icon} />
        </div>
      )}

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.key}
              type="button"
              onClick={() => onLightbox(i)}
              className="h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line"
            >
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
        <h3 className="text-xl font-bold text-app-text">{event.title}</h3>
        <p className="mt-0.5 text-sm text-muted">{dateLabel}</p>
      </div>

      <div className="flex flex-col items-start gap-2 text-sm">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={
            event.category_name
              ? { background: accent.fill, color: accent.onFill }
              : { background: "var(--ds-surface-2)", color: "var(--rg-muted)" }
          }
        >
          {Icon && createElement(Icon, { size: 14 })}
          {event.category_name ?? "Без категории"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <SignificanceIcon level={event.significance as Significance} size={15} />
          {sig.label}
        </span>
      </div>

      {event.description && (
        <p className="whitespace-pre-wrap text-sm text-app-text/90">{event.description}</p>
      )}
    </div>
  );
}
