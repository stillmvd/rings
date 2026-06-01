"use client";

import { createElement, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Category, CategoryNode } from "@/db/queries/categories";
import { resolveIcon } from "@/lib/icons";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/categories";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CategoryForm, type CategoryFormPayload } from "./CategoryForm";

type EditState =
  | { mode: "create"; parentId: number | null }
  | { mode: "edit"; category: Category }
  | null;

export function CategoryManager({ categories }: { categories: CategoryNode[] }) {
  const [edit, setEdit] = useState<EditState>(null);
  const [confirm, setConfirm] = useState<{ category: Category; hasChildren: boolean } | null>(
    null,
  );
  const { show } = useToast();
  const [pending, startTransition] = useTransition();

  function handleSubmit(payload: CategoryFormPayload) {
    const current = edit;
    setEdit(null);
    startTransition(async () => {
      const res =
        current?.mode === "edit"
          ? await updateCategoryAction(current.category.id, payload)
          : await createCategoryAction(payload);
      if (res.ok) {
        show(current?.mode === "edit" ? "Категория сохранена" : "Категория создана", "success");
      } else {
        show(res.error, "error");
      }
    });
  }

  function handleDelete() {
    const target = confirm;
    setConfirm(null);
    if (!target) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(target.category.id);
      show(res.ok ? "Категория удалена" : res.error, res.ok ? "success" : "error");
    });
  }

  const rootCategories: Category[] = categories;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-app-text">Категории</h2>
        <Button size="sm" onClick={() => setEdit({ mode: "create", parentId: null })}>
          <Plus size={16} /> Добавить
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-surface-1">
        {categories.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">Категорий пока нет</p>
        )}
        {categories.map((root) => (
          <div key={root.id}>
            <CategoryRow
              category={root}
              onAddChild={() => setEdit({ mode: "create", parentId: root.id })}
              onEdit={() => setEdit({ mode: "edit", category: root })}
              onDelete={() =>
                setConfirm({ category: root, hasChildren: root.children.length > 0 })
              }
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

      <AnimatePresence>
        {edit && (
          <Overlay onClose={() => setEdit(null)}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-app-text">
                {edit.mode === "edit"
                  ? "Редактирование категории"
                  : edit.parentId !== null
                    ? "Новая подкатегория"
                    : "Новая категория"}
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
            <CategoryForm
              rootCategories={rootCategories}
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
          </Overlay>
        )}

        {confirm && (
          <Overlay onClose={() => setConfirm(null)}>
            <h3 className="mb-2 text-sm font-semibold text-app-text">Удалить категорию?</h3>
            <p className="mb-1 text-sm text-muted">
              «{confirm.category.name}» будет удалена безвозвратно.
            </p>
            <ul className="mb-4 list-disc pl-5 text-xs text-muted">
              {confirm.hasChildren && <li>Все подкатегории также будут удалены.</li>}
              <li>События этой категории останутся, но без категории.</li>
            </ul>
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
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${category.color}22` }}
      >
        {createElement(resolveIcon(category.icon), { size: 16, style: { color: category.color } })}
      </span>
      <span className="flex-1 truncate text-sm text-app-text">{category.name}</span>
      {category.is_default === 1 && (
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-muted">
          по умолчанию
        </span>
      )}
      <div className="flex items-center gap-1">
        {onAddChild && (
          <IconButton label="Добавить подкатегорию" onClick={onAddChild}>
            <Plus size={15} />
          </IconButton>
        )}
        <IconButton label="Редактировать" onClick={onEdit}>
          <Pencil size={15} />
        </IconButton>
        {category.is_default !== 1 && (
          <IconButton label="Удалить" onClick={onDelete} danger>
            <Trash2 size={15} />
          </IconButton>
        )}
      </div>
    </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", duration: 0.28, bounce: 0.18 }}
        className="w-full max-w-md rounded-card border border-line bg-surface-1 p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
