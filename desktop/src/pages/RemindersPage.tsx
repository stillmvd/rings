import { RemindersView } from "@/components/reminders/RemindersView";
import { listReminders } from "@/db/queries/reminders";
import { listPeople } from "@/db/queries/people";
import { useQuery } from "@/lib/useQuery";
import { usePeople } from "@/components/events/PeopleProvider";

export function RemindersPage() {
  const { openViewPerson } = usePeople();
  const { data: reminders, error } = useQuery(listReminders);
  const { data: people } = useQuery(listPeople);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!reminders || !people) return null;

  return <RemindersView reminders={reminders} people={people} onPersonClick={openViewPerson} />;
}
