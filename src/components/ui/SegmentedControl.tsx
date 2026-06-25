"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

// Однострочный single-select в стиле M3 filter-chips, но на flex-кнопках:
// flex-auto + flex-wrap → чипы растягиваются по ширине и при переносе занимают строку целиком.
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {segments.map((seg) => {
          const active = seg.value === value;
          return (
            <button
              key={seg.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(seg.value)}
              className={`flex flex-auto min-w-[5rem] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-transparent bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                  : "border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)]"
              }`}
            >
              {seg.icon ? (
                <span className="inline-flex shrink-0">{seg.icon}</span>
              ) : (
                active && <Check size={16} className="shrink-0" />
              )}
              {seg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
