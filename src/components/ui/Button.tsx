"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const HEIGHTS: Record<Size, string> = { sm: "32px", md: "40px", lg: "48px" };
// Tailwind preflight (*{padding:0}) перебивает host-padding md-кнопок (внешнее дерево бьёт
// :host для normal-правил) → лейбл обрезается. Возвращаем M3-модель inline: padding-block
// = (высота − line-height 20px)/2, padding-inline по варианту.
const PAD_BLOCK: Record<Size, string> = { sm: "6px", md: "10px", lg: "14px" };

const dangerTokens: CSSProperties = {
  "--md-filled-button-container-color": "var(--md-sys-color-error)",
  "--md-filled-button-label-text-color": "var(--md-sys-color-on-error)",
  "--md-filled-button-icon-color": "var(--md-sys-color-on-error)",
} as CSSProperties;

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", type = "button", className = "", children, style, ...rest },
  ref,
) {
  const h = HEIGHTS[size];
  const mergedStyle = {
    display: "inline-flex",
    paddingBlock: PAD_BLOCK[size],
    paddingInline: variant === "ghost" ? "12px" : "24px",
    "--md-filled-button-container-height": h,
    "--md-filled-tonal-button-container-height": h,
    "--md-text-button-container-height": h,
    ...(variant === "danger" ? dangerTokens : null),
    ...style,
  } as CSSProperties;

  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</span>
  );
  const common = { ref, type, className, style: mergedStyle, ...rest };

  if (variant === "ghost") return <md-text-button {...common}>{inner}</md-text-button>;
  if (variant === "secondary")
    return <md-filled-tonal-button {...common}>{inner}</md-filled-tonal-button>;
  return <md-filled-button {...common}>{inner}</md-filled-button>;
});
