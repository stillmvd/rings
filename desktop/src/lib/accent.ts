import { getSignificanceMeta } from "./significance";
import { onColorFor } from "./colors";

export type EventAccent = {
  fill: string;
  onFill: string;
  container: string;
  onContainer: string;
};

export function eventAccent(event: {
  significance: number;
  category_color: string | null;
}): EventAccent {
  if (event.category_color) {
    const c = event.category_color;
    return {
      fill: c,
      onFill: onColorFor(c),
      container: `color-mix(in srgb, ${c} 40%, var(--rg-surface))`,
      onContainer: c,
    };
  }
  const sig = getSignificanceMeta(event.significance);
  return {
    fill: sig.color,
    onFill: sig.onColor,
    container: sig.container,
    onContainer: sig.onContainer,
  };
}
