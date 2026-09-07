import { createElement, useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { resolveIconOrNull } from "@/lib/icons";

export type SelectOption = {
  value: string;
  label: string;
  icon?: string | null;
  color?: string | null;
};

function OptionIcon({ opt }: { opt: SelectOption }) {
  const Icon = resolveIconOrNull(opt.icon);
  if (Icon) return createElement(Icon, { size: 15, style: { color: opt.color ?? undefined } });
  if (opt.color)
    return <span className="h-2.5 w-2.5 rounded-full" style={{ background: opt.color }} />;
  return null;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "—",
}: {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center gap-2 h-10 rounded-xl border border-line bg-surface-2 px-3 text-sm text-app-text outline-none transition focus:border-amber"
        >
          {selected && <OptionIcon opt={selected} />}
          <span className={`flex-1 truncate text-left ${selected ? "" : "text-muted"}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-surface-1 py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-app-text transition-colors hover:bg-surface-2"
              >
                <OptionIcon opt={opt} />
                <span className="flex-1 truncate">{opt.label}</span>
                {opt.value === value && <Check size={15} strokeWidth={1.75} className="shrink-0 text-amber" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
