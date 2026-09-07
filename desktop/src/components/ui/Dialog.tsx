import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  width = 460,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-6"
          style={{ background: "color-mix(in srgb, #000 45%, transparent)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-[20px] bg-surface-1 text-app-text shadow-2xl"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {title && (
              <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-4">
                <h2 className="text-lg font-bold text-app-text">{title}</h2>
                <button
                  type="button"
                  aria-label="Закрыть"
                  onClick={onClose}
                  className="relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-[background-color,color,scale] duration-150 ease-[var(--rg-ease)] before:absolute before:left-1/2 before:top-1/2 before:h-10 before:w-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-surface-2 hover:text-app-text active:scale-[0.96]"
                >
                  <X size={18} strokeWidth={1.75} />
                </button>
              </header>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
