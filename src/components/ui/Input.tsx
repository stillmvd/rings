"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface InputProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

type MdField = HTMLElement & { value: string };

export const Input = forwardRef<HTMLElement, InputProps>(function Input(
  { label, error, value, onChange, placeholder, type = "text", autoFocus, required, disabled, className = "", id },
  ref,
) {
  const innerRef = useRef<MdField>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLElement);

  // md-text-field — не нативный input: значение задаётся как DOM-свойство.
  useEffect(() => {
    const el = innerRef.current;
    if (el && el.value !== value) el.value = value;
  }, [value]);

  useEffect(() => {
    if (autoFocus) innerRef.current?.focus();
  }, [autoFocus]);

  return (
    <md-outlined-text-field
      ref={innerRef}
      id={id}
      className={className}
      style={{ width: "100%" }}
      label={label}
      placeholder={placeholder}
      type={type}
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      error-text={error ?? ""}
      onInput={(e) => onChange((e.target as MdField).value)}
    />
  );
});
