"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { TimelineStage } from "@/components/timeline/TimelineStage";
import { GalleryView } from "@/components/gallery/GalleryView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EventDetails } from "@/components/gallery/EventDetails";
import { EventPopover } from "@/components/timeline/EventPopover";
import { SearchPanel } from "@/components/search/SearchPanel";
import { NavigationRail } from "@/components/m3/NavigationRail";
import { useEventCrud } from "@/components/timeline/useEventCrud";
import type { PopoverAnchor } from "@/components/ui/Popover";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type ViewMode } from "@/components/ui/ModeToggle";
import { listMediaAction } from "@/actions/media";
import { todayISO } from "@/lib/dates";
import { EMPTY_FILTER, type EventFilter } from "@/lib/filter";
import type { TimelineEvent } from "@/db/queries/events";
import type { EventMedia } from "@/db/queries/media";
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

type Detail = { event: TimelineEvent; media: EventMedia[]; editing: boolean };

export function AppShell({
  events,
  categories,
}: {
  events: TimelineEvent[];
  categories: CategoryNode[];
}) {
  const [mode, setMode] = useViewMode();
  const { events: liveEvents, create, update, remove } = useEventCrud(events, categories);
  const [detail, setDetail] = useState<Detail | null>(null);
  // Create-поповер: общий для FAB (дата = сегодня) и календаря (клик по пустому дню).
  // На таймлайне свой попавер внутри Stage (клик по оси).
  const [createPopover, setCreatePopover] = useState<{
    dateISO: string;
    anchor: PopoverAnchor;
  } | null>(null);
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

  // Грузим фото ДО открытия — форма редактирования берёт initialMedia один раз.
  const openDetail = (event: TimelineEvent) => {
    listMediaAction(event.id)
      .then((media) => setDetail({ event, media, editing: false }))
      .catch(() => setDetail({ event, media: [], editing: false }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <NavigationRail
        mode={mode}
        onMode={setMode}
        onCreate={(anchor) => setCreatePopover({ dateISO: todayISO(), anchor })}
      />

      <main className="relative flex-1 overflow-hidden">
        {mode === "timeline" ? (
          <TimelineStage
            events={liveEvents}
            categories={categories}
            filter={filter}
            onFilterChange={setFilter}
            focus={focus}
            onCreate={create}
            onUpdate={update}
            onDelete={remove}
          />
        ) : mode === "gallery" ? (
          <GalleryView
            events={liveEvents}
            filter={filter}
            onFilterChange={setFilter}
            onEventClick={openDetail}
          />
        ) : (
          <CalendarView
            events={liveEvents}
            filter={filter}
            onFilterChange={setFilter}
            onEventClick={openDetail}
            onCreateRequest={(dateISO, anchor) => setCreatePopover({ dateISO, anchor })}
          />
        )}

        <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
          <button
            type="button"
            aria-label="Поиск"
            title="Поиск (/)"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1/80 text-muted backdrop-blur transition-colors hover:text-app-text"
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

      <EventDetails
        open={detail !== null}
        event={detail?.event ?? null}
        media={detail?.media ?? []}
        editing={detail?.editing ?? false}
        categories={categories}
        onSetEditing={(editing) => setDetail((d) => (d ? { ...d, editing } : d))}
        onUpdate={(id, payload) => {
          update(id, payload);
          setDetail(null);
        }}
        onDelete={(id) => {
          remove(id);
          setDetail(null);
        }}
        onClose={() => setDetail(null)}
      />

      <EventPopover
        open={createPopover !== null}
        anchor={createPopover?.anchor ?? null}
        mode="create"
        dateISO={createPopover?.dateISO ?? null}
        event={null}
        media={[]}
        categories={categories}
        onCreate={(payload) => {
          create(payload);
          setCreatePopover(null);
        }}
        onUpdate={() => {}}
        onDelete={() => {}}
        onClose={() => setCreatePopover(null)}
      />
    </div>
  );
}
