import { useEffect } from "react";
import { SearchPanel } from "./SearchPanel";
import { filterStore, searchOpenStore } from "@/lib/search";
import { useEvents } from "@/components/events/EventsProvider";
import { useQuery } from "@/lib/useQuery";
import { getEventsInRange, type TimelineEvent } from "@/db/queries/events";
import { listCategories } from "@/db/queries/categories";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";

const loadEvents = () => getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);

export function SearchHost() {
  const open = searchOpenStore.use();
  const filter = filterStore.use();
  const { openView } = useEvents();
  const { data: events } = useQuery(loadEvents);
  const { data: categories } = useQuery(listCategories);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const editable =
        t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyF") {
        e.preventDefault();
        searchOpenStore.set(true);
      } else if (e.code === "Slash" && !editable && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchOpenStore.set(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSelect = (event: TimelineEvent) => {
    searchOpenStore.set(false);
    openView(event);
  };

  return (
    <SearchPanel
      open={open}
      filter={filter}
      categories={categories ?? []}
      events={events ?? []}
      onFilterChange={filterStore.set}
      onSelectResult={handleSelect}
      onClose={() => searchOpenStore.set(false)}
    />
  );
}
