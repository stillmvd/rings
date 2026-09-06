import { useState } from "react";
import { Plus } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { useReminders } from "@/components/events/RemindersProvider";
import { todayISO } from "@/lib/dates";

export function QuickAdd() {
  const { addReminder } = useReminders();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState("");

  const submit = async () => {
    if (!title.trim()) return;
    const ok = await addReminder({
      title,
      note: null,
      date,
      time: time || null,
      repeat: "none",
      repeatEvery: null,
      repeatUnit: null,
      preNotifyMin: 0,
      nag: 0,
      nagIntervalMin: null,
      icon: null,
      color: null,
      eventId: null,
    });
    if (ok) {
      setTitle("");
      setTime("");
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-surface-1 p-2 pl-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.3),0_1px_3px_1px_rgba(0,0,0,0.15)]">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Новое напоминание…"
        aria-label="Новое напоминание"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-muted"
      />
      <div className="w-44 shrink-0">
        <DatePicker value={date} onChange={setDate} />
      </div>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        aria-label="Время"
        className="h-9 shrink-0 rounded-lg border border-line bg-surface-0 px-2 text-sm tabular-nums text-app-text outline-none transition-colors focus:border-amber"
      />
      <button
        type="button"
        aria-label="Добавить"
        onClick={submit}
        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-amber text-ink transition-[scale,filter] duration-150 ease-[var(--rg-ease)] hover:brightness-105 active:scale-[0.96]"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
