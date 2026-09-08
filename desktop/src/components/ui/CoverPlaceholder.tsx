import { ImageIcon } from "lucide-react";
import { resolveIconOrNull } from "@/lib/icons";

export function CoverPlaceholder({
  fill,
  icon,
  dimmed,
}: {
  fill: string;
  icon?: string | null;
  dimmed?: boolean;
}) {
  const CategoryIcon = resolveIconOrNull(icon);
  const Icon = CategoryIcon ?? ImageIcon;
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "var(--ds-surface-2)", opacity: dimmed ? 0.6 : undefined }}
    >
      <Icon
        className="h-[34%] w-[34%]"
        strokeWidth={1.5}
        style={{ color: CategoryIcon ? fill : "var(--ds-text-faint)" }}
      />
    </div>
  );
}
