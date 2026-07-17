import { Check } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/colors";

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
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full outline-none transition hover:scale-110"
              style={{
                background: color,
                boxShadow: active
                  ? `0 0 0 2px var(--rg-surface), 0 0 0 4px ${color}`
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
