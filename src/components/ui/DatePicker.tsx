"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format, parseISO, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import "react-day-picker/style.css";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  min?: string;
  max?: string;
  id?: string;
}

function toDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = parseISO(s);
  return isValid(d) ? d : undefined;
}

export function DatePicker({ label, value, onChange, error, min, max, id }: DatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);

  const selected = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setFlip(window.innerHeight - r.bottom < 360);
    }
    setOpen((o) => !o);
  };

  const handleSelect = (day?: Date) => {
    if (day) {
      onChange(format(day, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <div ref={wrapRef} className="relative">
        <button
          id={fieldId}
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-surface-1 px-3 text-left text-sm outline-none transition focus:border-accent-500 ${
            error ? "border-tl-danger" : "border-line"
          } ${selected ? "text-app-text" : "text-muted"}`}
        >
          <span>
            {selected ? format(selected, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
          </span>
          <CalendarDays size={16} className="text-muted" />
        </button>

        {open && (
          <div
            role="dialog"
            className={`tl-calendar absolute left-0 z-50 ${
              flip ? "bottom-full mb-2" : "top-full mt-2"
            } rounded-card border border-line bg-surface-1 p-2 shadow-2xl`}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              locale={ru}
              defaultMonth={selected ?? new Date()}
              captionLayout="dropdown"
              startMonth={minDate}
              endMonth={maxDate}
              disabled={disabled}
              aria-label="Выбор даты"
            />
          </div>
        )}
      </div>
      {error && <span className="text-xs text-tl-danger">{error}</span>}
    </div>
  );
}
