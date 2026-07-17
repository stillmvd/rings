import { GalleryView } from "@/components/gallery/GalleryView";
import { getEventsInRange } from "@/db/queries/events";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { useQuery } from "@/lib/useQuery";
import { useEvents } from "@/components/events/EventsProvider";
import { filterStore } from "@/lib/search";

const loadEvents = () => getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);

export function GalleryPage() {
  const { openView } = useEvents();
  const filter = filterStore.use();
  const { data: events, error } = useQuery(loadEvents);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!events) return null;

  return (
    <GalleryView
      events={events}
      filter={filter}
      onFilterChange={filterStore.set}
      onEventClick={openView}
    />
  );
}
