"use client";

import { Waypoints, LayoutGrid, CalendarDays, type LucideIcon } from "lucide-react";

export type ViewMode = "timeline" | "gallery" | "calendar";

const OPTIONS: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: "timeline", label: "Таймлайн", icon: Waypoints },
  { value: "gallery", label: "Галерея", icon: LayoutGrid },
  { value: "calendar", label: "Календарь", icon: CalendarDays },
];

export function ModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface-1/80 p-1 backdrop-blur">
      {OPTIONS.map(({ value: v, label, icon: Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              active ? "bg-surface-3 text-app-text" : "text-muted hover:text-app-text"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
