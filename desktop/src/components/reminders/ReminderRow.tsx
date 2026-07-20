import { createElement } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { resolveIconOrNull } from "@/lib/icons";
import type { Reminder } from "@/db/queries/reminders";

export function ReminderRow({
  reminder,
  dateLabel,
  completed = false,
  onToggle,
  onOpen,
  onMenu,
  onEventJump,
}: {
  reminder: Reminder;
  dateLabel?: string;
  completed?: boolean;
  onToggle?: (id: number) => void;
  onOpen?: (reminder: Reminder) => void;
  onMenu?: (reminder: Reminder, x: number, y: number) => void;
  onEventJump?: (eventId: number) => void;
}) {
  const Icon = resolveIconOrNull(reminder.icon);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0 }}
      className="group flex items-center gap-2.5"
    >
      <button
        type="button"
        aria-label={completed ? "Выполнено" : "Отметить выполненным"}
        disabled={completed}
        onClick={() => onToggle?.(reminder.id)}
        className={`relative grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded-full border transition-[background-color,border-color,scale] duration-150 ease-[var(--rg-ease)] after:absolute after:-inset-x-2 after:-inset-y-1.5 active:scale-[0.96] disabled:cursor-default ${
          completed
            ? "border-amber bg-amber text-ink"
            : "border-line text-transparent hover:border-amber hover:text-amber"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={() => onOpen?.(reminder)}
        onContextMenu={(e) => {
          if (!onMenu) return;
          e.preventDefault();
          onMenu(reminder, e.clientX, e.clientY);
        }}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-0"
      >
        {Icon &&
          createElement(Icon, {
            size: 15,
            color: reminder.color ?? undefined,
            className: "shrink-0",
          })}
        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            completed ? "text-muted line-through" : "text-app-text"
          }`}
        >
          {reminder.title}
        </span>
        {(dateLabel || reminder.time) && (
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {[dateLabel, reminder.time].filter(Boolean).join(" · ")}
          </span>
        )}
      </button>
      {reminder.event_id !== null && onEventJump && (
        <button
          type="button"
          aria-label="Открыть связанное событие"
          title="Открыть связанное событие"
          onClick={() => onEventJump(reminder.event_id!)}
          className="relative grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted opacity-0 transition-[opacity,color,background-color] duration-150 after:absolute after:-inset-x-1.5 after:-inset-y-1 hover:bg-surface-0 hover:text-app-text group-hover:opacity-100"
        >
          <ArrowUpRight size={14} />
        </button>
      )}
    </motion.li>
  );
}
