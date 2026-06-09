"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

export interface PopoverAnchor {
  x: number;
  y: number;
}

interface PopoverProps {
  open: boolean;
  anchor: PopoverAnchor | null;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const MARGIN = 12;

export function Popover({ open, anchor, onClose, children, width = 340 }: PopoverProps) {
  const mounted = useMounted();
  const cardRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const card = cardRef.current;
    if (!card) return;

    const h = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const left = Math.min(Math.max(anchor.x - width / 2, MARGIN), vw - width - MARGIN);
    const top = Math.min(Math.max((vh - h) / 2, MARGIN), vh - h - MARGIN);

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.visibility = "visible";
  });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && anchor && (
        <>
          <div className="fixed inset-0 z-[80]" onMouseDown={onClose} />
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.18 }}
            style={{ position: "fixed", left: -9999, top: -9999, width, visibility: "hidden" }}
            className="z-[81] rounded-card border border-line bg-surface-1 p-4 shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
