"use client";

import { createElement, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { MarkType } from "@/db/queries/markTypes";
import { resolveIcon } from "@/lib/icons";
import {
  createMarkTypeAction,
  updateMarkTypeAction,
  deleteMarkTypeAction,
} from "@/actions/markTypes";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MarkTypeForm, type MarkTypeFormPayload } from "./MarkTypeForm";

type EditState = { mode: "create" } | { mode: "edit"; type: MarkType } | null;

export function MarkTypeManager({ markTypes }: { markTypes: MarkType[] }) {
  const [edit, setEdit] = useState<EditState>(null);
  const [confirm, setConfirm] = useState<MarkType | null>(null);
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  function handleSubmit(payload: MarkTypeFormPayload) {
    const current = edit;
    setEdit(null);
    startTransition(async () => {
      const res =
        current?.mode === "edit"
          ? await updateMarkTypeAction(current.type.id, payload)
          : await createMarkTypeAction(payload);
      if (res.ok) show(current?.mode === "edit" ? "Тип сохранён" : "Тип создан", "success");
      else show(res.error, "error");
    });
  }

  function handleDelete() {
    const target = confirm;
    setConfirm(null);
    if (!target) return;
    startTransition(async () => {
      const res = await deleteMarkTypeAction(target.id);
      show(res.ok ? "Тип удалён" : res.error, res.ok ? "success" : "error");
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-app-text">Отметки</h2>
        <Button size="sm" onClick={() => setEdit({ mode: "create" })}>
          <Plus size={16} /> Добавить
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-1">
        {markTypes.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">Типов отметок пока нет</p>
        )}
        {markTypes.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${t.color}22` }}
            >
              {createElement(resolveIcon(t.icon), { size: 16, style: { color: t.color } })}
            </span>
            <span className="flex-1 truncate text-sm text-app-text">{t.name}</span>
            <div className="flex items-center gap-1">
              <IconButton label="Редактировать" onClick={() => setEdit({ mode: "edit", type: t })}>
                <Pencil size={15} />
              </IconButton>
              <IconButton label="Удалить" onClick={() => setConfirm(t)} danger>
                <Trash2 size={15} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {edit && (
          <Overlay onClose={() => setEdit(null)}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-text">
                {edit.mode === "edit" ? "Редактирование типа" : "Новый тип отметки"}
              </h3>
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="text-muted transition-colors hover:text-app-text"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
            <MarkTypeForm
              mode={edit.mode}
              submitting={pending}
              initial={
                edit.mode === "edit"
                  ? { name: edit.type.name, icon: edit.type.icon, color: edit.type.color }
                  : undefined
              }
              onSubmit={handleSubmit}
              onCancel={() => setEdit(null)}
            />
          </Overlay>
        )}

        {confirm && (
          <Overlay onClose={() => setConfirm(null)}>
            <h3 className="mb-2 text-sm font-semibold text-app-text">Удалить тип отметки?</h3>
            <p className="mb-4 text-sm text-muted">
              «{confirm.name}» и все отметки этого типа будут удалены безвозвратно.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirm(null)} disabled={pending}>
                Отмена
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={pending}>
                Удалить
              </Button>
            </div>
          </Overlay>
        )}
      </AnimatePresence>
    </section>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-3 ${
        danger ? "hover:text-tl-danger" : "hover:text-app-text"
      }`}
    >
      {children}
    </button>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[88] flex items-center justify-center p-4"
      style={{ background: "color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)" }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", duration: 0.28, bounce: 0.18 }}
        className="w-full max-w-md rounded-[28px] p-6 shadow-2xl"
        style={{
          background: "var(--md-sys-color-surface-container-high)",
          color: "var(--md-sys-color-on-surface)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
