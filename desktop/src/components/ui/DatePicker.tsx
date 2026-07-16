import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { parseISO, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import "react-day-picker/style.css";
import { formatFullRu } from "@/lib/dates";

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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
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
              captionLayout="dropdown"
              selected={selected}
              defaultMonth={selected}
              startMonth={min ? parseISO(min) : undefined}
              endMonth={max ? parseISO(max) : undefined}
              disabled={[
                ...(min ? [{ before: parseISO(min) }] : []),
                ...(max ? [{ after: parseISO(max) }] : []),
              ]}
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
