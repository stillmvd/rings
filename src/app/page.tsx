import { TimelineStage } from "@/components/timeline/TimelineStage";
import { getEventsInRange } from "@/db/queries/events";
import { listCategories } from "@/db/queries/categories";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";

export default function Home() {
  const events = getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);
  const categories = listCategories();
  return (
    <main className="h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <TimelineStage events={events} categories={categories} />
    </main>
  );
}
