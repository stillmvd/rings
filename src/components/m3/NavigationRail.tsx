"use client";

import {
  Waypoints,
  LayoutGrid,
  CalendarDays,
  Target,
  Cake,
  Settings,
  Plus,
  type LucideIcon,
} from "lucide-react";
import type { ViewMode } from "@/components/ui/ModeToggle";

const DESTINATIONS: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: "timeline", label: "Таймлайн", icon: Waypoints },
  { value: "gallery", label: "Галерея", icon: LayoutGrid },
  { value: "calendar", label: "Календарь", icon: CalendarDays },
  { value: "tracking", label: "Отслеживание", icon: Target },
  { value: "birthdays", label: "Дни рождения", icon: Cake },
];

export function NavigationRail({
  mode,
  onMode,
  onCreate,
  onSettings,
}: {
  mode: ViewMode;
  onMode: (m: ViewMode) => void;
  onCreate: () => void;
  onSettings: () => void;
}) {
  return (
    <nav
      aria-label="Основная навигация"
      className="flex h-full w-20 shrink-0 flex-col items-center gap-1 border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] py-3"
    >
      <md-fab
        variant="primary"
        size="medium"
        aria-label="Создать"
        style={{ marginBottom: "12px" }}
        onClick={onCreate}
      >
        <Plus slot="icon" />
      </md-fab>

      {DESTINATIONS.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onMode(value)}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            title={label}
            className="group flex w-full flex-col items-center gap-1 py-1"
          >
            <span
              className={`flex h-8 w-14 items-center justify-center rounded-2xl transition-colors ${
                active
                  ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)]"
              }`}
            >
              <Icon size={22} />
            </span>
            <span
              className={`text-[11px] leading-tight ${
                active
                  ? "font-semibold text-[var(--md-sys-color-on-surface)]"
                  : "text-[var(--md-sys-color-on-surface-variant)]"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onSettings}
        aria-label="Настройки"
        title="Настройки"
        className="group flex w-full flex-col items-center gap-1 py-1"
      >
        <span className="flex h-8 w-14 items-center justify-center rounded-2xl text-[var(--md-sys-color-on-surface-variant)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)]">
          <Settings size={22} />
        </span>
        <span className="text-[11px] leading-tight text-[var(--md-sys-color-on-surface-variant)]">
          Настройки
        </span>
      </button>
    </nav>
  );
}
