import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { bumpDataVersion } from "@/lib/dataVersion";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";
import {
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  snoozeReminder,
  clearCompleted,
  type ReminderInput,
} from "@/db/queries/reminders";

type RemindersCtx = {
  addReminder: (input: ReminderInput) => Promise<boolean>;
  saveReminder: (id: number, input: ReminderInput) => Promise<boolean>;
  removeReminder: (id: number) => void;
  finishReminder: (id: number) => Promise<void>;
  postponeReminder: (id: number, untilISO: string) => Promise<void>;
  purgeCompleted: () => Promise<void>;
};

const Context = createContext<RemindersCtx | null>(null);

export function useReminders() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useReminders must be used within RemindersProvider");
  return ctx;
}

function validate(input: ReminderInput): string | null {
  if (!input.title.trim()) return "Название не может быть пустым";
  if (!isValidISODate(input.date) || input.date < TIMELINE_MIN_DATE || input.date > TIMELINE_MAX_DATE)
    return "Некорректная дата";
  if (input.time !== null && !/^\d{2}:\d{2}$/.test(input.time)) return "Некорректное время";
  return null;
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { show } = useToast();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const addReminder = useCallback(
    async (input: ReminderInput) => {
      const err = validate(input);
      if (err) {
        show(err, "error");
        return false;
      }
      await createReminder({ ...input, title: input.title.trim() });
      bumpDataVersion();
      show("Напоминание добавлено", "success");
      return true;
    },
    [show],
  );

  const saveReminder = useCallback(
    async (id: number, input: ReminderInput) => {
      const err = validate(input);
      if (err) {
        show(err, "error");
        return false;
      }
      await updateReminder(id, { ...input, title: input.title.trim() });
      bumpDataVersion();
      show("Изменения сохранены", "success");
      return true;
    },
    [show],
  );

  const removeReminder = useCallback((id: number) => setConfirmId(id), []);

  const finishReminder = useCallback(async (id: number) => {
    await completeReminder(id);
    bumpDataVersion();
  }, []);

  const postponeReminder = useCallback(async (id: number, untilISO: string) => {
    await snoozeReminder(id, untilISO);
    bumpDataVersion();
  }, []);

  const purgeCompleted = useCallback(async () => {
    await clearCompleted();
    bumpDataVersion();
  }, []);

  const doDelete = async (id: number) => {
    await deleteReminder(id);
    bumpDataVersion();
    show("Напоминание удалено", "success");
  };

  return (
    <Context.Provider
      value={{
        addReminder,
        saveReminder,
        removeReminder,
        finishReminder,
        postponeReminder,
        purgeCompleted,
      }}
    >
      {children}

      <ConfirmDialog
        open={confirmId !== null}
        message="Удалить это напоминание?"
        onConfirm={() => confirmId !== null && doDelete(confirmId)}
        onClose={() => setConfirmId(null)}
      />
    </Context.Provider>
  );
}
