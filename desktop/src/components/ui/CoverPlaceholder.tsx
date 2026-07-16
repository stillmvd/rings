import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import { Mark } from "@/components/brand/Mark";

export function CoverPlaceholder({
  icon: Icon,
  fill,
  container,
  onContainer,
  iconSize = 48,
  dimmed,
}: {
  icon: LucideIcon | null;
  fill: string;
  container: string;
  onContainer: string;
  iconSize?: number;
  dimmed?: boolean;
}) {
  const gradient = `linear-gradient(140deg, color-mix(in srgb, ${fill} 30%, ${container}) 0%, ${container} 55%, color-mix(in srgb, #000 16%, ${container}) 100%)`;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: gradient, opacity: dimmed ? 0.6 : undefined }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ filter: "blur(7px)", opacity: 0.28 }}
      >
        <Mark size={iconSize * 2.8} />
      </span>
      {Icon && (
        <span className="relative" style={{ color: onContainer }}>
          {createElement(Icon, { size: iconSize, strokeWidth: 1.5 })}
        </span>
      )}
    </div>
  );
}
