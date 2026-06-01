"use client";

import { forwardRef, useId } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className = "", id, rows = 3, ...props },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`resize-none rounded-xl border bg-surface-1 px-3 py-2 text-sm text-app-text outline-none transition placeholder:text-muted focus:border-accent-500 ${
          error ? "border-tl-danger" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-tl-danger">{error}</span>}
    </div>
  );
});
