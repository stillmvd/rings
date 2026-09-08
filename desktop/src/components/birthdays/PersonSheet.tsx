import { Cake, CalendarClock, CalendarHeart, Gift, Hourglass, Pencil, Trash2 } from "lucide-react";
import { formatFullRu, formatDayMonthRu, formatWeekdayFullRu } from "@/lib/dates";
import { remainingUntil } from "@/lib/duration";
import {
  nextBirthdayISO,
  daysUntilBirthday,
  formatCurrentAge,
  formatTurningAge,
} from "@/lib/birthday";
import { mediaSrc } from "@/lib/paths";
import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import { MetricChip } from "@/components/ui/MetricChip";
import { PersonForm, type PersonFormPayload } from "./PersonForm";
import type { Person } from "@/db/queries/people";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

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
    <SideSheet open={state !== null} onClose={onClose} title={title}>
      {state?.mode === "create" && <PersonForm key="create" onSubmit={onCreate} onCancel={onClose} />}

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
        <div className="flex min-h-full flex-col">
          <PersonView person={state.person} />
          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <Button variant="danger" onClick={() => onDelete(state.person.id)}>
              <Trash2 size={16} strokeWidth={1.75} />
              Удалить
            </Button>
            <Button variant="secondary" onClick={onStartEdit}>
              <Pencil size={16} strokeWidth={1.75} />
              Редактировать
            </Button>
          </div>
        </div>
      )}
    </SideSheet>
  );
}

function PersonView({ person }: { person: Person }) {
  const nb = nextBirthdayISO(person.birth_date);
  const days = daysUntilBirthday(person.birth_date);
  const today = days === 0;
  const age = formatCurrentAge(person.birth_date, person.has_year);
  const turning = formatTurningAge(person.birth_date, person.has_year);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl"
        style={{ background: "var(--ds-surface-2)" }}
      >
        {person.photo ? (
          <img
            src={mediaSrc(person.photo)}
            alt=""
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <Cake size={64} strokeWidth={1.25} style={{ color: "var(--ds-accent-ink)" }} />
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-app-text">
          {person.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          {person.has_year
            ? formatFullRu(person.birth_date)
            : cap(formatDayMonthRu(person.birth_date))}
        </p>
      </div>

      <div className="rounded-3xl px-5 py-4" style={{ background: "var(--ds-surface-3)" }}>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <Gift size={14} strokeWidth={1.75} />
          {today ? "День рождения" : "До дня рождения"}
        </span>
        <span className="mt-1 block text-[28px] font-bold leading-none tabular-nums text-app-text">
          {today ? "Сегодня! 🎂" : remainingUntil(nb)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {age && (
          <MetricChip
            icon={<Hourglass size={12} strokeWidth={1.75} />}
            label="Сейчас"
            value={age}
          />
        )}
        {turning && (
          <MetricChip icon={<Cake size={12} strokeWidth={1.75} />} label="Исполнится" value={turning} />
        )}
        <MetricChip
          icon={<CalendarHeart size={12} strokeWidth={1.75} />}
          label="Дата"
          value={cap(formatDayMonthRu(nb))}
        />
        <MetricChip
          icon={<CalendarClock size={12} strokeWidth={1.75} />}
          label="День"
          value={cap(formatWeekdayFullRu(nb))}
        />
      </div>
    </div>
  );
}
