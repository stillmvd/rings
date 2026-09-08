import {
  ArrowUpRight,
  Cake,
  Gift,
  PartyPopper,
  CalendarHeart,
  CalendarClock,
  Hourglass,
} from "lucide-react";
import { formatFullRu, formatDayMonthRu, formatWeekdayFullRu } from "@/lib/dates";
import { remainingUntil, countdownParts, formatCountdown, COUNTDOWN_THRESHOLD_DAYS } from "@/lib/duration";
import {
  nextBirthdayISO,
  daysUntilBirthday,
  formatCurrentAge,
  formatTurningAge,
} from "@/lib/birthday";
import { mediaSrc } from "@/lib/paths";
import { useNowMs } from "@/components/tracking/clock";
import { useLiveSeconds } from "./useLiveSeconds";
import { MetricChip } from "@/components/ui/MetricChip";
import type { Person } from "@/db/queries/people";

const ELEVATION_1 = "var(--ds-shadow-1)";
const ELEVATION_2 = "var(--ds-shadow-2)";

const ON_ACCENT_SOFT = "color-mix(in srgb, var(--ds-on-accent) 10%, transparent)";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function BirthdayCard({
  person,
  highlight,
  onClick,
}: {
  person: Person;
  highlight?: boolean;
  onClick: (person: Person) => void;
}) {
  const nb = nextBirthdayISO(person.birth_date);
  const days = daysUntilBirthday(person.birth_date);
  const today = days === 0;

  const liveSecondsEnabled = useLiveSeconds();
  const live = !today && days <= COUNTDOWN_THRESHOLD_DAYS && liveSecondsEnabled;
  const now = useNowMs(live);
  const countdown = live && now !== null ? countdownParts(nb, now) : null;

  const age = formatCurrentAge(person.birth_date, person.has_year);
  const turning = formatTurningAge(person.birth_date, person.has_year);

  const heroValue = today
    ? "Сегодня! 🎂"
    : countdown
      ? countdown.done
        ? "Сегодня! 🎂"
        : formatCountdown(countdown)
      : remainingUntil(nb);

  return (
    <button
      type="button"
      onClick={() => onClick(person)}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-4xl text-left transition-[box-shadow,scale] duration-200 ease-[var(--rg-ease)] active:scale-[0.96] ${
        highlight ? "bg-amber text-ink" : "bg-surface-1 text-app-text"
      }`}
      style={{ boxShadow: ELEVATION_1 }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = ELEVATION_2)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = ELEVATION_1)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-app-text opacity-0 transition-opacity duration-200 group-hover:opacity-[0.06]"
      />

      <div className="relative aspect-video w-full overflow-hidden">
        {person.photo ? (
          <img
            src={mediaSrc(person.photo)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: highlight ? ON_ACCENT_SOFT : "var(--ds-surface-2)" }}
          >
            <Cake
              size={56}
              strokeWidth={1.5}
              style={{ color: highlight ? "var(--ds-on-accent)" : "var(--ds-accent-ink)" }}
            />
          </div>
        )}

        {today && (
          <span
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              background: "var(--rg-amber)",
              color: "var(--rg-bg)",
              boxShadow: "var(--ds-shadow-1)",
            }}
          >
            <PartyPopper size={13} strokeWidth={1.75} />
            Сегодня!
          </span>
        )}

        <span
          aria-hidden
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full transition-[background-color,scale] duration-150 ease-[var(--rg-ease)] group-hover:scale-105"
          style={{
            background: highlight ? "var(--ds-on-accent)" : "var(--rg-bg)",
            color: highlight ? "var(--rg-amber)" : "var(--rg-text)",
          }}
        >
          <ArrowUpRight size={18} strokeWidth={2} />
        </span>
      </div>

      <div className="flex flex-col gap-3.5 p-5">
        <div>
          <h3 className="truncate text-2xl font-bold tracking-tight">{person.name}</h3>
          <p className={`mt-0.5 text-sm ${highlight ? "opacity-60" : "text-muted"}`}>
            {person.has_year ? formatFullRu(person.birth_date) : cap(formatDayMonthRu(person.birth_date))}
          </p>
        </div>

        <div
          className="rounded-3xl px-5 py-4"
          style={{ background: highlight ? ON_ACCENT_SOFT : "var(--ds-surface-3)" }}
        >
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              highlight ? "opacity-70" : "text-muted"
            }`}
          >
            <Gift size={14} strokeWidth={1.75} />
            {today ? "День рождения" : "До дня рождения"}
          </span>
          <span
            className="mt-1 block text-[28px] font-bold leading-none tabular-nums"
            style={{ color: highlight ? "var(--ds-on-accent)" : "var(--rg-text)" }}
          >
            {heroValue}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {age && (
            <MetricChip
              icon={<Hourglass size={12} strokeWidth={1.75} />}
              label="Сейчас"
              value={age}
              onAccent={highlight}
            />
          )}
          {turning && (
            <MetricChip
              icon={<Cake size={12} strokeWidth={1.75} />}
              label="Исполнится"
              value={turning}
              onAccent={highlight}
            />
          )}
          <MetricChip
            icon={<CalendarHeart size={12} strokeWidth={1.75} />}
            label="Дата"
            value={cap(formatDayMonthRu(nb))}
            onAccent={highlight}
          />
          <MetricChip
            icon={<CalendarClock size={12} strokeWidth={1.75} />}
            label="День"
            value={cap(formatWeekdayFullRu(nb))}
            onAccent={highlight}
          />
        </div>
      </div>
    </button>
  );
}
