import { TimelineStage } from "@/components/timeline/TimelineStage";
import { getEventsInRange } from "@/db/queries/events";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";

export default function Home() {
  const events = getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);
  return (
    <main className="h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <TimelineStage events={events} />
    </main>
  );
}
