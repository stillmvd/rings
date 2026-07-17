import { createElement, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import { useQuery } from "@/lib/useQuery";
import { bumpDataVersion } from "@/lib/dataVersion";
import {
  listMarkTypes,
  createMarkType,
  updateMarkType,
  deleteMarkType,
  type MarkType,
} from "@/db/queries/markTypes";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { MarkTypeForm, type MarkTypeFormPayload } from "./MarkTypeForm";

type EditState = { mode: "create" } | { mode: "edit"; type: MarkType } | null;

export function MarkTypeManager() {
  const { data: markTypes } = useQuery(listMarkTypes);
  const { show } = useToast();
  const [edit, setEdit] = useState<EditState>(null);
  const [confirm, setConfirm] = useState<MarkType | null>(null);
  const [pending, setPending] = useState(false);

  const types = markTypes ?? [];

  async function handleSubmit(payload: MarkTypeFormPayload) {
    const current = edit;
    setEdit(null);
    setPending(true);
    try {
      if (current?.mode === "edit") {
        await updateMarkType(current.type.id, { ...payload, sortOrder: current.type.sort_order });
      } else {
        await createMarkType(payload);
      }
      bumpDataVersion();
      show(current?.mode === "edit" ? "Тип сохранён" : "Тип создан", "success");
    } catch (e) {
      show(String(e), "error");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(type: MarkType) {
    setPending(true);
    try {
      await deleteMarkType(type.id);
      bumpDataVersion();
      show("Тип удалён", "success");
    } catch (e) {
      show(String(e), "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-app-text">Типы отметок</h3>
        <Button variant="secondary" onClick={() => setEdit({ mode: "create" })}>
          <Plus size={15} /> Добавить
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-1">
        {types.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">Типов отметок пока нет</p>
        )}
        {types.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-0"
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
              style={{ background: `${t.color}22` }}
            >
              {createElement(resolveIcon(t.icon), { size: 15, style: { color: t.color } })}
            </span>
            <span className="flex-1 truncate text-sm text-app-text">{t.name}</span>
            <div className="flex items-center gap-2">
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

      <Dialog
        open={edit !== null}
        onClose={() => setEdit(null)}
        width={640}
        title={edit?.mode === "edit" ? "Редактирование типа" : "Новый тип отметки"}
      >
        {edit && (
          <MarkTypeForm
            key={edit.mode === "edit" ? `edit-${edit.type.id}` : "create"}
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
        )}
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        title="Удалить тип отметки?"
        message={`«${confirm?.name}» и все отметки этого типа будут удалены безвозвратно.`}
        onConfirm={() => confirm && handleDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
