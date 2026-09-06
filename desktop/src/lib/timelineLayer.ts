import { createLocalStore } from "./localStore";

export type TimelineLayer = "events" | "periods";

export const timelineLayerStore = createLocalStore<TimelineLayer>(
  "rings.timelineLayer",
  "events",
);

export function isPeriod(event: { date: string; end_date: string | null }): boolean {
  return event.end_date != null && event.end_date > event.date;
}
