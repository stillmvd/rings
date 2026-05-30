import "server-only";
import type Database from "better-sqlite3";

type SeedCategory = {
  name: string;
  icon: string;
  color: string;
  isDefault?: boolean;
  children?: Array<{ name: string; icon: string; color?: string }>;
};

const SEED_CATEGORIES: SeedCategory[] = [
  { name: "Общее", icon: "Circle", color: "#64748b", isDefault: true },
  {
    name: "Авто",
    icon: "Car",
    color: "#3b82f6",
    children: [
      { name: "Ремонт", icon: "Wrench" },
      { name: "Заправки", icon: "Fuel" },
    ],
  },
  { name: "Животные", icon: "PawPrint", color: "#f97316" },
];

export function seedIfEmpty(db: Database.Database): void {
  const row = db.prepare<[], { c: number }>("SELECT COUNT(*) AS c FROM categories").get();
  if ((row?.c ?? 0) > 0) return;

  const insert = db.prepare(
    `INSERT INTO categories(name, icon, color, parent_id, sort_order, is_default)
     VALUES(?, ?, ?, ?, ?, ?)`,
  );

  const seed = db.transaction(() => {
    SEED_CATEGORIES.forEach((cat, index) => {
      const res = insert.run(cat.name, cat.icon, cat.color, null, index, cat.isDefault ? 1 : 0);
      const parentId = Number(res.lastInsertRowid);
      cat.children?.forEach((child, childIndex) => {
        insert.run(child.name, child.icon, child.color ?? cat.color, parentId, childIndex, 0);
      });
    });
  });
  seed();
}
