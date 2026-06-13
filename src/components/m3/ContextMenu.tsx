"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onSelect: () => void;
}

interface ContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const MENU_WIDTH = 188;
const ITEM_HEIGHT = 40;
const PAD = 8;

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// M3 menu, привязанное к координатам курсора (ПКМ). Кламп в пределах окна.
export function ContextMenu({ open, x, y, items, onClose }: ContextMenuProps) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // capture + stopPropagation: Esc закрывает только меню, не нижнюю модалку.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("contextmenu", onDown);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("contextmenu", onDown);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const menuH = items.length * ITEM_HEIGHT + PAD * 2;
  const left = Math.min(x, window.innerWidth - MENU_WIDTH - 8);
  const top = Math.min(y, window.innerHeight - menuH - 8);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="menu"
          className="fixed z-[95] py-2 shadow-2xl"
          style={{
            left,
            top,
            width: MENU_WIDTH,
            background: "var(--md-sys-color-surface-container-high)",
            color: "var(--md-sys-color-on-surface)",
            borderRadius: "var(--md-sys-shape-corner-medium)",
          }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.13, ease: [0.2, 0, 0, 1] }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                onClose();
                item.onSelect();
              }}
              className="flex w-full items-center gap-3 px-4 text-left text-sm transition-colors"
              style={{
                height: ITEM_HEIGHT,
                color: item.danger
                  ? "var(--md-sys-color-error)"
                  : "var(--md-sys-color-on-surface)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.danger
                  ? "color-mix(in srgb, var(--md-sys-color-error) 10%, transparent)"
                  : "color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
