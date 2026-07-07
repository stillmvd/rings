"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, Trash2 } from "lucide-react";
import { TimelineStage } from "@/components/timeline/TimelineStage";
import { GalleryView } from "@/components/gallery/GalleryView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TrackingView } from "@/components/tracking/TrackingView";
import { BirthdaysView } from "@/components/birthdays/BirthdaysView";
import { EventSheet, type EventSheetState } from "@/components/timeline/EventSheet";
import { PersonSheet, type PersonSheetState } from "@/components/birthdays/PersonSheet";
import { SearchPanel } from "@/components/search/SearchPanel";
import { NavigationRail } from "@/components/m3/NavigationRail";
import { ConfirmDialog } from "@/components/m3/ConfirmDialog";
import { DayEventsDialog } from "@/components/timeline/DayEventsDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { ContextMenu } from "@/components/m3/ContextMenu";
import { useEventCrud } from "@/components/timeline/useEventCrud";
import { useMarkCrud } from "@/components/timeline/useMarkCrud";
import { useBirthdayCrud } from "@/components/birthdays/useBirthdayCrud";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type ViewMode } from "@/components/ui/ModeToggle";
import { listMediaAction } from "@/actions/media";
import { todayISO } from "@/lib/dates";
import { EMPTY_FILTER, isFilterActive, matchesMarkFilter, type EventFilter } from "@/lib/filter";
import type { TimelineEvent } from "@/db/queries/events";
import type { Mark } from "@/db/queries/marks";
import type { MarkType } from "@/db/queries/markTypes";
import type { CategoryNode } from "@/db/queries/categories";
import type { Person } from "@/db/queries/people";

const MODE_KEY = "timeline.viewMode";
const MODE_EVENT = "timeline:viewmode";

const isMode = (v: string | null): v is ViewMode =>
  v === "timeline" ||
  v === "gallery" ||
  v === "calendar" ||
  v === "tracking" ||
  v === "birthdays";

