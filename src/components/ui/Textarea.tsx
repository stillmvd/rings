"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface TextareaProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
}

type MdField = HTMLElement & { value: string };

export const Textarea = forwardRef<HTMLElement, TextareaProps>(function Textarea(
  { label, error, value, onChange, placeholder, rows = 3, disabled, className = "", id },
  ref,
) {
  const innerRef = useRef<MdField>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLElement);

  useEffect(() => {
    const el = innerRef.current;
    if (el && el.value !== value) el.value = value;
  }, [value]);

  return (
    <md-outlined-text-field
      ref={innerRef}
      id={id}
      type="textarea"
      rows={rows}
      className={className}
      style={{ width: "100%" }}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      error={Boolean(error)}
      error-text={error ?? ""}
      onInput={(e) => onChange((e.target as MdField).value)}
    />
  );
});
