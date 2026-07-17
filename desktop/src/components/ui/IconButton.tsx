import type { ReactNode } from "react";

export function IconButton({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-7 w-7 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-0 ${
        danger ? "hover:text-rust" : "hover:text-app-text"
      }`}
    >
      {children}
    </button>
  );
}
