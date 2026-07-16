import { CalendarView } from "@/components/calendar/CalendarView";
import { getEventsInRange } from "@/db/queries/events";
import { getMarksInRange } from "@/db/queries/marks";
import { listPeople } from "@/db/queries/people";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";
import { useQuery } from "@/lib/useQuery";
import { useEvents } from "@/components/events/EventsProvider";

const loadCalendar = async () => {
  const [events, marks, people] = await Promise.all([
    getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE),
    getMarksInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE),
    listPeople(),
  ]);
  return { events, marks, people };
};

export function CalendarPage() {
  const { openView, openDay, openCreate } = useEvents();
  const { data, error } = useQuery(loadCalendar);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!data) return null;

  return (
    <CalendarView
      events={data.events}
      marks={data.marks}
      people={data.people}
      onEventClick={openView}
      onDayOpen={openDay}
      onCreateRequest={(iso) => openCreate(iso)}
      onMarkOpen={openDay}
      onMarkMenu={(mark) => openDay(mark.date)}
    />
  );
}
