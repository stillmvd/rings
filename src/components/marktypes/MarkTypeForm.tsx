"use client";

import { useState } from "react";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/colors";
import { Input } from "@/components/ui/Input";
import { IconPicker } from "@/components/ui/IconPicker";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Button } from "@/components/ui/Button";

export interface MarkTypeFormPayload {
  name: string;
  icon: string;
  color: string;
}

interface MarkTypeFormProps {
  initial?: Partial<MarkTypeFormPayload>;
  mode: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: MarkTypeFormPayload) => void;
  onCancel: () => void;
}

export function MarkTypeForm({
  initial,
  mode,
  submitting = false,
  onSubmit,
  onCancel,
}: MarkTypeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "Circle");
  const [color, setColor] = useState(initial?.color ?? DEFAULT_CATEGORY_COLOR);
  const [nameError, setNameError] = useState<string>();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Название не может быть пустым");
      return;
    }
    setNameError(undefined);
    onSubmit({ name: name.trim(), icon, color });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Название"
        value={name}
        onChange={setName}
        error={nameError}
        autoFocus
        placeholder="Название отметки"
      />

      <div className="grid grid-cols-2 gap-4">
        <IconPicker label="Иконка" value={icon} onChange={setIcon} color={color} />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">Предпросмотр</span>
          <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface-1 px-3">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <span className="truncate text-sm text-app-text">{name.trim() || "—"}</span>
          </div>
        </div>
      </div>

      <ColorPicker label="Цвет" value={color} onChange={setColor} />

      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "edit" ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}
