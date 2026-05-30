import "server-only";
import { getDb } from "../client";

export type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  parent_id: number | null;
  sort_order: number;
  is_default: number;
};

export type CategoryNode = Category & { children: Category[] };

export type CategoryInput = {
  name: string;
  icon: string;
  color: string;
  parentId: number | null;
  sortOrder?: number;
};

export function listCategoriesFlat(): Category[] {
  return getDb()
    .prepare<[], Category>(
      `SELECT id, name, icon, color, parent_id, sort_order, is_default
       FROM categories
       ORDER BY sort_order, id`,
    )
    .all();
}

export function listCategories(): CategoryNode[] {
  const flat = listCategoriesFlat();
  const roots: CategoryNode[] = [];
  const byId = new Map<number, CategoryNode>();

  for (const cat of flat) {
    if (cat.parent_id === null) {
      const node: CategoryNode = { ...cat, children: [] };
      byId.set(cat.id, node);
      roots.push(node);
    }
  }
  for (const cat of flat) {
    if (cat.parent_id !== null) {
      byId.get(cat.parent_id)?.children.push(cat);
    }
  }
  return roots;
}

export function createCategory(input: CategoryInput): number {
  const res = getDb()
    .prepare(
      `INSERT INTO categories(name, icon, color, parent_id, sort_order)
       VALUES(?, ?, ?, ?, ?)`,
    )
    .run(input.name, input.icon, input.color, input.parentId, input.sortOrder ?? 0);
  return Number(res.lastInsertRowid);
}

export function updateCategory(id: number, input: CategoryInput): void {
  getDb()
    .prepare(
      `UPDATE categories
       SET name = ?, icon = ?, color = ?, parent_id = ?, sort_order = ?
       WHERE id = ?`,
    )
    .run(input.name, input.icon, input.color, input.parentId, input.sortOrder ?? 0, id);
}

export function deleteCategory(id: number): void {
  // Подкатегории удаляются каскадно (ON DELETE CASCADE),
  // события открепляются (events.category_id ON DELETE SET NULL).
  getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
}
