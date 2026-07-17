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
      className={`relative grid h-9 w-9 cursor-pointer place-items-center rounded-full text-muted transition-[background-color,color,scale] duration-150 ease-[var(--rg-ease)] before:absolute before:left-1/2 before:top-1/2 before:h-10 before:w-10 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-surface-0 active:scale-[0.96] ${
        danger ? "hover:text-rust" : "hover:text-app-text"
      }`}
    >
      {children}
    </button>
  );
}
