"use client";

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

// @material/web не содержит segmented buttons — используем single-select filter-chips.
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <md-chip-set role="radiogroup">
        {segments.map((seg) => (
          <md-filter-chip
            key={seg.value}
            label={seg.label}
            selected={seg.value === value}
            has-icon={seg.color ? true : undefined}
            onClick={() => onChange(seg.value)}
          >
            {seg.color && (
              <span
                slot="icon"
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: seg.color,
                }}
              />
            )}
          </md-filter-chip>
        ))}
      </md-chip-set>
    </div>
  );
}
