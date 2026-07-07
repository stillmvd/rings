import { getSignificanceMeta } from "./significance";
import { onColorFor } from "./colors";

export type EventAccent = {
  /** Насыщенный фон для мелких акцентов: точки, бары, чипы-бейджи. */
  fill: string;
  /** Контрастный контент поверх fill. */
  onFill: string;
  /** Приглушённый тонированный фон для крупных заливок (плейсхолдеры без обложки). */
  container: string;
  /** Насыщенный контент поверх container. */
  onContainer: string;
};

// Единый источник акцентных цветов события (M3). Цвет берём от категории (произвольный hex)
// либо от роли значимости. container в обоих случаях — подмешивание акцента к surface
// (адаптивно к теме, не уходит в грязный тон на любом hue).
export function eventAccent(event: {
  significance: number;
  category_color: string | null;
}): EventAccent {
  if (event.category_color) {
    const c = event.category_color;
    return {
      fill: c,
      onFill: onColorFor(c),
      container: `color-mix(in srgb, ${c} 20%, var(--md-sys-color-surface-container-high))`,
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
