import type { ReactNode } from "react";

export type Segment<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

export function SegmentedControl<T extends string>({
  label,
  segments,
  value,
  onChange,
}: {
  label?: string;
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div className="flex gap-1 rounded-full bg-surface-2 p-1">
        {segments.map((s) => {
          const active = s.value === value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition-[background-color,color,scale] duration-150 ease-[var(--rg-ease)] active:scale-[0.96] ${
                active ? "bg-surface-3 text-accent-ink" : "text-muted hover:bg-surface-1 hover:text-app-text"
              }`}
            >
              {s.icon && <span className="shrink-0">{s.icon}</span>}
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
