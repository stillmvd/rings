"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { TimelineStage } from "@/components/timeline/TimelineStage";
import { GalleryView } from "@/components/gallery/GalleryView";
import { EventDetails } from "@/components/gallery/EventDetails";
import { useEventCrud } from "@/components/timeline/useEventCrud";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ModeToggle, type ViewMode } from "@/components/ui/ModeToggle";
import { listMediaAction } from "@/actions/media";
import type { TimelineEvent } from "@/db/queries/events";
import type { EventMedia } from "@/db/queries/media";
import type { CategoryNode } from "@/db/queries/categories";

const MODE_KEY = "timeline.viewMode";
const MODE_EVENT = "timeline:viewmode";

const isMode = (v: string | null): v is ViewMode => v === "timeline" || v === "gallery";

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

  // Грузим фото ДО открытия — форма редактирования берёт initialMedia один раз.
  const openDetail = (event: TimelineEvent) => {
    listMediaAction(event.id)
      .then((media) => setDetail({ event, media, editing: false }))
      .catch(() => setDetail({ event, media: [], editing: false }));
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      {mode === "timeline" ? (
        <TimelineStage
          events={liveEvents}
          categories={categories}
          onCreate={create}
          onUpdate={update}
          onDelete={remove}
        />
      ) : (
        <GalleryView events={liveEvents} onEventClick={openDetail} />
      )}

      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <ModeToggle value={mode} onChange={setMode} />
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Настройки"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1/80 text-muted backdrop-blur transition-colors hover:text-app-text"
        >
          <Settings size={18} />
        </Link>
      </div>

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
    </main>
  );
}
