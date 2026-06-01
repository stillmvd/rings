import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories } from "@/db/queries/categories";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BackupPanel } from "@/components/settings/BackupPanel";

export const metadata = {
  title: "Настройки — Timeline",
};

export default function SettingsPage() {
  const categories = listCategories();
  return (
    <main className="min-h-screen w-full overflow-y-auto bg-surface-0 text-app-text">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
        <header className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="На таймлайн"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-1 text-muted transition-colors hover:text-app-text"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-semibold">Настройки</h1>
        </header>

        <section className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-app-text">Оформление</h2>
          <ThemeToggle />
        </section>

        <CategoryManager categories={categories} />

        <BackupPanel />
      </div>
    </main>
  );
}
