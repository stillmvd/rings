import { SideSheet } from "@/components/ui/SideSheet";
import { ReminderForm, type ReminderFormValues } from "./ReminderForm";
import type { Reminder, ReminderInput } from "@/db/queries/reminders";

export type ReminderSheetState =
  | { mode: "create"; prefill?: Partial<ReminderFormValues> }
  | { mode: "edit"; reminder: Reminder };

function toFormValues(r: Reminder): Partial<ReminderFormValues> {
  return {
    title: r.title,
    note: r.note ?? "",
    date: r.date,
    time: r.time ?? "",
    repeat: r.repeat,
    repeatEvery: r.repeat_every ?? 3,
    repeatUnit: r.repeat_unit ?? "day",
    preNotifyMin: r.pre_notify_min,
    nag: r.nag === 1,
    nagIntervalMin: r.nag_interval_min ?? 30,
    icon: r.icon ?? undefined,
    color: r.color ?? undefined,
    eventId: r.event_id,
  };
}

export function ReminderSheet({
  state,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: {
  state: ReminderSheetState | null;
  onCreate: (payload: ReminderInput) => void;
  onUpdate: (id: number, payload: ReminderInput) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <SideSheet
      open={state !== null}
      onClose={onClose}
      title={state?.mode === "edit" ? "Редактирование" : "Новое напоминание"}
      width={390}
    >
      {state?.mode === "create" && (
        <ReminderForm
          key="create"
          initial={state.prefill}
          onSubmit={onCreate}
          onCancel={onClose}
        />
      )}
      {state?.mode === "edit" && (
        <ReminderForm
          key={`edit-${state.reminder.id}`}
          mode="edit"
          initial={toFormValues(state.reminder)}
          onSubmit={(payload) => onUpdate(state.reminder.id, payload)}
          onCancel={onClose}
          onDelete={() => onDelete(state.reminder.id)}
        />
      )}
    </SideSheet>
  );
}
