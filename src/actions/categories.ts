"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  listCategoriesFlat,
  updateCategory,
} from "@/db/queries/categories";

export type CategoryResult = { ok: true; id?: number } | { ok: false; error: string };

type CategoryActionInput = {
  name: string;
  icon: string;
  color: string;
  parentId: number | null;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function validate(input: CategoryActionInput, selfId?: number): string | null {
  if (!input.name.trim()) return "Название не может быть пустым";
  if (!input.icon.trim()) return "Не выбрана иконка";
  if (!HEX_COLOR.test(input.color)) return "Некорректный цвет";

  if (input.parentId !== null) {
    if (selfId != null && input.parentId === selfId) return "Категория не может быть своим родителем";
    const flat = listCategoriesFlat();
    const parent = flat.find((c) => c.id === input.parentId);
    if (!parent) return "Родительская категория не найдена";
    if (parent.parent_id !== null) return "Допустима вложенность только в один уровень";
  }
  return null;
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/settings");
}

export async function createCategoryAction(input: CategoryActionInput): Promise<CategoryResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const id = createCategory({
    name: input.name.trim(),
    icon: input.icon.trim(),
    color: input.color,
    parentId: input.parentId,
  });
  revalidateAll();
  return { ok: true, id };
}

export async function updateCategoryAction(
  id: number,
  input: CategoryActionInput,
): Promise<CategoryResult> {
  const err = validate(input, id);
  if (err) return { ok: false, error: err };

  updateCategory(id, {
    name: input.name.trim(),
    icon: input.icon.trim(),
    color: input.color,
    parentId: input.parentId,
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteCategoryAction(id: number): Promise<CategoryResult> {
  const cat = listCategoriesFlat().find((c) => c.id === id);
  if (!cat) return { ok: false, error: "Категория не найдена" };
  if (cat.is_default) return { ok: false, error: "Нельзя удалить категорию по умолчанию" };

  deleteCategory(id);
  revalidateAll();
  return { ok: true };
}
