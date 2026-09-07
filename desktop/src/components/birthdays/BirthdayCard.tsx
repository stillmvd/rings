import type { ReactNode } from "react";
import { Cake, Gift, PartyPopper, CalendarHeart, CalendarClock, Hourglass } from "lucide-react";
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
import type { Person } from "@/db/queries/people";

const ELEVATION_1 = "0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)";
const ELEVATION_2 = "0 1px 2px 0 rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)";
const METRIC_BG = "color-mix(in srgb, var(--rg-text) 6%, var(--rg-surface))";
const HERO_BG = "var(--ds-surface-2)";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl px-3 py-2" style={{ background: METRIC_BG }}>
      <span className="flex items-center gap-1 text-xs text-muted">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium tabular-nums text-app-text">{value}</span>
    </div>
  );
}

export function BirthdayCard({
  person,
  onClick,
}: {
  person: Person;
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
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[16px] bg-surface-1 text-left text-app-text transition-[box-shadow,scale] duration-200 ease-[var(--rg-ease)] active:scale-[0.96]"
      style={{ boxShadow: ELEVATION_1 }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = ELEVATION_2)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = ELEVATION_1)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-app-text opacity-0 transition-opacity duration-200 group-hover:opacity-[0.08]"
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
            style={{ background: HERO_BG }}
          >
            <Cake size={56} strokeWidth={1.5} style={{ color: "var(--rg-amber)" }} />
          </div>
        )}

        {today && (
          <span
            className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              background: "var(--rg-amber)",
              color: "var(--rg-bg)",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.3)",
            }}
          >
            <PartyPopper size={13} strokeWidth={1.75} />
            Сегодня!
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-xl font-bold text-app-text">{person.name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {person.has_year ? formatFullRu(person.birth_date) : cap(formatDayMonthRu(person.birth_date))}
          </p>
        </div>

        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: HERO_BG, color: "var(--rg-text)" }}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium opacity-80">
            <Gift size={14} strokeWidth={1.75} />
            {today ? "День рождения" : "До дня рождения"}
          </span>
          <span
            className="mt-0.5 block text-2xl font-bold leading-tight tabular-nums"
            style={{ color: "var(--ds-accent-ink)" }}
          >
            {heroValue}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {age && <Metric icon={<Hourglass size={13} strokeWidth={1.75} />} label="Сейчас" value={age} />}
          {turning && <Metric icon={<Cake size={13} strokeWidth={1.75} />} label="Исполнится" value={turning} />}
          <Metric
            icon={<CalendarHeart size={13} strokeWidth={1.75} />}
            label="Дата"
            value={cap(formatDayMonthRu(nb))}
          />
          <Metric
            icon={<CalendarClock size={13} strokeWidth={1.75} />}
            label="День недели"
            value={cap(formatWeekdayFullRu(nb))}
          />
        </div>
      </div>
    </button>
  );
}
