"use client";

import { Check } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/colors";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <div className="grid grid-cols-8 gap-2">
        {CATEGORY_COLORS.map((color) => {
          const active = color.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={active}
              onClick={() => onChange(color)}
              className="flex h-7 w-7 items-center justify-center rounded-full outline-none transition hover:scale-110"
              style={{
                background: color,
                boxShadow: active
                  ? `0 0 0 2px var(--tl-surface-1), 0 0 0 4px ${color}`
                  : undefined,
              }}
            >
              {active && <Check size={14} strokeWidth={3} className="text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
