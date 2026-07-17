import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { EventSheet, type EventSheetState } from "@/components/timeline/EventSheet";
import { DayEventsDialog } from "@/components/timeline/DayEventsDialog";
import type { EventFormPayload } from "@/components/timeline/EventForm";
import type { MarkFormPayload } from "@/components/timeline/MarkForm";
import { useQuery } from "@/lib/useQuery";
import { bumpDataVersion } from "@/lib/dataVersion";
import {
  TIMELINE_MIN_DATE,
  TIMELINE_MAX_DATE,
  isValidISODate,
} from "@/lib/constants";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsInRange,
} from "@/db/queries/events";
import { listMediaByEvent, addMedia, deleteMedia, reorderMedia } from "@/db/queries/media";
import { createMark, deleteMark, getMarksInRange } from "@/db/queries/marks";
import { listCategories } from "@/db/queries/categories";
import { listMarkTypes } from "@/db/queries/markTypes";
import { writeMediaFile, deleteMediaFile } from "@/lib/media";
import type { TimelineEvent } from "@/db/queries/events";
import type { Mark } from "@/db/queries/marks";

type DayState = { dateISO: string; events: TimelineEvent[]; marks: Mark[] };

type EventsCtx = {
  openCreate: (dateISO: string) => void;
  openView: (event: TimelineEvent) => void;
  openDay: (dateISO: string) => void;
  openMarkMenu: (mark: Mark, x: number, y: number) => void;
};

const Context = createContext<EventsCtx | null>(null);

export function useEvents() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}

function validate(p: EventFormPayload): string | null {
  if (!p.title.trim()) return "Название не может быть пустым";
  if (!isValidISODate(p.date) || p.date < TIMELINE_MIN_DATE || p.date > TIMELINE_MAX_DATE)
    return "Некорректная дата";
  if (p.endDate) {
    if (!isValidISODate(p.endDate) || p.endDate < TIMELINE_MIN_DATE || p.endDate > TIMELINE_MAX_DATE)
      return "Некорректная дата конца";
    if (p.endDate < p.date) return "Дата конца раньше даты начала";
  }
  return null;
}

const eventInput = (p: EventFormPayload) => ({
  title: p.title.trim(),
  description: p.description.trim() || null,
  date: p.date,
  endDate: p.endDate,
  significance: p.significance,
  categoryId: p.categoryId,
  track: p.track ? 1 : 0,
});

export function EventsProvider({ children }: { children: ReactNode }) {
  const { show } = useToast();
  const { data: categories } = useQuery(listCategories);
  const { data: markTypes } = useQuery(listMarkTypes);

  const [sheet, setSheet] = useState<EventSheetState | null>(null);
  const [day, setDay] = useState<DayState | null>(null);
  const [confirmEvent, setConfirmEvent] = useState<number | null>(null);
  const [markMenu, setMarkMenu] = useState<{ mark: Mark; x: number; y: number } | null>(null);

  const finalizeMedia = async (eventId: number, media: EventFormPayload["media"]) => {
    for (const mediaId of media.removedIds) {
      const path = await deleteMedia(mediaId);
      if (path) await deleteMediaFile(path);
    }
    if (media.orderedIds.length > 0) await reorderMedia(eventId, media.orderedIds);
    for (const file of media.files) {
      const rel = await writeMediaFile(file);
      await addMedia(eventId, rel);
    }
  };

  const openCreate = useCallback((dateISO: string) => {
    setDay(null);
    setSheet({ mode: "create", dateISO });
  }, []);

  const openView = useCallback(async (event: TimelineEvent) => {
    const media = await listMediaByEvent(event.id);
    setDay(null);
    setSheet({ mode: "view", event, media });
  }, []);

  const openDay = useCallback(async (dateISO: string) => {
    const [all, marks] = await Promise.all([
      getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE),
      getMarksInRange(dateISO, dateISO),
    ]);
    const events = all.filter(
      (e) =>
        e.date === dateISO ||
        (!!e.end_date && e.date <= dateISO && e.end_date >= dateISO),
    );
    setSheet(null);
    setDay({ dateISO, events, marks });
  }, []);

  const startEdit = () => {
    if (sheet?.mode === "view") setSheet({ mode: "edit", event: sheet.event, media: sheet.media });
  };

  const doCreate = async (p: EventFormPayload) => {
    const err = validate(p);
    if (err) return show(err, "error");
    setSheet(null);
    const id = await createEvent(eventInput(p));
    await finalizeMedia(id, p.media);
    bumpDataVersion();
    show("Событие создано", "success");
  };

  const doUpdate = async (id: number, p: EventFormPayload) => {
    const err = validate(p);
    if (err) return show(err, "error");
    setSheet(null);
    await updateEvent(id, eventInput(p));
    await finalizeMedia(id, p.media);
    bumpDataVersion();
    show("Изменения сохранены", "success");
  };

  const doDelete = async (id: number) => {
    setSheet(null);
    setDay(null);
    for (const m of await listMediaByEvent(id)) await deleteMediaFile(m.path);
    await deleteEvent(id);
    bumpDataVersion();
    show("Событие удалено", "success");
  };

  const doCreateMark = async (p: MarkFormPayload) => {
    setSheet(null);
    await createMark(p);
    bumpDataVersion();
    show("Отметка создана", "success");
  };

  const doDeleteMark = async (mark: Mark) => {
    setDay((d) => (d ? { ...d, marks: d.marks.filter((m) => m.id !== mark.id) } : d));
    await deleteMark(mark.id);
    bumpDataVersion();
    show("Отметка удалена", "success");
  };

  const openMarkMenu = useCallback((mark: Mark, x: number, y: number) => {
    setMarkMenu({ mark, x, y });
  }, []);

  return (
    <Context.Provider value={{ openCreate, openView, openDay, openMarkMenu }}>
      {children}

      <EventSheet
        state={sheet}
        categories={categories ?? []}
        markTypes={markTypes ?? []}
        onStartEdit={startEdit}
        onCreate={doCreate}
        onCreateMark={doCreateMark}
        onUpdate={doUpdate}
        onDelete={(id) => setConfirmEvent(id)}
        onClose={() => setSheet(null)}
      />

      <DayEventsDialog
        open={day !== null}
        dateISO={day?.dateISO ?? null}
        events={day?.events ?? []}
        marks={day?.marks ?? []}
        onView={openView}
        onEdit={(e) => listMediaByEvent(e.id).then((media) => setSheet({ mode: "edit", event: e, media }))}
        onDelete={(e) => setConfirmEvent(e.id)}
        onDeleteMark={doDeleteMark}
        onCreate={openCreate}
        onClose={() => setDay(null)}
      />

      <ConfirmDialog
        open={confirmEvent !== null}
        message="Удалить это событие? Действие необратимо."
        onConfirm={() => confirmEvent !== null && doDelete(confirmEvent)}
        onClose={() => setConfirmEvent(null)}
      />

      <ContextMenu
        open={markMenu !== null}
        x={markMenu?.x ?? 0}
        y={markMenu?.y ?? 0}
        onClose={() => setMarkMenu(null)}
        items={
          markMenu
            ? [
                {
                  label: "Удалить отметку",
                  icon: <Trash2 size={16} />,
                  danger: true,
                  onSelect: () => doDeleteMark(markMenu.mark),
                },
              ]
            : []
        }
      />
    </Context.Provider>
  );
}
