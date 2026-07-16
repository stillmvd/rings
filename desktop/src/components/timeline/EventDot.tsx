import { createElement } from "react";
import { getSignificanceMeta } from "@/lib/significance";
import { eventAccent } from "@/lib/accent";
import { resolveIconOrNull } from "@/lib/icons";
import { isFuture } from "@/lib/duration";
import type { TimelineEvent } from "@/db/queries/events";

// Размер и рамка — от значимости, цвет и иконка — от категории (откат на цвет значимости).
export function EventDot({ event }: { event: TimelineEvent }) {
  const sig = getSignificanceMeta(event.significance);
  const { fill: color, onFill: contentColor } = eventAccent(event);
  const diameter = sig.dotRadius * 2;
  const iconCmp = resolveIconOrNull(event.category_icon);
  const showIcon = sig.dotRadius >= 9 && iconCmp != null;
  const future = isFuture(event.date);

  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: diameter,
        height: diameter,
        background: future ? `color-mix(in srgb, ${color} 20%, transparent)` : color,
        border: future ? `1.5px dashed ${color}` : undefined,
        opacity: future ? 0.85 : undefined,
      }}
    >
      {showIcon &&
        iconCmp &&
        createElement(iconCmp, {
          size: Math.round(diameter * 0.6),
          strokeWidth: 2.5,
          color: future ? color : contentColor,
        })}
    </div>
  );
}
