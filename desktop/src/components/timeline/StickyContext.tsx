import { type Viewport, xToMs } from "@/lib/projection";
import { msToISO, formatRu } from "@/lib/dates";
import type { Lod } from "./lod";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type Props = {
  viewport: Viewport;
  width: number;
  height: number;
  lod: Lod;
};

// Контекст-метка года и месяца под центром видимой области (левый-нижний угол).
export function StickyContext({ viewport, width, height, lod }: Props) {
  if (width <= 0 || height <= 0) return null;

  const centerMs = xToMs(width / 2, viewport);
  const d = new Date(centerMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const monthLabel = capitalize(formatRu(msToISO(Date.UTC(year, month, 1)), "LLLL"));

  return (
    <div className="pointer-events-none absolute bottom-[4.25rem] left-4 z-30 flex items-baseline gap-1.5 rounded-full bg-surface-2 px-4 py-2">
      <span className="text-sm font-bold leading-none text-app-text">{year}</span>
      {lod !== "years" && (
        <span className="text-xs font-light leading-none text-muted">{monthLabel}</span>
      )}
    </div>
  );
}
