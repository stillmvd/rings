"use client";

import { Dialog } from "@/components/m3/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SeedPicker } from "@/components/settings/SeedPicker";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { BackupPanel } from "@/components/settings/BackupPanel";
import type { CategoryNode } from "@/db/queries/categories";

export function SettingsDialog({
  open,
  categories,
  onClose,
}: {
  open: boolean;
  categories: CategoryNode[];
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Настройки" maxWidth={640}>
      <div className="flex flex-col gap-8 pt-2">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
              Оформление
            </h3>
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Акцентный цвет
            </span>
            <SeedPicker />
          </div>
        </section>

        <CategoryManager categories={categories} />

        <BackupPanel />
      </div>
    </Dialog>
  );
}
