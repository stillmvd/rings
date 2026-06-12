"use client";

import { useEffect, useRef } from "react";
import { resolveIcon } from "@/lib/icons";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string | null;
  color?: string | null;
}

interface SelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

type MdSelect = HTMLElement & { value: string };

export function Select({ options, value, onChange, label, disabled }: SelectProps) {
  const ref = useRef<MdSelect>(null);
  const current = value ?? "";

  // Значение md-select — DOM-свойство; ре-синхронизируем при смене value/набора опций.
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== current) el.value = current;
  }, [current, options]);

  return (
    <md-outlined-select
      ref={ref}
      label={label}
      disabled={disabled}
      style={{ width: "100%" }}
      onChange={(e) => onChange((e.target as MdSelect).value)}
    >
      {options.map((opt) => {
        const Icon = opt.icon ? resolveIcon(opt.icon) : null;
        return (
          <md-select-option key={opt.value} value={opt.value} selected={opt.value === current}>
            {Icon && (
              <Icon slot="start" size={18} style={opt.color ? { color: opt.color } : undefined} />
            )}
            <div slot="headline">{opt.label}</div>
          </md-select-option>
        );
      })}
    </md-outlined-select>
  );
}
