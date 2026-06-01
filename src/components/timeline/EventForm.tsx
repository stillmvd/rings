"use client";

import { useState } from "react";
import type { CategoryNode } from "@/db/queries/categories";
import {
  SIGNIFICANCE_VALUES,
  TIMELINE_MIN_DATE,
  TIMELINE_MAX_DATE,
  isValidISODate,
  type Significance,
} from "@/lib/constants";
import { getSignificanceMeta } from "@/lib/significance";
import { todayISO } from "@/lib/dates";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, type SelectOption } from "@/components/ui/Select";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  significance: Significance;
  categoryId: number | null;
  subcategoryId: number | null;
}

export interface EventFormPayload {
  title: string;
  description: string;
  date: string;
  significance: Significance;
  categoryId: number | null;
}

interface EventFormProps {
  categories: CategoryNode[];
  initial?: Partial<EventFormValues>;
  mode?: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: EventFormPayload) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const sigSegments = SIGNIFICANCE_VALUES.map((v) => {
  const meta = getSignificanceMeta(v);
  return { value: String(v), label: meta.label, color: meta.color };
});

export function EventForm({
  categories,
  initial,
  mode = "create",
  submitting = false,
  onSubmit,
  onCancel,
  onDelete,
}: EventFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [significance, setSignificance] = useState<Significance>(
    initial?.significance ?? 1,
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initial?.categoryId ?? null,
  );
  const [subcategoryId, setSubcategoryId] = useState<number | null>(
    initial?.subcategoryId ?? null,
  );

  const [titleError, setTitleError] = useState<string>();
  const [dateError, setDateError] = useState<string>();

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;
  const subOptions: SelectOption[] = (selectedCategory?.children ?? []).map((c) => ({
    value: String(c.id),
    label: c.name,
    icon: c.icon,
    color: c.color,
  }));

  const categoryOptions: SelectOption[] = [
    { value: "", label: "Без категории" },
    ...categories.map((c) => ({
      value: String(c.id),
      label: c.name,
      icon: c.icon,
      color: c.color,
    })),
  ];

  function handleCategoryChange(value: string) {
    setCategoryId(value ? Number(value) : null);
    setSubcategoryId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!title.trim()) {
      setTitleError("Название не может быть пустым");
      valid = false;
    } else {
      setTitleError(undefined);
    }

    if (!isValidISODate(date)) {
      setDateError("Некорректная дата");
      valid = false;
    } else if (date < TIMELINE_MIN_DATE || date > TIMELINE_MAX_DATE) {
      setDateError("Дата вне диапазона таймлайна");
      valid = false;
    } else {
      setDateError(undefined);
    }

    if (!valid) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date,
      significance,
      categoryId: subcategoryId ?? categoryId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <Input
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={titleError}
        autoFocus
        placeholder="Что произошло?"
      />

      <Textarea
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Детали (необязательно)"
      />

      <Input
        label="Дата"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={dateError}
        min={TIMELINE_MIN_DATE}
        max={TIMELINE_MAX_DATE}
      />

      <SegmentedControl
        label="Значимость"
        segments={sigSegments}
        value={String(significance)}
        onChange={(v) => setSignificance(Number(v) as Significance)}
      />

      <Select
        label="Категория"
        options={categoryOptions}
        value={categoryId !== null ? String(categoryId) : ""}
        onChange={handleCategoryChange}
        placeholder="Без категории"
      />

      {subOptions.length > 0 && (
        <Select
          label="Подкатегория"
          options={[{ value: "", label: "—" }, ...subOptions]}
          value={subcategoryId !== null ? String(subcategoryId) : ""}
          onChange={(v) => setSubcategoryId(v ? Number(v) : null)}
          placeholder="—"
        />
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        {onDelete ? (
          <Button type="button" variant="danger" onClick={onDelete} disabled={submitting}>
            Удалить
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Отмена
          </Button>
          <Button type="submit" disabled={submitting}>
            {mode === "edit" ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </div>
    </form>
  );
}
