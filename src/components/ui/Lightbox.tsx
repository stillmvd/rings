"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxImage {
  key: string;
  src: string;
}

interface LightboxProps {
  open: boolean;
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export function Lightbox({ open, images, index, onIndexChange, onClose }: LightboxProps) {
  const mounted = useMounted();
  const count = images.length;
  const safeIndex = count ? ((index % count) + count) % count : 0;

  useEffect(() => {
    if (!open || count === 0) return;
    // Capture + stopImmediatePropagation: перехватываем клавиши раньше Popover,
    // чтобы Esc закрывал только lightbox, а не лежащий под ним попавер.
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.stopImmediatePropagation();
        onIndexChange((safeIndex - 1 + count) % count);
      } else if (e.key === "ArrowRight") {
        e.stopImmediatePropagation();
        onIndexChange((safeIndex + 1) % count);
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, count, safeIndex, onClose, onIndexChange]);

  if (!mounted) return null;

  const current = images[safeIndex];
  const multiple = count > 1;

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={onClose}
        >
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {multiple && (
            <button
              type="button"
              aria-label="Предыдущее фото"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onIndexChange((safeIndex - 1 + count) % count)}
              className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <motion.img
            key={current.key}
            src={current.src}
            alt=""
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />

          {multiple && (
            <button
              type="button"
              aria-label="Следующее фото"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onIndexChange((safeIndex + 1) % count)}
              className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {multiple && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {safeIndex + 1} / {count}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
