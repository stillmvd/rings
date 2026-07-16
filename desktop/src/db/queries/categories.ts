import { getDb } from "../database";

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

export async function listCategoriesFlat(): Promise<Category[]> {
  const db = await getDb();
  return db.select<Category[]>(
    `SELECT id, name, icon, color, parent_id, sort_order, is_default
     FROM categories
     ORDER BY sort_order, id`,
  );
}

export async function listCategories(): Promise<CategoryNode[]> {
  const flat = await listCategoriesFlat();
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

export async function createCategory(input: CategoryInput): Promise<number> {
  const db = await getDb();
  const res = await db.execute(
    `INSERT INTO categories(name, icon, color, parent_id, sort_order)
     VALUES(?, ?, ?, ?, ?)`,
    [input.name, input.icon, input.color, input.parentId, input.sortOrder ?? 0],
  );
  return Number(res.lastInsertId);
}

export async function updateCategory(id: number, input: CategoryInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE categories
     SET name = ?, icon = ?, color = ?, parent_id = ?, sort_order = ?
     WHERE id = ?`,
    [input.name, input.icon, input.color, input.parentId, input.sortOrder ?? 0, id],
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM categories WHERE id = ?", [id]);
}
