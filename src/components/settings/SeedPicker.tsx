"use client";

import { useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import {
  SEED_PRESETS,
  applySeed,
  readStoredSeed,
  isValidSeed,
} from "@/lib/m3/seed-client";
import { DEFAULT_SEED } from "@/lib/m3/dynamic-color";
import { onColorFor } from "@/lib/colors";
import { setSeedAction } from "@/actions/settings";

const SEED_EVENT = "timeline:seed";

// Активный seed читается через useSyncExternalStore (localStorage + кастом-event) —
// паттерн проекта вместо useState+useEffect (запрет setState в эффекте).
const subscribe = (cb: () => void) => {
  window.addEventListener(SEED_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(SEED_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

function useSeed(): [string, (hex: string) => void] {
  const seed = useSyncExternalStore(subscribe, readStoredSeed, () => DEFAULT_SEED);
  const set = (hex: string) => {
    applySeed(hex); // live-пересчёт палитры + запись localStorage
    window.dispatchEvent(new Event(SEED_EVENT));
    void setSeedAction(hex); // персист в БД (build-time дефолт)
  };
  return [seed, set];
}

export function SeedPicker() {
  const [seed, setSeed] = useSeed();
  const [hexInput, setHexInput] = useState("");

  const submitHex = () => {
    const v = hexInput.trim().replace(/^#?/, "#");
    if (isValidSeed(v)) {
      setSeed(v);
      setHexInput("");
    }
  };

  const isActive = (hex: string) => seed.toLowerCase() === hex.toLowerCase();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SEED_PRESETS.map(({ hex, name }) => {
          const active = isActive(hex);
          return (
            <button
              key={hex}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={active}
              onClick={() => setSeed(hex)}
              className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110"
              style={{
                background: hex,
                boxShadow: active
                  ? "0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-primary)"
                  : "0 1px 2px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent)",
              }}
            >
              {active && <Check size={16} style={{ color: onColorFor(hex) }} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-sm"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          Свой цвет:
        </span>
        <input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitHex()}
          onBlur={submitHex}
          placeholder="#RRGGBB"
          maxLength={7}
          spellCheck={false}
          className="w-28 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors focus:ring-2"
          style={{
            background: "var(--md-sys-color-surface-container-high)",
            color: "var(--md-sys-color-on-surface)",
          }}
        />
      </div>
    </div>
  );
}
