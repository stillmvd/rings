"use client";

import { createElement, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { ICON_NAMES, resolveIcon } from "@/lib/icons";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
  color?: string;
}

export function IconPicker({ value, onChange, label, color }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  const q = query.trim().toLowerCase();
  const filtered = q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ICON_NAMES;

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center justify-between gap-2 rounded-xl border border-line bg-surface-1 px-3 text-sm text-app-text outline-none transition focus:border-accent-500"
      >
        <span className="flex min-w-0 items-center gap-2">
          {createElement(resolveIcon(value), {
            size: 18,
            style: color ? { color } : undefined,
          })}
          <span className="truncate text-muted">{value}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-line bg-surface-2 p-2 shadow-lg"
          >
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-2">
              <Search size={14} className="shrink-0 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск…"
                className="h-8 w-full bg-transparent text-sm text-app-text outline-none placeholder:text-muted"
              />
            </div>
            <div className="grid max-h-48 grid-cols-7 gap-1 overflow-auto">
              {filtered.map((name) => {
                const active = name === value;
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => {
                      onChange(name);
                      setQuery("");
                      setOpen(false);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      active ? "bg-accent-500 text-white" : "text-app-text hover:bg-surface-3"
                    }`}
                  >
                    {createElement(resolveIcon(name), {
                      size: 16,
                      style: active || !color ? undefined : { color },
                    })}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <span className="col-span-7 px-2 py-3 text-center text-sm text-muted">
                  Ничего не найдено
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
