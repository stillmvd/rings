"use client";

import { createElement, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import { SIGNIFICANCE_LIST } from "@/lib/significance";
import { formatFullRu, formatDayMonthRu } from "@/lib/dates";
import { EMPTY_FILTER, isFilterActive, matchesFilter, type EventFilter } from "@/lib/filter";
import type { Significance } from "@/lib/constants";
import type { CategoryNode } from "@/db/queries/categories";
import type { TimelineEvent } from "@/db/queries/events";

const MAX_RESULTS = 8;

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export function SearchPanel({
  open,
  filter,
  categories,
  events,
  onFilterChange,
  onSelectResult,
  onClose,
}: {
  open: boolean;
  filter: EventFilter;
  categories: CategoryNode[];
  events: TimelineEvent[];
  onFilterChange: (filter: EventFilter) => void;
  onSelectResult: (event: TimelineEvent) => void;
  onClose: () => void;
}) {
  const mounted = useMounted();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!mounted) return null;

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

  const toggleCategory = (id: number) => {
    const categoryIds = filter.categoryIds.includes(id)
      ? filter.categoryIds.filter((x) => x !== id)
      : [...filter.categoryIds, id];
    onFilterChange({ ...filter, categoryIds });
  };

  const toggleSignificance = (level: Significance) => {
    const significance = filter.significance.includes(level)
      ? filter.significance.filter((x) => x !== level)
      : [...filter.significance, level];
    onFilterChange({ ...filter, significance });
  };

  const active = isFilterActive(filter);

  const query = filter.query.trim();
  const matched = query ? events.filter((e) => matchesFilter(e, filter)) : [];
  matched.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  const results = matched.slice(0, MAX_RESULTS);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-overlay"
          className="fixed inset-0 z-[70] flex justify-center bg-black/30 px-4 pt-24 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="h-fit w-full max-w-xl rounded-2xl border border-line bg-surface-1 p-4 shadow-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-0 px-3">
              <Search size={18} className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                type="text"
                name="timeline-search"
                aria-label="Поиск событий"
                value={filter.query}
                onChange={(e) => onFilterChange({ ...filter, query: e.target.value })}
                placeholder="Поиск по названию и описанию…"
                className="h-11 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-muted"
              />
              <button
                type="button"
                aria-label="Закрыть"
                onClick={onClose}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-app-text"
              >
                <X size={16} />
              </button>
            </div>

            {query && (
              <div className="mt-3 overflow-hidden rounded-xl border border-line">
                {results.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted">
                    Ничего не найдено.
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
                    {results.map((event) => (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => onSelectResult(event)}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-2"
                        >
                          {createElement(resolveIcon(event.category_icon), {
                            size: 16,
                            color: event.category_color ?? undefined,
                            className: "shrink-0",
                          })}
                          <span className="min-w-0 flex-1 truncate text-sm text-app-text">
                            {event.title}
                          </span>
                          <span className="shrink-0 text-xs text-muted">
                            {event.end_date
                              ? `${formatDayMonthRu(event.date)} — ${formatFullRu(event.end_date)}`
                              : formatFullRu(event.date)}
                          </span>
                        </button>
                      </li>
                    ))}
                    {matched.length > results.length && (
                      <li className="px-3 py-2 text-center text-xs text-muted">
                        …ещё {matched.length - results.length}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Категории
              </div>
              <div className="flex flex-wrap gap-2">
                {flatCategories.map((cat) => {
                  const on = filter.categoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleCategory(cat.id)}
                      style={on ? { borderColor: cat.color, color: cat.color } : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm transition-colors ${
                        on
                          ? "bg-surface-3"
                          : "border-line text-muted hover:text-app-text"
                      }`}
                    >
                      {createElement(resolveIcon(cat.icon), { size: 14, color: cat.color })}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Значимость
              </div>
              <div className="flex flex-wrap gap-2">
                {SIGNIFICANCE_LIST.map((meta) => {
                  const on = filter.significance.includes(meta.level);
                  return (
                    <button
                      key={meta.level}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleSignificance(meta.level)}
                      style={on ? { borderColor: meta.color, color: meta.color } : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm transition-colors ${
                        on ? "bg-surface-3" : "border-line text-muted hover:text-app-text"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {active && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => onFilterChange(EMPTY_FILTER)}
                  className="text-sm text-muted transition-colors hover:text-app-text"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
