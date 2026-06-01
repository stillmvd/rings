"use client";

import { forwardRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`h-10 rounded-xl border bg-surface-1 px-3 text-sm text-app-text outline-none transition placeholder:text-muted focus:border-accent-500 ${
          error ? "border-tl-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-tl-danger">{error}</span>}
    </div>
  );
});
