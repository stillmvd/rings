import { createElement, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import { useQuery } from "@/lib/useQuery";
import { bumpDataVersion } from "@/lib/dataVersion";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/db/queries/categories";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { CategoryForm, type CategoryFormPayload } from "./CategoryForm";

type EditState =
  | { mode: "create"; parentId: number | null }
  | { mode: "edit"; category: Category }
  | null;

export function CategoryManager() {
  const { data: categories } = useQuery(listCategories);
  const { show } = useToast();
  const [edit, setEdit] = useState<EditState>(null);
  const [confirm, setConfirm] = useState<{ category: Category; hasChildren: boolean } | null>(null);
  const [pending, setPending] = useState(false);

  const roots = categories ?? [];

  async function handleSubmit(payload: CategoryFormPayload) {
    const current = edit;
    setEdit(null);
    setPending(true);
    try {
      if (current?.mode === "edit") {
        await updateCategory(current.category.id, {
          ...payload,
          sortOrder: current.category.sort_order,
        });
      } else {
        await createCategory(payload);
      }
      bumpDataVersion();
      show(current?.mode === "edit" ? "Категория сохранена" : "Категория создана", "success");
    } catch (e) {
      show(String(e), "error");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    const target = confirm;
    setConfirm(null);
    if (!target) return;
    setPending(true);
    try {
      await deleteCategory(target.category.id);
      bumpDataVersion();
      show("Категория удалена", "success");
    } catch (e) {
      show(String(e), "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-app-text">Категории</h3>
        <Button variant="secondary" onClick={() => setEdit({ mode: "create", parentId: null })}>
          <Plus size={15} strokeWidth={1.75} /> Добавить
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-1">
        {roots.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">Категорий пока нет</p>
        )}
        {roots.map((root) => (
          <div key={root.id}>
            <CategoryRow
              category={root}
              onAddChild={() => setEdit({ mode: "create", parentId: root.id })}
              onEdit={() => setEdit({ mode: "edit", category: root })}
              onDelete={() => setConfirm({ category: root, hasChildren: root.children.length > 0 })}
            />
            {root.children.map((child) => (
              <CategoryRow
                key={child.id}
                category={child}
                indented
                onEdit={() => setEdit({ mode: "edit", category: child })}
                onDelete={() => setConfirm({ category: child, hasChildren: false })}
              />
            ))}
          </div>
        ))}
      </div>

      <Dialog
        open={edit !== null}
        onClose={() => setEdit(null)}
        width={640}
        title={
          edit?.mode === "edit"
            ? "Редактирование категории"
            : edit?.parentId != null
              ? "Новая подкатегория"
              : "Новая категория"
        }
      >
        {edit && (
          <CategoryForm
            key={edit.mode === "edit" ? `edit-${edit.category.id}` : `create-${edit.parentId}`}
            rootCategories={roots}
            mode={edit.mode}
            submitting={pending}
            lockedParentId={edit.mode === "create" ? edit.parentId : undefined}
            selfId={edit.mode === "edit" ? edit.category.id : undefined}
            initial={
              edit.mode === "edit"
                ? {
                    name: edit.category.name,
                    icon: edit.category.icon,
                    color: edit.category.color,
                    parentId: edit.category.parent_id,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => setEdit(null)}
          />
        )}
      </Dialog>

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)} title="Удалить категорию?" width={380}>
        <p className="text-sm text-app-text">
          «{confirm?.category.name}» будет удалена безвозвратно.
        </p>
        <ul className="mt-2 list-disc pl-5 text-xs text-muted">
          {confirm?.hasChildren && <li>Все подкатегории также будут удалены.</li>}
          <li>События этой категории останутся, но без категории.</li>
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(null)} disabled={pending}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={pending}>
            Удалить
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function CategoryRow({
  category,
  indented = false,
  onAddChild,
  onEdit,
  onDelete,
}: {
  category: Category;
  indented?: boolean;
  onAddChild?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2 ${
        indented ? "pl-10" : ""
      }`}
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
        style={{ background: `${category.color}22` }}
      >
        {createElement(resolveIcon(category.icon), { size: 15, style: { color: category.color } })}
      </span>
      <span className="flex-1 truncate text-sm text-app-text">{category.name}</span>
      {category.is_default === 1 && (
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
          по умолчанию
        </span>
      )}
      <div className="flex items-center gap-2">
        {onAddChild && (
          <IconButton label="Добавить подкатегорию" onClick={onAddChild}>
            <Plus size={15} strokeWidth={1.75} />
          </IconButton>
        )}
        <IconButton label="Редактировать" onClick={onEdit}>
          <Pencil size={15} strokeWidth={1.75} />
        </IconButton>
        {category.is_default !== 1 && (
          <IconButton label="Удалить" onClick={onDelete} danger>
            <Trash2 size={15} strokeWidth={1.75} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
