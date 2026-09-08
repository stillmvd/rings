import type { ReactNode } from "react";

const ON_ACCENT_BG = "color-mix(in srgb, var(--ds-on-accent) 14%, transparent)";

export function MetricChip({
  icon,
  label,
  value,
  onAccent,
}: {
  icon: ReactNode;
  label?: string;
  value: string;
  onAccent?: boolean;
}) {
  return (
    <span
      className="inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
      style={{ background: onAccent ? ON_ACCENT_BG : "var(--ds-surface-2)" }}
    >
      <span className={onAccent ? "opacity-50" : "text-faint"}>{icon}</span>
      {label && <span className={onAccent ? "opacity-50" : "text-faint"}>{label}</span>}
      <span className="truncate font-semibold tabular-nums">{value}</span>
    </span>
  );
}
