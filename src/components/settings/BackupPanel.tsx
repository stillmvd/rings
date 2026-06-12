"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Download, Upload } from "lucide-react";
import { exportDataAction, importDataAction } from "@/actions/backup";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function BackupPanel() {
  const { show } = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ name: string; json: string } | null>(null);

  async function handleExport() {
    setBusy(true);
    try {
      const json = await exportDataAction();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeline-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      show("Данные экспортированы", "success");
    } catch {
      show("Не удалось экспортировать", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const json = await file.text();
    setPendingImport({ name: file.name, json });
  }

  async function confirmImport() {
    if (!pendingImport) return;
    const { json } = pendingImport;
    setPendingImport(null);
    setBusy(true);
    const res = await importDataAction(json);
    setBusy(false);
    if (res.ok) {
      show(`Импортировано: ${res.categories} категорий, ${res.events} событий`, "success");
      router.refresh();
    } else {
      show(res.error, "error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-app-text">Данные</h2>
      <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-app-text">Экспорт</p>
            <p className="text-xs text-muted">Сохранить все категории и события в JSON-файл.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={busy}>
            <Download size={16} /> Экспорт
          </Button>
        </div>

        <div className="h-px bg-line" />

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-app-text">Импорт</p>
            <p className="text-xs text-muted">Загрузить JSON-файл. Все текущие данные будут заменены.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <Upload size={16} /> Импорт
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <AnimatePresence>
        {pendingImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[88] flex items-center justify-center p-4"
            style={{ background: "color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)" }}
            onMouseDown={() => setPendingImport(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", duration: 0.28, bounce: 0.18 }}
              className="w-full max-w-md rounded-[28px] p-6 shadow-2xl"
              style={{
                background: "var(--md-sys-color-surface-container-high)",
                color: "var(--md-sys-color-on-surface)",
              }}
              onMouseDown={(ev) => ev.stopPropagation()}
            >
              <h3 className="mb-2 text-sm font-semibold text-app-text">Заменить все данные?</h3>
              <p className="mb-1 text-sm text-muted">
                Файл «{pendingImport.name}» заменит все текущие категории и события.
              </p>
              <p className="mb-4 text-xs text-tl-danger">Это действие необратимо.</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setPendingImport(null)} disabled={busy}>
                  Отмена
                </Button>
                <Button variant="danger" onClick={confirmImport} disabled={busy}>
                  Заменить
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
