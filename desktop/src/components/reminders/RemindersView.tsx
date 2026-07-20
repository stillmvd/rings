import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClock, Bell, Cake, ChevronRight, Moon, Sunset, Trash2 } from "lucide-react";
import { addDays, parseISO } from "date-fns";
import {
  toISO,
  formatRu,
  formatDayMonthRu,
  formatWeekdayShortRu,
  formatWeekdayFullRu,
} from "@/lib/dates";
import {
  effectiveDateISO,
  snoozePlusHour,
  snoozeEvening,
  snoozeTomorrow,
} from "@/lib/reminders";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { isBirthdayToday, formatTurningAge } from "@/lib/birthday";
import { useTodayISO } from "@/components/tracking/clock";
import { useReminders } from "@/components/events/RemindersProvider";
import { QuickAdd } from "./QuickAdd";
import { ReminderRow } from "./ReminderRow";
import type { Reminder } from "@/db/queries/reminders";
import type { Person } from "@/db/queries/people";

const CARD_SHADOW = "shadow-[0_1px_2px_0_rgba(0,0,0,0.3),0_1px_3px_1px_rgba(0,0,0,0.15)]";

const appear = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, duration: 0.4, bounce: 0, delay: i * 0.06 },
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl bg-surface-1 p-5 ${CARD_SHADOW}`}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Rows({
  items,
  dateLabelFor,
  onToggle,
  onOpen,
  onMenu,
  onEventJump,
}: {
  items: Reminder[];
  dateLabelFor?: (r: Reminder) => string | undefined;
  onToggle: (id: number) => void;
  onOpen?: (r: Reminder) => void;
  onMenu?: (r: Reminder, x: number, y: number) => void;
  onEventJump?: (eventId: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      <AnimatePresence initial={false}>
        {items.map((r) => (
          <ReminderRow
            key={r.id}
            reminder={r}
            dateLabel={dateLabelFor?.(r)}
            onToggle={onToggle}
            onOpen={onOpen}
            onMenu={onMenu}
            onEventJump={onEventJump}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function RemindersView({
  reminders,
  people,
  onPersonClick,
  onEventJump,
}: {
  reminders: Reminder[];
  people: Person[];
  onPersonClick: (person: Person) => void;
  onEventJump?: (eventId: number) => void;
}) {
  const today = useTodayISO();
  const { finishReminder, purgeCompleted, postponeReminder, removeReminder, openEditReminder } =
    useReminders();
  const [showCompleted, setShowCompleted] = useState(false);
  const [menu, setMenu] = useState<{ reminder: Reminder; x: number; y: number } | null>(null);

  const onReminderOpen = openEditReminder;
  const openMenu = (reminder: Reminder, x: number, y: number) => setMenu({ reminder, x, y });

  const birthdays = useMemo(() => people.filter((p) => isBirthdayToday(p.birth_date)), [people]);

  const groups = useMemo(() => {
    const tomorrow = toISO(addDays(parseISO(today), 1));
    const weekEnd = toISO(addDays(parseISO(today), 7));
    const active = reminders.filter((r) => r.completed_at === null);
    const eff = effectiveDateISO;
    return {
      overdue: active.filter((r) => eff(r) < today),
      today: active.filter((r) => eff(r) === today),
      tomorrow: active.filter((r) => eff(r) === tomorrow),
      week: active.filter((r) => eff(r) > tomorrow && eff(r) <= weekEnd),
      later: active.filter((r) => eff(r) > weekEnd),
      completed: reminders
        .filter((r) => r.completed_at !== null)
        .sort((a, b) => (b.completed_at! < a.completed_at! ? -1 : 1)),
    };
  }, [reminders, today]);

  const empty =
    reminders.length === 0 && birthdays.length === 0;
  const upcomingEmpty =
    groups.tomorrow.length === 0 && groups.week.length === 0 && groups.later.length === 0;

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10">
        <motion.div {...appear(0)}>
          <QuickAdd />
        </motion.div>

        {empty ? (
          <motion.div
            {...appear(1)}
            className="flex flex-col items-center gap-3 px-6 py-24 text-center text-muted"
          >
            <Bell size={40} strokeWidth={1.5} />
            <p className="max-w-sm">
              Пока ни одного напоминания. Добавьте первое в строке выше — с датой и, если нужно,
              временем.
            </p>
          </motion.div>
        ) : (
          <>
            {groups.overdue.length > 0 && (
              <motion.section
                {...appear(1)}
                className={`rounded-2xl p-5 ${CARD_SHADOW}`}
                style={{ background: "color-mix(in srgb, var(--rg-rust) 10%, var(--rg-surface))" }}
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rust">
                  Просроченные · {groups.overdue.length}
                </h2>
                <Rows
                  items={groups.overdue}
                  dateLabelFor={(r) => formatDayMonthRu(r.date)}
                  onToggle={finishReminder}
                  onOpen={onReminderOpen}
                  onMenu={openMenu} onEventJump={onEventJump}
                />
              </motion.section>
            )}

            <motion.div {...appear(2)} className="grid items-start gap-5 lg:grid-cols-[3fr_2fr]">
              <section className={`rounded-2xl bg-surface-1 p-6 ${CARD_SHADOW}`}>
                <h2 className="text-2xl font-semibold text-app-text">
                  Сегодня, {formatRu(today, "d MMMM")}
                </h2>
                <p className="mt-0.5 mb-4 text-sm text-muted">{formatWeekdayFullRu(today)}</p>

                {birthdays.length > 0 && (
                  <ul className="mb-3 flex flex-col gap-0.5">
                    {birthdays.map((p) => {
                      const turning = formatTurningAge(p.birth_date, p.has_year);
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => onPersonClick(p)}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-0"
                          >
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber text-ink">
                              <Cake size={12} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-app-text">
                              День рождения — {p.name}
                            </span>
                            {turning && (
                              <span className="shrink-0 text-xs text-muted">исполняется {turning}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {groups.today.length > 0 ? (
                  <Rows
                    items={groups.today}
                    onToggle={finishReminder}
                    onOpen={onReminderOpen}
                    onMenu={openMenu} onEventJump={onEventJump}
                  />
                ) : (
                  birthdays.length === 0 && (
                    <p className="text-sm text-muted">На сегодня напоминаний нет.</p>
                  )
                )}
              </section>

              <Card title="Предстоящее">
                {upcomingEmpty ? (
                  <p className="text-sm text-muted">Впереди пусто.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {groups.tomorrow.length > 0 && (
                      <div>
                        <h3 className="mb-1.5 text-xs font-medium text-muted">Завтра</h3>
                        <Rows
                          items={groups.tomorrow}
                          onToggle={finishReminder}
                          onOpen={onReminderOpen}
                          onMenu={openMenu} onEventJump={onEventJump}
                        />
                      </div>
                    )}
                    {groups.week.length > 0 && (
                      <div>
                        <h3 className="mb-1.5 text-xs font-medium text-muted">На неделе</h3>
                        <Rows
                          items={groups.week}
                          dateLabelFor={(r) => formatWeekdayShortRu(effectiveDateISO(r))}
                          onToggle={finishReminder}
                          onOpen={onReminderOpen}
                          onMenu={openMenu} onEventJump={onEventJump}
                        />
                      </div>
                    )}
                    {groups.later.length > 0 && (
                      <div>
                        <h3 className="mb-1.5 text-xs font-medium text-muted">Позже</h3>
                        <Rows
                          items={groups.later}
                          dateLabelFor={(r) => formatDayMonthRu(effectiveDateISO(r))}
                          onToggle={finishReminder}
                          onOpen={onReminderOpen}
                          onMenu={openMenu} onEventJump={onEventJump}
                        />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>

            {groups.completed.length > 0 && (
              <motion.section
                {...appear(3)}
                className={`rounded-2xl bg-surface-1 p-5 ${CARD_SHADOW}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCompleted((v) => !v)}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted transition-colors hover:text-app-text"
                  >
                    <ChevronRight
                      size={15}
                      className={`transition-transform duration-150 ease-[var(--rg-ease)] ${
                        showCompleted ? "rotate-90" : ""
                      }`}
                    />
                    Выполненные · {groups.completed.length}
                  </button>
                  <button
                    type="button"
                    onClick={() => purgeCompleted()}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-muted transition-colors hover:text-rust"
                  >
                    <Trash2 size={13} />
                    Очистить
                  </button>
                </div>
                {showCompleted && (
                  <div className="mt-3">
                    <Rows
                      items={groups.completed}
                      dateLabelFor={(r) => formatDayMonthRu(r.date)}
                      onToggle={() => {}}
                      onOpen={onReminderOpen}
                    />
                  </div>
                )}
              </motion.section>
            )}
          </>
        )}
      </div>

      <ContextMenu
        open={menu !== null}
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        onClose={() => setMenu(null)}
        items={
          menu
            ? [
                {
                  label: "Отложить на час",
                  icon: <AlarmClock size={15} />,
                  onSelect: () => postponeReminder(menu.reminder.id, snoozePlusHour()),
                },
                {
                  label: "Отложить до вечера",
                  icon: <Sunset size={15} />,
                  onSelect: () => postponeReminder(menu.reminder.id, snoozeEvening()),
                },
                {
                  label: "Отложить до завтра",
                  icon: <Moon size={15} />,
                  onSelect: () => postponeReminder(menu.reminder.id, snoozeTomorrow()),
                },
                {
                  label: "Удалить",
                  icon: <Trash2 size={15} />,
                  danger: true,
                  onSelect: () => removeReminder(menu.reminder.id),
                },
              ]
            : []
        }
      />
    </div>
  );
}
