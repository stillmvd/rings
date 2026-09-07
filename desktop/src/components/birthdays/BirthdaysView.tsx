import { useMemo } from "react";
import { Cake, Plus } from "lucide-react";
import { BirthdayCard } from "./BirthdayCard";
import { Button } from "@/components/ui/Button";
import { useTodayISO } from "@/components/tracking/clock";
import { daysUntilBirthday } from "@/lib/birthday";
import type { Person } from "@/db/queries/people";

function Section({
  title,
  people,
  showHeader,
  onPersonClick,
}: {
  title: string;
  people: Person[];
  showHeader: boolean;
  onPersonClick: (person: Person) => void;
}) {
  return (
    <section>
      {showHeader && (
        <div className="sticky top-0 z-30 mb-4 flex justify-center">
          <h2
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-app-text backdrop-blur"
            style={{
              background: "color-mix(in srgb, var(--rg-surface) 85%, transparent)",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.25)",
            }}
          >
            {title}
            <span
              className="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium text-app-text"
              style={{ background: "var(--ds-surface-2)" }}
            >
              {people.length}
            </span>
          </h2>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {people.map((person) => (
          <BirthdayCard key={person.id} person={person} onClick={onPersonClick} />
        ))}
      </div>
    </section>
  );
}

export function BirthdaysView({
  people,
  onPersonClick,
  onAdd,
}: {
  people: Person[];
  onPersonClick: (person: Person) => void;
  onAdd: () => void;
}) {
  // Реактивный «сегодня»: в полночь именинник сам уезжает из «Сегодня» в «Ближайшие».
  useTodayISO();
  const { today, upcoming } = useMemo(() => {
    const sorted = [...people].sort(
      (a, b) =>
        daysUntilBirthday(a.birth_date) - daysUntilBirthday(b.birth_date) || a.id - b.id,
    );
    return {
      today: sorted.filter((p) => daysUntilBirthday(p.birth_date) === 0),
      upcoming: sorted.filter((p) => daysUntilBirthday(p.birth_date) !== 0),
    };
  }, [people]);

  if (people.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-muted">
        <Cake size={40} strokeWidth={1.5} />
        <p className="max-w-sm">
          Пока никого нет. Добавьте близких людей — и здесь появятся их дни рождения с отсчётом и
          возрастом.
        </p>
        <Button onClick={onAdd}>
          <Plus size={16} strokeWidth={1.75} />
          Добавить человека
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={onAdd}
        aria-label="Добавить человека"
        className="absolute bottom-6 right-6 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-amber text-ink shadow-lg transition-transform hover:scale-105"
      >
        <Plus size={24} strokeWidth={1.75} />
      </button>
      <div className="h-full w-full overflow-y-auto px-6 py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          {today.length > 0 && (
            <Section
              title="Сегодня"
              people={today}
              showHeader={upcoming.length > 0}
              onPersonClick={onPersonClick}
            />
          )}
          {upcoming.length > 0 && (
            <Section
              title="Ближайшие дни рождения"
              people={upcoming}
              showHeader={today.length > 0}
              onPersonClick={onPersonClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
