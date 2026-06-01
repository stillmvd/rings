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
const GAP = 14;
const ARROW = 14;

export function Popover({ open, anchor, onClose, children, width = 340 }: PopoverProps) {
  const mounted = useMounted();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const arrowTopRef = useRef<HTMLSpanElement | null>(null);
  const arrowBottomRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const card = cardRef.current;
    const arrowTop = arrowTopRef.current;
    const arrowBottom = arrowBottomRef.current;
    if (!card) return;

    const h = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const side: "top" | "bottom" = anchor.y > vh / 2 ? "top" : "bottom";
    const left = Math.min(Math.max(anchor.x - width / 2, MARGIN), vw - width - MARGIN);
    const top =
      side === "bottom" ? anchor.y + GAP + ARROW / 2 : anchor.y - GAP - ARROW / 2 - h;
    const arrowX = Math.min(Math.max(anchor.x - left, ARROW), width - ARROW);

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.visibility = "visible";

    if (arrowTop) {
      arrowTop.style.left = `${arrowX - ARROW / 2}px`;
      arrowTop.style.display = side === "bottom" ? "block" : "none";
    }
    if (arrowBottom) {
      arrowBottom.style.left = `${arrowX - ARROW / 2}px`;
      arrowBottom.style.display = side === "top" ? "block" : "none";
    }
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
          >
            <span
              ref={arrowTopRef}
              className="absolute -top-[7px] hidden h-[14px] w-[14px] rotate-45 rounded-[2px] border-l border-t border-line bg-surface-1"
            />
            <span
              ref={arrowBottomRef}
              className="absolute -bottom-[7px] hidden h-[14px] w-[14px] rotate-45 rounded-[2px] border-b border-r border-line bg-surface-1"
            />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
