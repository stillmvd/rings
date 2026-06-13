"use client";

import { createElement } from "react";
import { getSignificanceMeta } from "@/lib/significance";
import { eventAccent } from "@/lib/accent";
import { resolveIcon } from "@/lib/icons";
import type { TimelineEvent } from "@/db/queries/events";

/**
 * Внешний вид точки события. Размер и рамка — от значимости, цвет и иконка — от категории
 * (с откатом на цвет значимости, если категория не задана). Позиционируется в EventLayer.
 */
export function EventDot({ event }: { event: TimelineEvent }) {
  const sig = getSignificanceMeta(event.significance);
  const { fill: color, onFill: contentColor } = eventAccent(event);
  const diameter = sig.dotRadius * 2;
  const iconCmp = resolveIcon(event.category_icon);
  const showIcon = sig.dotRadius >= 9 && event.category_icon != null;

  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: diameter,
        height: diameter,
        background: color,
        boxShadow: sig.ring
          ? `0 0 0 2px var(--md-sys-color-surface), 0 0 0 4px ${sig.ringColor ?? color}`
          : undefined,
      }}
    >
      {showIcon &&
        createElement(iconCmp, {
          size: Math.round(diameter * 0.6),
          strokeWidth: 2.5,
          color: contentColor,
        })}
    </div>
  );
}
