import { useCallback } from "react";
import { RemindersView } from "@/components/reminders/RemindersView";
import { listReminders } from "@/db/queries/reminders";
import { listPeople } from "@/db/queries/people";
import { getEvent } from "@/db/queries/events";
import { useQuery } from "@/lib/useQuery";
import { usePeople } from "@/components/events/PeopleProvider";
import { useEvents } from "@/components/events/EventsProvider";

export function RemindersPage() {
  const { openViewPerson } = usePeople();
  const { openView } = useEvents();
  const { data: reminders, error } = useQuery(listReminders);
  const { data: people } = useQuery(listPeople);

  const jumpToEvent = useCallback(
    async (eventId: number) => {
      const event = await getEvent(eventId);
      if (event) openView(event);
    },
    [openView],
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!reminders || !people) return null;

  return (
    <RemindersView
      reminders={reminders}
      people={people}
      onPersonClick={openViewPerson}
      onEventJump={jumpToEvent}
    />
  );
}
