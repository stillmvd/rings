import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ContextMenuItem = {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onSelect: () => void;
};

export function ContextMenu({
  open,
  x,
  y,
  items,
  onClose,
}: {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", close);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", close);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed z-[120] min-w-44 overflow-hidden rounded-xl border border-line bg-surface-1 py-1 shadow-2xl"
      style={{ left: Math.min(x, window.innerWidth - 180), top: Math.min(y, window.innerHeight - 100) }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            item.onSelect();
            onClose();
          }}
          className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
            item.danger ? "text-rust" : "text-app-text"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
