import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker, useDayPicker, type MonthCaptionProps } from "react-day-picker";
import { ru } from "date-fns/locale";
import { parseISO, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import "react-day-picker/style.css";
import { formatFullRu } from "@/lib/dates";
import { Select } from "./Select";

const MONTHS = Array.from({ length: 12 }, (_, m) => ({
  value: String(m),
  label: format(new Date(2000, m, 1), "LLLL", { locale: ru }),
}));

function CalCaption({
  calendarMonth,
  minYear,
  maxYear,
}: MonthCaptionProps & { minYear: number; maxYear: number }) {
  const { goToMonth } = useDayPicker();
  const date = calendarMonth.date;
  const year = date.getFullYear();
  const month = date.getMonth();

  const years = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = maxYear - i;
        return { value: String(y), label: String(y) };
      }),
    [minYear, maxYear],
  );

  return (
    <div className="flex items-center gap-2 px-1 pb-2">
      <div className="flex-1 [&_button]:capitalize">
        <Select
          options={MONTHS}
          value={String(month)}
          onChange={(v) => goToMonth(new Date(year, Number(v), 1))}
        />
      </div>
      <div className="w-24">
        <Select options={years} value={String(year)} onChange={(v) => goToMonth(new Date(Number(v), month, 1))} />
      </div>
    </div>
  );
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  min,
  max,
}: {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  min?: string;
  max?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;
  const minYear = minDate ? minDate.getFullYear() : 1900;
  const maxYear = maxDate ? maxDate.getFullYear() : 2100;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border bg-surface-0 px-3 py-2 text-sm text-app-text outline-none transition focus:border-amber ${
            error ? "border-rust" : "border-line"
          }`}
        >
          <CalendarDays size={15} className="shrink-0 text-muted" />
          <span className={`flex-1 text-left ${value ? "" : "text-muted"}`}>
            {value ? formatFullRu(value) : "Выберите дату"}
          </span>
        </button>
        {open && (
          <div className="tl-calendar absolute z-50 mt-1 rounded-xl border border-line bg-surface-1 p-2 shadow-lg">
            <DayPicker
              mode="single"
              locale={ru}
              hideNavigation
              selected={selected}
              defaultMonth={selected}
              startMonth={minDate}
              endMonth={maxDate}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
              components={{
                MonthCaption: (props) => (
                  <CalCaption {...props} minYear={minYear} maxYear={maxYear} />
                ),
              }}
              onSelect={(d) => {
                if (d) {
                  onChange(format(d, "yyyy-MM-dd"));
                  setOpen(false);
                }
              }}
            />
          </div>
        )}
      </div>
      {error && <span className="text-xs text-rust">{error}</span>}
    </div>
  );
}
