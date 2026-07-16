import { BirthdaysView } from "@/components/birthdays/BirthdaysView";
import { listPeople } from "@/db/queries/people";
import { useQuery } from "@/lib/useQuery";

export function BirthdaysPage() {
  const { data: people, error } = useQuery(listPeople);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm text-rust">
        Не удалось открыть базу данных: {error}
      </div>
    );
  }
  if (!people) return null;

  return <BirthdaysView people={people} onPersonClick={() => {}} />;
}
