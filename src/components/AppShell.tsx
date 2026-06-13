"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { TimelineStage } from "@/components/timeline/TimelineStage";
import { GalleryView } from "@/components/gallery/GalleryView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EventSheet, type EventSheetState } from "@/components/timeline/EventSheet";
import { SearchPanel } from "@/components/search/SearchPanel";
import { NavigationRail } from "@/components/m3/NavigationRail";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { useEventCrud } from "@/components/timeline/useEventCrud";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type ViewMode } from "@/components/ui/ModeToggle";
import { listMediaAction } from "@/actions/media";
import { todayISO } from "@/lib/dates";
import { EMPTY_FILTER, type EventFilter } from "@/lib/filter";
import type { TimelineEvent } from "@/db/queries/events";
import type { CategoryNode } from "@/db/queries/categories";

const MODE_KEY = "timeline.viewMode";
const MODE_EVENT = "timeline:viewmode";

const isMode = (v: string | null): v is ViewMode =>
  v === "timeline" || v === "gallery" || v === "calendar";

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
  categories,
}: {
  events: TimelineEvent[];
  categories: CategoryNode[];
}) {
  const [mode, setMode] = useViewMode();
  const reduceMotion = useReducedMotion();
  const { events: liveEvents, create, update, remove } = useEventCrud(events, categories);
  // Единый правый SideSheet для всех сценариев формы/просмотра события.
  const [sheet, setSheet] = useState<EventSheetState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Стейт фильтра поднят сюда — общий для всех режимов.
  const [filter, setFilter] = useState<EventFilter>(EMPTY_FILTER);
  const [searchOpen, setSearchOpen] = useState(false);
  // Выбранный в поиске результат: таймлайн центрируется и подсвечивает событие.
  const [focus, setFocus] = useState<{ event: TimelineEvent; token: number } | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <NavigationRail
        mode={mode}
        onMode={setMode}
        onCreate={() => openCreate(todayISO())}
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
                filter={filter}
                onFilterChange={setFilter}
                focus={focus}
                onCreateAt={openCreate}
                onEventEdit={openEdit}
              />
            ) : mode === "gallery" ? (
              <GalleryView
                events={liveEvents}
                filter={filter}
                onFilterChange={setFilter}
                onEventClick={openView}
              />
            ) : (
              <CalendarView
                events={liveEvents}
                filter={filter}
                onFilterChange={setFilter}
                onEventClick={openView}
                onCreateRequest={(dateISO) => openCreate(dateISO)}
              />
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
        onStartEdit={startEdit}
        onCreate={(payload) => {
          create(payload);
          setSheet(null);
        }}
        onUpdate={(id, payload) => {
          update(id, payload);
          setSheet(null);
        }}
        onDelete={(id) => {
          remove(id);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />

      <SettingsDialog
        open={settingsOpen}
        categories={categories}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
