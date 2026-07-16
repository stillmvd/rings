import { TimelineStage } from "@/components/timeline/TimelineStage";
import { getEventsInRange } from "@/db/queries/events";
import { getMarksInRange } from "@/db/queries/marks";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { useQuery } from "@/lib/useQuery";

const loadTimeline = async () => {
  const [events, marks] = await Promise.all([
    getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE),
    getMarksInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE),
  ]);
  return { events, marks };
};

const noop = () => {};

export function TimelinePage() {
  const { data, error } = useQuery(loadTimeline);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!data) return null;

  return (
    <TimelineStage
      events={data.events}
      marks={data.marks}
      onCreateAt={noop}
      onEventOpen={noop}
      onMarkOpen={noop}
      onMarkMenu={noop}
    />
  );
}
