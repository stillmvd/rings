"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cake, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { filterAcceptedImages, ACCEPTED_IMAGE_TYPES } from "@/components/timeline/MediaUploader";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import type { PersonFormPayload, PersonPhotoChange } from "./useBirthdayCrud";

export interface PersonFormValues {
  name: string;
  birthDate: string;
  hasYear: boolean;
  photo: string | null;
}

interface PersonFormProps {
  initial?: Partial<PersonFormValues>;
  mode?: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: PersonFormPayload) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const withYear2000 = (iso: string) => `2000-${iso.slice(5)}`;

export function PersonForm({
  initial,
  mode = "create",
  submitting = false,
  onSubmit,
  onCancel,
  onDelete,
}: PersonFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [hasYear, setHasYear] = useState(initial?.hasYear ?? true);
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");

  const [existingPhoto, setExistingPhoto] = useState<string | null>(initial?.photo ?? null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const [nameError, setNameError] = useState<string>();
  const [dateError, setDateError] = useState<string>();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const avatarSrc = pendingUrl ?? (existingPhoto ? `/media/${existingPhoto}` : null);

  const pickFile = useCallback(
    (files: FileList | File[]) => {
      const accepted = filterAcceptedImages(files);
      if (!accepted.length) return;
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
      const url = URL.createObjectURL(accepted[0]);
      setPendingFile(accepted[0]);
      setPendingUrl(url);
    },
    [pendingUrl],
  );

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const files = filterAcceptedImages(
        Array.from(e.clipboardData.items)
          .filter((it) => it.kind === "file")
          .map((it) => it.getAsFile())
          .filter((f): f is File => f !== null),
      );
      if (!files.length) return;
      e.preventDefault();
      pickFile(files);
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [pickFile]);

  function clearAvatar() {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingFile(null);
    setPendingUrl(null);
    setExistingPhoto(null);
  }

  function photoChange(): PersonPhotoChange {
    if (pendingFile) return { kind: "set", file: pendingFile };
    if (!existingPhoto && initial?.photo) return { kind: "remove" };
    return { kind: "keep" };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError("Имя не может быть пустым");
      valid = false;
    } else {
      setNameError(undefined);
    }

    if (!isValidISODate(birthDate)) {
      setDateError("Выберите дату рождения");
      valid = false;
    } else if (hasYear && (birthDate < TIMELINE_MIN_DATE || birthDate > todayISO())) {
      setDateError("Дата рождения вне диапазона");
      valid = false;
    } else {
      setDateError(undefined);
    }

    if (!valid) return;

    onSubmit({
      name: name.trim(),
      birthDate: hasYear ? birthDate : withYear2000(birthDate),
      hasYear,
      photo: photoChange(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">Фото</span>
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--md-sys-color-outline-variant)]"
            style={{ background: "var(--md-sys-color-tertiary-container)" }}
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <Cake size={28} strokeWidth={1.5} style={{ color: "var(--md-sys-color-on-tertiary-container)" }} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              <ImagePlus size={16} />
              {avatarSrc ? "Заменить" : "Загрузить"}
            </Button>
            {avatarSrc && (
              <Button type="button" variant="ghost" onClick={clearAvatar}>
                <X size={16} />
                Убрать
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) pickFile(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
          Можно вставить из буфера (Ctrl+V)
        </span>
      </div>

      <Input
        label="Имя"
        value={name}
        onChange={setName}
        error={nameError}
        autoFocus
        placeholder="Кого добавляем?"
      />

      <SegmentedControl
        label="Год рождения"
        segments={[
          { value: "known", label: "Известен" },
          { value: "unknown", label: "Неизвестен" },
        ]}
        value={hasYear ? "known" : "unknown"}
        onChange={(v) => setHasYear(v === "known")}
      />

      <DatePicker
        label={hasYear ? "Дата рождения" : "День и месяц (год не учитывается)"}
        value={birthDate}
        onChange={setBirthDate}
        error={dateError}
        min={TIMELINE_MIN_DATE}
        max={hasYear ? todayISO() : TIMELINE_MAX_DATE}
      />

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
            {mode === "edit" ? "Сохранить" : "Добавить"}
          </Button>
        </div>
      </div>
    </form>
  );
}
