import { createElement } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { resolveIconOrNull } from "@/lib/icons";
import type { Reminder } from "@/db/queries/reminders";

export function ReminderRow({
  reminder,
  dateLabel,
  completed = false,
  onAccent = false,
  onToggle,
  onOpen,
  onMenu,
  onEventJump,
}: {
  reminder: Reminder;
  dateLabel?: string;
  completed?: boolean;
  onAccent?: boolean;
  onToggle?: (id: number) => void;
  onOpen?: (reminder: Reminder) => void;
  onMenu?: (reminder: Reminder, x: number, y: number) => void;
  onEventJump?: (eventId: number) => void;
}) {
  const Icon = resolveIconOrNull(reminder.icon);

  const box = onAccent
    ? "border-[color-mix(in_srgb,var(--ds-on-accent)_35%,transparent)] text-transparent hover:border-ink hover:text-ink"
    : "border-line text-transparent hover:border-[var(--ds-accent-ink)] hover:text-[var(--ds-accent-ink)]";
  const done = onAccent ? "border-ink bg-ink text-amber" : "border-amber bg-amber text-ink";

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0 }}
      className="group relative flex items-center gap-1.5"
    >
      <button
        type="button"
        aria-label={completed ? "Выполнено" : "Отметить выполненным"}
        disabled={completed}
        onClick={() => onToggle?.(reminder.id)}
        className={`relative grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-[background-color,border-color,color,scale] duration-150 ease-[var(--rg-ease)] active:scale-[0.96] disabled:cursor-default ${
          completed ? done : box
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={() => onOpen?.(reminder)}
        onContextMenu={(e) => {
          if (!onMenu) return;
          e.preventDefault();
          onMenu(reminder, e.clientX, e.clientY);
        }}
        className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-full px-2.5 py-2.5 text-left transition-colors ${
          onAccent
            ? "hover:bg-[color-mix(in_srgb,var(--ds-on-accent)_10%,transparent)]"
            : "hover:bg-surface-2"
        }`}
      >
        <span
          className={`min-w-0 flex-1 truncate text-[15px] ${
            completed
              ? "text-muted line-through"
              : onAccent
                ? "font-medium text-ink"
                : "text-app-text"
          }`}
        >
          {reminder.title}
        </span>
        {(dateLabel || reminder.time) && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
              onAccent
                ? "bg-[color-mix(in_srgb,var(--ds-on-accent)_12%,transparent)] text-ink"
                : "text-muted"
            }`}
          >
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
          className={`grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full opacity-0 transition-[opacity,color,background-color] duration-150 group-hover:opacity-100 ${
            onAccent
              ? "bg-ink text-amber hover:brightness-125"
              : "bg-surface-2 text-app-text hover:bg-surface-3"
          }`}
        >
          <ArrowUpRight size={15} strokeWidth={1.75} />
        </button>
      )}

      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-8 z-30 mb-1.5 flex max-w-[280px] translate-y-1 items-center gap-2 rounded-2xl bg-surface-3 px-3.5 py-2 text-[13px] text-app-text opacity-0 shadow-lg transition-[opacity,transform] delay-0 duration-150 ease-[var(--rg-ease)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-500"
      >
        {Icon &&
          createElement(Icon, {
            size: 15,
            color: reminder.color ?? undefined,
            className: "shrink-0",
          })}
        <span className="min-w-0">{reminder.title}</span>
      </span>
    </motion.li>
  );
}
