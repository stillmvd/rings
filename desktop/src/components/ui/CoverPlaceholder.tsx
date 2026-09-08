import { ImageIcon } from "lucide-react";
import { resolveIconOrNull } from "@/lib/icons";

const ON_ACCENT_SOFT = "color-mix(in srgb, var(--ds-on-accent) 10%, transparent)";

export function CoverPlaceholder({
  fill,
  icon,
  dimmed,
  onAccent,
}: {
  fill: string;
  icon?: string | null;
  dimmed?: boolean;
  onAccent?: boolean;
}) {
  const CategoryIcon = resolveIconOrNull(icon);
  const Icon = CategoryIcon ?? ImageIcon;
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: onAccent ? ON_ACCENT_SOFT : "var(--ds-surface-2)",
        opacity: dimmed ? 0.6 : undefined,
      }}
    >
      <Icon
        className="h-[34%] w-[34%]"
        strokeWidth={1.5}
        style={{
          color: onAccent
            ? "var(--ds-on-accent)"
            : CategoryIcon
              ? fill
              : "var(--ds-text-faint)",
        }}
      />
    </div>
  );
}
