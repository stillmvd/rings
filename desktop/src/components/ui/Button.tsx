import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-amber text-ink hover:brightness-105",
  secondary: "bg-tonal text-app-text hover:bg-tonal-hover",
  ghost: "text-muted hover:bg-surface-2 hover:text-app-text",
  danger: "bg-rust text-white hover:brightness-110",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 h-10 rounded-full px-5 text-sm font-medium transition-[background-color,color,filter,scale] duration-150 ease-[var(--rg-ease)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
