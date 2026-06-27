"use client";

import { useMemo } from "react";
import { Cake } from "lucide-react";
import { BirthdayCard } from "./BirthdayCard";
import { useTodayISO } from "@/components/tracking/clock";
import { daysUntilBirthday } from "@/lib/birthday";
import type { Person } from "@/db/queries/people";

function Section({
  title,
  people,
  onPersonClick,
}: {
  title: string;
  people: Person[];
  onPersonClick: (person: Person) => void;
}) {
  return (
    <section>
      <h2
        className="sticky top-0 z-30 -mx-2 mb-4 px-2 py-2 text-lg font-semibold backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent)",
          color: "var(--md-sys-color-on-surface)",
        }}
      >
        {title}
        <span className="ml-2 text-sm font-normal" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
          {people.length}
        </span>
      </h2>
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
}: {
  people: Person[];
  onPersonClick: (person: Person) => void;
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
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        <Cake size={40} strokeWidth={1.5} />
        <p className="max-w-sm">
          Пока никого нет. Добавьте близких людей — и здесь появятся их дни рождения с отсчётом и
          возрастом.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full overflow-y-auto px-6 py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          {today.length > 0 && (
            <Section title="Сегодня" people={today} onPersonClick={onPersonClick} />
          )}
          {upcoming.length > 0 && (
            <Section title="Ближайшие дни рождения" people={upcoming} onPersonClick={onPersonClick} />
          )}
        </div>
      </div>
    </div>
  );
}
