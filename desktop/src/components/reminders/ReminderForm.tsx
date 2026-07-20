import { useState } from "react";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { REPEAT_OPTIONS, type RepeatKind, type RepeatUnit } from "@/lib/reminders";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { IconPicker } from "@/components/ui/IconPicker";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Button } from "@/components/ui/Button";
import type { ReminderInput } from "@/db/queries/reminders";

export interface ReminderFormValues {
  title: string;
  note: string;
  date: string;
  time: string;
  repeat: RepeatKind;
  repeatEvery: number;
  repeatUnit: RepeatUnit;
  preNotifyDays: number;
  nag: boolean;
  nagIntervalMin: number;
  icon: string;
  color: string;
  eventId: number | null;
}

const DEFAULT_ICON = "Bell";
const DEFAULT_COLOR = "#d08f3c";

export function ReminderForm({
  initial,
  mode = "create",
  onSubmit,
  onCancel,
  onDelete,
}: {
  initial?: Partial<ReminderFormValues>;
  mode?: "create" | "edit";
  onSubmit: (payload: ReminderInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [time, setTime] = useState(initial?.time ?? "");
  const [repeat, setRepeat] = useState<RepeatKind>(initial?.repeat ?? "none");
  const [repeatEvery, setRepeatEvery] = useState(String(initial?.repeatEvery ?? 3));
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>(initial?.repeatUnit ?? "day");
  const [preNotifyDays, setPreNotifyDays] = useState(String(initial?.preNotifyDays ?? 0));
  const [nag, setNag] = useState(initial?.nag ?? false);
  const [nagIntervalMin, setNagIntervalMin] = useState(String(initial?.nagIntervalMin ?? 30));
  const [icon, setIcon] = useState(initial?.icon ?? DEFAULT_ICON);
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR);

  const [titleError, setTitleError] = useState<string>();
  const [dateError, setDateError] = useState<string>();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!title.trim()) {
      setTitleError("Название не может быть пустым");
      valid = false;
    } else {
      setTitleError(undefined);
    }

    if (!isValidISODate(date) || date < TIMELINE_MIN_DATE || date > TIMELINE_MAX_DATE) {
      setDateError("Некорректная дата");
      valid = false;
    } else {
      setDateError(undefined);
    }

    if (!valid) return;

    onSubmit({
      title: title.trim(),
      note: note.trim() || null,
      date,
      time: time || null,
      repeat,
      repeatEvery: repeat === "custom" ? Math.max(1, Number(repeatEvery) || 1) : null,
      repeatUnit: repeat === "custom" ? repeatUnit : null,
      preNotifyDays: Math.max(0, Number(preNotifyDays) || 0),
      nag: nag ? 1 : 0,
      nagIntervalMin: nag ? Math.max(1, Number(nagIntervalMin) || 30) : null,
      icon,
      color,
      eventId: initial?.eventId ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <Input
        label="Название"
        value={title}
        onChange={setTitle}
        error={titleError}
        autoFocus
        placeholder="О чём напомнить?"
      />

      <Textarea label="Заметка" value={note} onChange={setNote} placeholder="Детали (необязательно)" />

      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <DatePicker
          label="Дата"
          value={date}
          onChange={setDate}
          error={dateError}
          min={TIMELINE_MIN_DATE}
          max={TIMELINE_MAX_DATE}
        />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">Время</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-line bg-surface-0 px-3 py-2 text-sm text-app-text outline-none transition focus:border-amber"
          />
        </label>
      </div>

      <Select
        label="Повтор"
        options={REPEAT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={repeat}
        onChange={(v) => setRepeat(v as RepeatKind)}
      />

      {repeat === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Каждые"
            value={repeatEvery}
            onChange={setRepeatEvery}
            type="number"
            min={1}
          />
          <Select
            label="Единица"
            options={[
              { value: "day", label: "дней" },
              { value: "week", label: "недель" },
            ]}
            value={repeatUnit}
            onChange={(v) => setRepeatUnit(v as RepeatUnit)}
          />
        </div>
      )}

      <Input
        label="Напомнить заранее, дней (0 — выкл)"
        value={preNotifyDays}
        onChange={setPreNotifyDays}
        type="number"
        min={0}
      />

      <Switch label="Повторять уведомление, пока не выполню" checked={nag} onChange={setNag} />

      {nag && (
        <div className="flex flex-col gap-1">
          <Input
            label="Интервал повтора, минут"
            value={nagIntervalMin}
            onChange={setNagIntervalMin}
            type="number"
            min={1}
          />
          <span className="text-xs text-muted">
            Проверка идёт раз в 15 минут — меньшие интервалы срабатывают с этим шагом.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <IconPicker label="Иконка" value={icon} onChange={setIcon} color={color} />
        <ColorPicker label="Цвет" value={color} onChange={setColor} />
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        {onDelete ? (
          <Button type="button" variant="danger" onClick={onDelete}>
            Удалить
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">{mode === "edit" ? "Сохранить" : "Создать"}</Button>
        </div>
      </div>
    </form>
  );
}
