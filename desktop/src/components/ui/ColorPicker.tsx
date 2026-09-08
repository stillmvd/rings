import { Check } from "lucide-react";
import { CATEGORY_COLORS, onColorFor } from "@/lib/colors";

export function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div className="grid grid-cols-8 gap-2.5">
        {CATEGORY_COLORS.map((color) => {
          const active = color.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={active}
              onClick={() => onChange(color)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full outline-none transition-[scale,box-shadow] duration-150 ease-[var(--rg-ease)] hover:scale-110 active:scale-[0.96]"
              style={{
                background: color,
                boxShadow: active
                  ? "0 0 0 2px var(--ds-surface-1), 0 0 0 4px var(--rg-text)"
                  : undefined,
              }}
            >
              {active && <Check size={16} strokeWidth={3} style={{ color: onColorFor(color) }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
