"use client";

import { Dialog } from "@/components/m3/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SeedPicker } from "@/components/settings/SeedPicker";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { MarkTypeManager } from "@/components/marktypes/MarkTypeManager";
import { BackupPanel } from "@/components/settings/BackupPanel";
import { LiveSecondsToggle } from "@/components/settings/LiveSecondsToggle";
import type { CategoryNode } from "@/db/queries/categories";
import type { MarkType } from "@/db/queries/markTypes";

export function SettingsDialog({
  open,
  categories,
  markTypes,
  onClose,
}: {
  open: boolean;
  categories: CategoryNode[];
  markTypes: MarkType[];
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

        <section className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
            Дни рождения
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-[var(--md-sys-color-on-surface)]">
                Живой отсчёт секунд
              </span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Тикающие секунды на карточках в последние дни до дня рождения
              </span>
            </div>
            <LiveSecondsToggle />
          </div>
        </section>

        <CategoryManager categories={categories} />

        <MarkTypeManager markTypes={markTypes} />

        <BackupPanel />
      </div>
    </Dialog>
  );
}
