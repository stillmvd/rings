"use client";

import { useLiveSeconds, setLiveSeconds } from "@/components/birthdays/useLiveSeconds";

export function LiveSecondsToggle() {
  const enabled = useLiveSeconds();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Живой отсчёт секунд"
      onClick={() => setLiveSeconds(!enabled)}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
      style={{
        background: enabled
          ? "var(--md-sys-color-primary)"
          : "var(--md-sys-color-surface-container-highest)",
        boxShadow: enabled ? "none" : "inset 0 0 0 2px var(--md-sys-color-outline)",
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full transition-transform"
        style={{
          transform: enabled ? "translateX(24px)" : "translateX(4px)",
          background: enabled
            ? "var(--md-sys-color-on-primary)"
            : "var(--md-sys-color-outline)",
        }}
      />
    </button>
  );
}
