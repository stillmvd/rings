"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { resolveIcon } from "@/lib/icons";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string | null;
  color?: string | null;
}

interface SelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Выбрать…",
  label,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center justify-between gap-2 rounded-xl border border-line bg-surface-1 px-3 text-sm outline-none transition focus:border-accent-500 disabled:pointer-events-none disabled:opacity-50 ${
          selected ? "text-app-text" : "text-muted"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon &&
            (() => {
              const Icon = resolveIcon(selected.icon);
              return (
                <Icon
                  size={16}
                  style={selected.color ? { color: selected.color } : undefined}
                />
              );
            })()}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-auto rounded-xl border border-line bg-surface-2 p-1 shadow-lg"
          >
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">Нет вариантов</li>
            )}
            {options.map((opt) => {
              const active = opt.value === value;
              const Icon = opt.icon ? resolveIcon(opt.icon) : null;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active ? "bg-surface-3 text-app-text" : "text-app-text hover:bg-surface-3"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={16}
                        style={opt.color ? { color: opt.color } : undefined}
                      />
                    )}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {active && <Check size={16} className="text-accent-500" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
