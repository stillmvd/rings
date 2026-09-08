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
      className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-surface-2 text-app-text transition-[background-color,color,scale] duration-150 ease-[var(--rg-ease)] hover:bg-surface-3 active:scale-[0.96] ${
        danger ? "hover:text-rust" : ""
      }`}
    >
      {children}
    </button>
  );
}
