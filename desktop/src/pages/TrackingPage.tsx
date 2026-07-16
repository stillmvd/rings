import { TrackingView } from "@/components/tracking/TrackingView";
import { getEventsInRange } from "@/db/queries/events";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { useQuery } from "@/lib/useQuery";

const loadEvents = () => getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);

export function TrackingPage() {
  const { data: events, error } = useQuery(loadEvents);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!events) return null;

  return <TrackingView events={events} onEventClick={() => {}} />;
}
