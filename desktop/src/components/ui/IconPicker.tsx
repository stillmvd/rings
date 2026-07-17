import { createElement, useState } from "react";
import { Search } from "lucide-react";
import { ICON_NAMES, resolveIcon } from "@/lib/icons";

export function IconPicker({
  value,
  onChange,
  label,
  color,
}: {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
  color?: string;
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ICON_NAMES;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-muted">{label}</span>}

      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-0 px-2.5 transition focus-within:border-amber">
        <Search size={15} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск иконки…"
          className="h-9 w-full bg-transparent text-sm text-app-text outline-none placeholder:text-muted"
        />
      </div>

      <div className="mt-1.5 grid h-52 grid-cols-7 content-start gap-1.5 overflow-y-auto rounded-lg border border-line bg-surface-0 p-2">
        {filtered.map((name) => {
          const active = name === value;
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onChange(name)}
              className={`grid aspect-square cursor-pointer place-items-center rounded-lg transition-colors ${
                active ? "bg-amber text-ink" : "text-app-text hover:bg-surface-1"
              }`}
            >
              {createElement(resolveIcon(name), {
                size: 18,
                style: active || !color ? undefined : { color },
              })}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <span className="col-span-7 px-2 py-3 text-center text-sm text-muted">
            Ничего не найдено
          </span>
        )}
      </div>
    </div>
  );
}
