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
      <div className="flex gap-1 rounded-lg border border-line bg-surface-0 p-1">
        {segments.map((s) => {
          const active = s.value === value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-amber text-ink" : "text-muted hover:bg-surface-1 hover:text-app-text"
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
