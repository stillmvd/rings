import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export function SideSheet({
  open,
  onClose,
  title,
  width = 390,
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
        <>
          <motion.div
            className="fixed inset-0 z-[80]"
            style={{ background: "color-mix(in srgb, #000 45%, transparent)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 z-[81] flex h-screen flex-col rounded-l-3xl bg-surface-1 text-app-text shadow-2xl"
            style={{ width }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 px-6 pb-2 pt-5">
              <h2 className="text-lg font-bold text-app-text">{title}</h2>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition-[background-color,color,scale] duration-150 ease-[var(--rg-ease)] hover:bg-surface-2 hover:text-app-text active:scale-[0.96]"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
