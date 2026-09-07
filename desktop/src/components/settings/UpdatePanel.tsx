import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/lib/useQuery";
import {
  checkUpdate,
  describeUpdateError,
  formatProgress,
  useUpdateState,
} from "@/lib/updates";

type Phase = "idle" | "checking" | "downloading" | "installing";

export function UpdateWatcher() {
  const { show } = useToast();
  useEffect(() => {
    checkUpdate()
      .then((update) => {
        if (update) show(`Доступна версия ${update.version} — Настройки → Обновления`, "success");
      })
      .catch(() => {});
  }, [show]);
  return null;
}

export function UpdatePanel() {
  const { data: version } = useQuery(getVersion);
  const { update, checkedAt } = useUpdateState();
  const [phase, setPhase] = useState<Phase>("idle");
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runCheck() {
    setPhase("checking");
    setError(null);
    try {
      await checkUpdate();
    } catch (e) {
      setError(describeUpdateError(e));
    } finally {
      setPhase("idle");
    }
  }

  async function runInstall() {
    if (!update) return;
    setError(null);
    setDownloaded(0);
    setTotal(null);
    setPhase("downloading");
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") setTotal(event.data.contentLength ?? null);
        if (event.event === "Progress") setDownloaded((n) => n + event.data.chunkLength);
        if (event.event === "Finished") setPhase("installing");
      });
    } catch (e) {
      setError(describeUpdateError(e));
      setPhase("idle");
    }
  }

  const busy = phase === "downloading" || phase === "installing";
  const percent = total ? Math.round((downloaded / total) * 100) : null;
  const hint = error
    ? null
    : update
      ? "Скачается и поставится, приложение перезапустится"
      : checkedAt === null
        ? "Ещё не проверялось"
        : "Установлена последняя версия";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-app-text">Версия {version ?? "—"}</span>
          {hint && <span className="text-xs text-muted">{hint}</span>}
          {error && <span className="text-xs text-rust">{error}</span>}
        </div>
        <Button variant="secondary" onClick={runCheck} disabled={phase !== "idle"}>
          <RefreshCw size={15} className={phase === "checking" ? "animate-spin" : ""} />
          {phase === "checking" ? "Проверяю…" : "Проверить"}
        </Button>
      </div>

      {update && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-app-text">
                Доступна версия {update.version}
              </span>
              <span className="text-xs text-muted" aria-live="polite">
                {phase === "downloading"
                  ? `Скачивается: ${formatProgress(downloaded, total)}`
                  : phase === "installing"
                    ? "Ставится, приложение сейчас перезапустится"
                    : (update.body ?? "Новая сборка Trail")}
              </span>
            </div>
            <Button onClick={runInstall} disabled={busy}>
              <Download size={15} />
              Обновить
            </Button>
          </div>
          {phase === "downloading" && (
            <div
              className="h-1 overflow-hidden rounded-full bg-surface-0"
              role="progressbar"
              aria-label="Скачивание обновления"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent ?? undefined}
            >
              <div
                className="h-full rounded-full bg-resin transition-transform duration-200 ease-[var(--rg-ease)]"
                style={{ transform: `scaleX(${(percent ?? 0) / 100})`, transformOrigin: "left" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
