"use client";

import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  secondary: "bg-surface-3 text-app-text hover:bg-surface-4",
  ghost: "bg-transparent text-app-text hover:bg-surface-2",
  danger: "bg-tl-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", type = "button", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // eslint-disable-next-line react/button-has-type
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});
