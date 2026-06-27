"use client";

import { Cake, Pencil, Trash2 } from "lucide-react";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { remainingUntil } from "@/lib/duration";
import {
  nextBirthdayISO,
  daysUntilBirthday,
  formatCurrentAge,
  formatTurningAge,
} from "@/lib/birthday";
import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/m3/SideSheet";
import { PersonForm } from "./PersonForm";
import type { PersonFormPayload } from "./useBirthdayCrud";
import type { Person } from "@/db/queries/people";

export type PersonSheetState =
  | { mode: "create" }
  | { mode: "view"; person: Person }
  | { mode: "edit"; person: Person };

interface Props {
  state: PersonSheetState | null;
  onStartEdit: () => void;
  onCreate: (payload: PersonFormPayload) => void;
  onUpdate: (id: number, payload: PersonFormPayload) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function PersonSheet({ state, onStartEdit, onCreate, onUpdate, onDelete, onClose }: Props) {
  const title =
    state?.mode === "create"
      ? "Новый человек"
      : state?.mode === "edit"
        ? "Редактирование"
        : undefined;

  return (
    <SideSheet open={state !== null} onClose={onClose} title={title} width={390}>
      {state?.mode === "create" && (
        <PersonForm key="create" onSubmit={onCreate} onCancel={onClose} />
      )}

      {state?.mode === "edit" && (
        <PersonForm
          key={`edit-${state.person.id}`}
          mode="edit"
          initial={{
            name: state.person.name,
            birthDate: state.person.birth_date,
            hasYear: state.person.has_year === 1,
            photo: state.person.photo,
          }}
          onSubmit={(payload) => onUpdate(state.person.id, payload)}
          onCancel={onClose}
          onDelete={() => onDelete(state.person.id)}
        />
      )}

      {state?.mode === "view" && (
        <>
          <PersonView person={state.person} />
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button variant="danger" onClick={() => onDelete(state.person.id)}>
              <Trash2 size={16} />
              Удалить
            </Button>
            <Button variant="secondary" onClick={onStartEdit}>
              <Pencil size={16} />
              Редактировать
            </Button>
          </div>
        </>
      )}
    </SideSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--md-sys-color-on-surface-variant)]">{label}</dt>
      <dd className="font-medium text-[var(--md-sys-color-on-surface)]">{value}</dd>
    </div>
  );
}

function PersonView({ person }: { person: Person }) {
  const nb = nextBirthdayISO(person.birth_date);
  const days = daysUntilBirthday(person.birth_date);
  const age = formatCurrentAge(person.birth_date, person.has_year);
  const turning = formatTurningAge(person.birth_date, person.has_year);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="-mx-6 -mt-2 flex aspect-video w-[calc(100%+3rem)] items-center justify-center overflow-hidden"
        style={{ background: "var(--md-sys-color-tertiary-container)" }}
      >
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/media/${person.photo}`} alt="" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <Cake size={64} strokeWidth={1.25} style={{ color: "var(--md-sys-color-on-tertiary-container)" }} />
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">{person.name}</h3>
        <p className="mt-0.5 text-sm text-[var(--md-sys-color-on-surface-variant)]">
          {person.has_year ? formatFullRu(person.birth_date) : formatDayMonthRu(person.birth_date)}
        </p>
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
        {age && <Row label="Сейчас" value={age} />}
        <Row label="До дня рождения" value={days === 0 ? "Сегодня! 🎂" : remainingUntil(nb)} />
        {turning && <Row label="Исполнится" value={turning} />}
      </dl>
    </div>
  );
}