// Режим хранится в localStorage. useSyncExternalStore вместо useState+useEffect —
// чтобы не нарушать запрет на setState в эффекте (паттерн проекта).
const subscribe = (cb: () => void) => {
  window.addEventListener(MODE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(MODE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

const getSnapshot = (): ViewMode => {
  const v = localStorage.getItem(MODE_KEY);
  return isMode(v) ? v : "timeline";
};

const getServerSnapshot = (): ViewMode => "timeline";

function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setMode = (next: ViewMode) => {
    localStorage.setItem(MODE_KEY, next);
    window.dispatchEvent(new Event(MODE_EVENT));
  };
  return [mode, setMode];
}

export function AppShell({
  events,
  marks,
  markTypes,
  categories,
  people,
}: {
  events: TimelineEvent[];
  marks: Mark[];
  markTypes: MarkType[];
  categories: CategoryNode[];
  people: Person[];
}) {
  const [mode, setMode] = useViewMode();
  const reduceMotion = useReducedMotion();
  const { events: liveEvents, create, update, remove } = useEventCrud(events, categories);
  const { marks: liveMarks, create: createMark, remove: removeMark } = useMarkCrud(marks, markTypes);
  const {
    people: livePeople,
    create: createPerson,
    update: updatePerson,
    remove: removePerson,
  } = useBirthdayCrud(people);
  // Контекст-меню удаления отметки (ПКМ/клик по иконке отметки на оси или в календаре).
  const [markMenu, setMarkMenu] = useState<{ mark: Mark; x: number; y: number } | null>(null);
  // Единый правый SideSheet для всех сценариев формы/просмотра события.
  const [sheet, setSheet] = useState<EventSheetState | null>(null);
  // Событие, ожидающее подтверждения удаления (M3 alert dialog поверх sheet).
  const [pendingDelete, setPendingDelete] = useState<TimelineEvent | null>(null);
  // Дата открытой модалки предпросмотра «события за день» (клик по точке таймлайна).
  const [dayDate, setDayDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [personSheet, setPersonSheet] = useState<PersonSheetState | null>(null);
  const [pendingDeletePerson, setPendingDeletePerson] = useState<Person | null>(null);
  // Стейт фильтра поднят сюда — общий для всех режимов.
  const [filter, setFilter] = useState<EventFilter>(EMPTY_FILTER);
  const [searchOpen, setSearchOpen] = useState(false);
  // Выбранный в поиске результат: таймлайн центрируется и подсвечивает событие.
  const [focus, setFocus] = useState<{ event: TimelineEvent; token: number } | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // События выбранного дня: точечные с этой датой + периоды, чей интервал её покрывает.
  const dayEvents = useMemo(() => {
    if (!dayDate) return [];
    return liveEvents
      .filter(
        (e) =>
          e.date === dayDate ||
          (e.end_date != null && e.date <= dayDate && e.end_date >= dayDate),
      )
      .sort((a, b) => b.significance - a.significance || b.id - a.id);
  }, [dayDate, liveEvents]);

  // Отметки выбранного дня (одиночная дата) с учётом активного фильтра.
  const dayMarks = useMemo(() => {
    if (!dayDate) return [];
    const active = isFilterActive(filter);
    return liveMarks.filter((m) => m.date === dayDate && (!active || matchesMarkFilter(m, filter)));
  }, [dayDate, liveMarks, filter]);

  const handleSelectResult = (event: TimelineEvent) => {
    setSearchOpen(false);
    setMode("timeline");
    setFocus({ event, token: Date.now() });
    if (focusTimer.current) clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => setFocus(null), 2800);
  };

  // Горячие клавиши открытия панели поиска: "/" или Ctrl/Cmd+F.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const editable =
        t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !editable && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Грузим фото ДО открытия — форма/просмотр берут media один раз при монтировании.
  const openView = (event: TimelineEvent) => {
    listMediaAction(event.id)
      .then((media) => setSheet({ mode: "view", event, media }))
      .catch(() => setSheet({ mode: "view", event, media: [] }));
  };
  const openEdit = (event: TimelineEvent) => {
    listMediaAction(event.id)
      .then((media) => setSheet({ mode: "edit", event, media }))
      .catch(() => setSheet({ mode: "edit", event, media: [] }));
  };
  const openCreate = (dateISO: string) => setSheet({ mode: "create", dateISO });
  const startEdit = () =>
    setSheet((s) => (s && s.mode === "view" ? { mode: "edit", event: s.event, media: s.media } : s));

  const openCreatePerson = () => setPersonSheet({ mode: "create" });
  const openViewPerson = (person: Person) => setPersonSheet({ mode: "view", person });
  const startEditPerson = () =>
    setPersonSheet((s) => (s && s.mode === "view" ? { mode: "edit", person: s.person } : s));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <NavigationRail
        mode={mode}
        onMode={setMode}
        onCreate={() => (mode === "birthdays" ? openCreatePerson() : openCreate(todayISO()))}
        onSettings={() => setSettingsOpen(true)}
      />

      <main className="relative flex-1 overflow-hidden">
        {/* M3 fade through: outgoing затухает (~90ms), incoming проявляется + лёгкий зум (~210ms). */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: reduceMotion ? 0 : 0.21, ease: [0.2, 0, 0, 1] },
            }}
            exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.09, ease: [0.4, 0, 1, 1] } }}
          >
            {mode === "timeline" ? (
              <TimelineStage
                events={liveEvents}
                marks={liveMarks}
                filter={filter}
                onFilterChange={setFilter}
                focus={focus}
                onCreateAt={openCreate}
                onEventOpen={(ev) => setDayDate(ev.date)}
                onMarkOpen={(date) => setDayDate(date)}
                onMarkMenu={(mark, x, y) => setMarkMenu({ mark, x, y })}
              />
            ) : mode === "gallery" ? (
              <GalleryView
                events={liveEvents}
                filter={filter}
                onFilterChange={setFilter}
                onEventClick={openView}
              />
            ) : mode === "calendar" ? (
              <CalendarView
                events={liveEvents}
                marks={liveMarks}
                people={livePeople}
                filter={filter}
                onFilterChange={setFilter}
                onEventClick={openView}
                onCreateRequest={(dateISO) => openCreate(dateISO)}
                onDayOpen={(dateISO) => setDayDate(dateISO)}
                onMarkOpen={(date) => setDayDate(date)}
                onMarkMenu={(mark, x, y) => setMarkMenu({ mark, x, y })}
                onPersonOpen={openViewPerson}
              />
            ) : mode === "tracking" ? (
              <TrackingView events={liveEvents} onEventClick={openView} />
            ) : (
              <BirthdaysView people={livePeople} onPersonClick={openViewPerson} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
          <button
            type="button"
            aria-label="Поиск"
            title="Поиск (/)"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1/80 text-muted backdrop-blur transition-colors hover:bg-surface-2 hover:text-app-text"
          >
            <Search size={18} />
          </button>
          <ThemeToggle />
        </div>
      </main>

      <SearchPanel
        open={searchOpen}
        filter={filter}
        categories={categories}
        events={liveEvents}
        onFilterChange={setFilter}
        onSelectResult={handleSelectResult}
        onClose={() => setSearchOpen(false)}
      />

      <EventSheet
        state={sheet}
        categories={categories}
        markTypes={markTypes}
        onStartEdit={startEdit}
        onCreate={(payload) => {
          create(payload);
          setSheet(null);
        }}
        onCreateMark={(payload) => {
          createMark(payload);
          setSheet(null);
        }}
        onUpdate={(id, payload) => {
          update(id, payload);
          setSheet(null);
        }}
        onDelete={(id) => {
          const ev =
            sheet && "event" in sheet && sheet.event.id === id
              ? sheet.event
              : liveEvents.find((e) => e.id === id) ?? null;
          setPendingDelete(ev);
        }}
        onClose={() => setSheet(null)}
      />

      <PersonSheet
        state={personSheet}
        onStartEdit={startEditPerson}
        onCreate={(payload) => {
          createPerson(payload);
          setPersonSheet(null);
        }}
        onUpdate={(id, payload) => {
          updatePerson(id, payload);
          setPersonSheet(null);
        }}
        onDelete={(id) => {
          const p =
            personSheet && "person" in personSheet && personSheet.person.id === id
              ? personSheet.person
              : livePeople.find((x) => x.id === id) ?? null;
          setPendingDeletePerson(p);
        }}
        onClose={() => setPersonSheet(null)}
      />

      <DayEventsDialog
        open={dayDate !== null && (dayEvents.length > 0 || dayMarks.length > 0)}
        dateISO={dayDate}
        events={dayEvents}
        marks={dayMarks}
        onView={(ev) => {
          setDayDate(null);
          openView(ev);
        }}
        onEdit={(ev) => {
          setDayDate(null);
          openEdit(ev);
        }}
        onDelete={(ev) => setPendingDelete(ev)}
        onDeleteMark={(mark) => removeMark(mark.id)}
        onCreate={(dateISO) => {
          setDayDate(null);
          openCreate(dateISO);
        }}
        onClose={() => setDayDate(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить событие?"
        description={
          pendingDelete ? (
            <>
              «{pendingDelete.title}» будет удалено безвозвратно.
            </>
          ) : null
        }
        confirmLabel="Удалить"
        danger
        onConfirm={() => {
          if (pendingDelete) remove(pendingDelete.id);
          setPendingDelete(null);
          setSheet(null);
        }}
        onClose={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={pendingDeletePerson !== null}
        title="Удалить человека?"
        description={
          pendingDeletePerson ? (
            <>«{pendingDeletePerson.name}» будет удалён безвозвратно.</>
          ) : null
        }
        confirmLabel="Удалить"
        danger
        onConfirm={() => {
          if (pendingDeletePerson) removePerson(pendingDeletePerson.id);
          setPendingDeletePerson(null);
          setPersonSheet(null);
        }}
        onClose={() => setPendingDeletePerson(null)}
      />

      <SettingsDialog
        open={settingsOpen}
        categories={categories}
        markTypes={markTypes}
        onClose={() => setSettingsOpen(false)}
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
                  onSelect: () => removeMark(markMenu.mark.id),
                },
              ]
            : []
        }
      />
    </div>
  );
}
