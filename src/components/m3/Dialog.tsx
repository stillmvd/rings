"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  maxWidth?: number;
  // Базовый z-index (scrim = z, панель = z+1). Вложенные диалоги поднимают выше.
  z?: number;
  showClose?: boolean;
  children: ReactNode;
}

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// Центральный диалог в стиле M3: scrim + surface-container-high, corner-extra-large.
export function Dialog({
  open,
  onClose,
  title,
  maxWidth = 560,
  z = 80,
  showClose = true,
  children,
}: DialogProps) {
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: z,
            background: "color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[28px] shadow-2xl"
            style={{
              zIndex: z + 1,
              maxWidth,
              background: "var(--md-sys-color-surface-container-high)",
              color: "var(--md-sys-color-on-surface)",
            }}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {(title || showClose) && (
              <header className="flex shrink-0 items-center justify-between gap-3 px-6 pb-2 pt-5">
                <h2 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
                  {title}
                </h2>
                {showClose && (
                  <button
                    type="button"
                    aria-label="Закрыть"
                    onClick={onClose}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)] hover:text-[var(--md-sys-color-on-surface)]"
                  >
                    <X size={20} />
                  </button>
                )}
              </header>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
