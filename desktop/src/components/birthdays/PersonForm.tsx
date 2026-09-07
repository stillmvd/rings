import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cake, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { filterAcceptedImages, ACCEPTED_IMAGE_TYPES } from "@/lib/media";
import { mediaSrc } from "@/lib/paths";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";
import { todayISO } from "@/lib/dates";

export type PersonPhotoChange =
  | { kind: "keep" }
  | { kind: "set"; file: File }
  | { kind: "remove" };

export type PersonFormPayload = {
  name: string;
  birthDate: string;
  hasYear: boolean;
  photo: PersonPhotoChange;
};

export interface PersonFormValues {
  name: string;
  birthDate: string;
  hasYear: boolean;
  photo: string | null;
}

const AMBER_CONTAINER = "var(--ds-surface-2)";
const withYear2000 = (iso: string) => `2000-${iso.slice(5)}`;

interface PersonFormProps {
  initial?: Partial<PersonFormValues>;
  mode?: "create" | "edit";
  submitting?: boolean;
  onSubmit: (payload: PersonFormPayload) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

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
  const [avatarHover, setAvatarHover] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const avatarSrc = pendingUrl ?? (existingPhoto ? mediaSrc(existingPhoto) : null);

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
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col gap-3.5">
      <div className="relative px-2 pt-1">
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          onHoverStart={() => setAvatarHover(true)}
          onHoverEnd={() => setAvatarHover(false)}
          whileTap={{ scale: 0.98 }}
          className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl"
          style={{ background: AMBER_CONTAINER }}
        >
          {avatarSrc && (
            <motion.img
              src={avatarSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              animate={{ scale: avatarHover ? 1.05 : 1, filter: avatarHover ? "brightness(0.6)" : "brightness(1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            {avatarHover ? (
              <motion.span
                key="upload"
                className="relative"
                style={{ color: avatarSrc ? "#fff" : "var(--rg-amber)" }}
                initial={{ scale: 0.3, opacity: 0, rotate: -35 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0, rotate: 35 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <ImagePlus size={44} strokeWidth={1.5} />
              </motion.span>
            ) : (
              !avatarSrc && (
                <motion.span
                  key="cake"
                  className="relative"
                  style={{ color: "var(--rg-amber)" }}
                  initial={{ scale: 0.3, opacity: 0, rotate: 35 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.3, opacity: 0, rotate: -35 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <Cake size={44} strokeWidth={1.5} />
                </motion.span>
              )
            )}
          </AnimatePresence>
        </motion.button>
        {avatarSrc && (
          <button
            type="button"
            aria-label="Убрать фото"
            onClick={clearAvatar}
            className="absolute right-4 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
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

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
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
