import type { Significance } from "@/lib/constants";
import type { TimelineEvent } from "@/db/queries/events";

export type EventFilter = {
  query: string;
  categoryIds: number[];
  significance: Significance[];
};

export const EMPTY_FILTER: EventFilter = {
  query: "",
  categoryIds: [],
  significance: [],
};

export function isFilterActive(filter: EventFilter): boolean {
  return (
    filter.query.trim() !== "" ||
    filter.categoryIds.length > 0 ||
    filter.significance.length > 0
  );
}

export function matchesFilter(event: TimelineEvent, filter: EventFilter): boolean {
  const query = filter.query.trim().toLowerCase();
  if (query) {
    const inTitle = event.title.toLowerCase().includes(query);
    const inDescription = (event.description ?? "").toLowerCase().includes(query);
    if (!inTitle && !inDescription) return false;
  }
  if (filter.categoryIds.length > 0) {
    if (event.category_id === null || !filter.categoryIds.includes(event.category_id)) {
      return false;
    }
  }
  if (filter.significance.length > 0) {
    if (!filter.significance.includes(event.significance as Significance)) return false;
  }
  return true;
}
