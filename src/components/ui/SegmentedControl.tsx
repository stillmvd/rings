"use client";

import { useId } from "react";
import { motion } from "motion/react";

interface Segment<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const layoutId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <div className="relative flex rounded-pill bg-surface-2 p-1">
        {segments.map((seg) => {
          const active = seg.value === value;
          return (
            <button
              key={seg.value}
              type="button"
              onClick={() => onChange(seg.value)}
              className={`relative flex-1 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "text-app-text" : "text-muted hover:text-app-text"
              }`}
            >
              {active && (
                <motion.div
                  layoutId={layoutId}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-pill bg-surface-0 shadow"
                />
              )}
              <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                {seg.color && (
                  <span
                    className="h-2 w-2 rounded-pill"
                    style={{ background: seg.color }}
                  />
                )}
                {seg.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
