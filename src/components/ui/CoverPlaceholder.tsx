import { createElement } from "react";
import type { LucideIcon } from "lucide-react";

const DOT_SIZE: Record<"sm" | "md", { dot: number; gap: number }> = {
  sm: { dot: 1.1, gap: 10 },
  md: { dot: 1.4, gap: 14 },
};

// Плейсхолдер обложки события/отметки без фото: залитый container-цвет,
// точечная текстура и иконка на мягкой подложке — вместо плоского пятна.
export function CoverPlaceholder({
  icon: Icon,
  fill,
  container,
  onContainer,
  iconSize = 48,
  size = "md",
  texture = true,
  dimmed,
}: {
  icon: LucideIcon | null;
  fill: string;
  container: string;
  onContainer: string;
  iconSize?: number;
  size?: "sm" | "md";
  texture?: boolean;
  dimmed?: boolean;
}) {
  const { dot, gap } = DOT_SIZE[size];
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: container, opacity: dimmed ? 0.6 : undefined }}
    >
      {texture && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${onContainer} ${dot}px, transparent ${dot}px)`,
            backgroundSize: `${gap}px ${gap}px`,
            opacity: 0.16,
          }}
        />
      )}
      {texture && Icon && (
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: iconSize * 1.6,
            height: iconSize * 1.6,
            background: `color-mix(in srgb, ${fill} 28%, transparent)`,
          }}
        />
      )}
      {Icon && (
        <span className="relative" style={{ color: onContainer }}>
          {createElement(Icon, { size: iconSize, strokeWidth: 1.5 })}
        </span>
      )}
    </div>
  );
}
