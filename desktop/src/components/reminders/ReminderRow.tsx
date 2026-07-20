import { createElement } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { resolveIconOrNull } from "@/lib/icons";
import type { Reminder } from "@/db/queries/reminders";

export function ReminderRow({
  reminder,
  dateLabel,
  completed = false,
  onToggle,
  onOpen,
}: {
  reminder: Reminder;
  dateLabel?: string;
  completed?: boolean;
  onToggle?: (id: number) => void;
  onOpen?: (reminder: Reminder) => void;
}) {
  const Icon = resolveIconOrNull(reminder.icon);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0 }}
      className="group flex items-center gap-2.5"
    >
      <button
        type="button"
        aria-label={completed ? "Выполнено" : "Отметить выполненным"}
        disabled={completed}
        onClick={() => onToggle?.(reminder.id)}
        className={`grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded-full border transition-[background-color,border-color,scale] duration-150 ease-[var(--rg-ease)] active:scale-[0.9] disabled:cursor-default ${
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
          <span className="shrink-0 text-xs text-muted">
            {[dateLabel, reminder.time].filter(Boolean).join(" · ")}
          </span>
        )}
      </button>
    </motion.li>
  );
}
