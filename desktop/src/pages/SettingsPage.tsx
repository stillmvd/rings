import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { appDataDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import { Mark } from "@/components/brand/Mark";
import { MarkMono } from "@/components/brand/MarkMono";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { MarkTypeManager } from "@/components/settings/MarkTypeManager";
import { BackupPanel } from "@/components/settings/BackupPanel";
import { UpdatePanel } from "@/components/settings/UpdatePanel";
import { useLiveSeconds, setLiveSeconds } from "@/components/birthdays/useLiveSeconds";
import { themeStore, type ThemePref } from "@/lib/theme";
import { closeToTrayStore, trayIconStore, type TrayIconPref } from "@/lib/behavior";
import { notifyBirthdaysStore, notifyRemindersStore } from "@/lib/notifications";
import { useQuery } from "@/lib/useQuery";

const THEME_SEGMENTS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "Системная" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
];

// Превью имитирует панель задач: марка показана на том фоне, ради которого её выбирают.
const TRAY_ICON_OPTIONS: {
  value: TrayIconPref;
  label: string;
  bg: string;
  fg: string;
}[] = [
  { value: "white", label: "Тёмная панель", bg: "#1f1f23", fg: "#ffffff" },
  { value: "black", label: "Светлая панель", bg: "#f3f3f3", fg: "#000000" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-app-text">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm text-app-text">{title}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const theme = themeStore.use();
  const liveSeconds = useLiveSeconds();
  const closeToTray = closeToTrayStore.use() === "1";
  const trayIcon = trayIconStore.use();
  const notifyBirthdays = notifyBirthdaysStore.use() === "1";
  const notifyReminders = notifyRemindersStore.use() === "1";
  const { show } = useToast();
  const { data: version } = useQuery(getVersion);
  const { data: autostart, reload: reloadAutostart } = useQuery(isEnabled);

  async function openDataFolder() {
    try {
      await openPath(await appDataDir());
    } catch (e) {
      show(String(e), "error");
    }
  }

  async function toggleAutostart(next: boolean) {
    try {
      if (next) await enable();
      else await disable();
      reloadAutostart();
    } catch (e) {
      show(String(e), "error");
    }
  }

  return (
    <div className="h-full overflow-y-auto px-10 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            rings · приложение
          </p>
          <h1 className="m-0 text-4xl font-bold leading-none tracking-[-0.045em]">Настройки</h1>
        </div>

        <Section title="Внешний вид" description="Тема оформления приложения.">
          <SegmentedControl
            segments={THEME_SEGMENTS}
            value={theme}
            onChange={(v) => themeStore.set(v)}
          />
        </Section>

        <Section title="Поведение">
          <Row
            title="Запускать при входе в Windows"
            description="Приложение стартует свёрнутым в трей"
          >
            <Switch
              checked={autostart ?? false}
              onChange={toggleAutostart}
              label="Запускать при входе в Windows"
            />
          </Row>
          <Row
            title="Сворачивать в трей при закрытии"
            description="Крестик прячет окно, приложение остаётся в трее"
          >
            <Switch
              checked={closeToTray}
              onChange={(v) => closeToTrayStore.set(v ? "1" : "0")}
              label="Сворачивать в трей при закрытии"
            />
          </Row>
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-sm text-app-text">Иконка в трее</span>
            <span className="text-xs text-muted">
              Выберите марку под цвет своей панели задач
            </span>
            <div className="mt-1.5 flex gap-3">
              {TRAY_ICON_OPTIONS.map((opt) => {
                const active = trayIcon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => trayIconStore.set(opt.value)}
                    className="flex cursor-pointer flex-col items-center gap-1.5"
                  >
                    <span
                      className={`grid h-16 w-24 place-items-center rounded-xl border-2 transition-colors ${
                        active ? "border-amber" : "border-line hover:border-muted"
                      }`}
                      style={{ background: opt.bg, color: opt.fg }}
                    >
                      <MarkMono size={28} />
                    </span>
                    <span className={`text-xs ${active ? "text-app-text" : "text-muted"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="Уведомления">
          <Row
            title="Напоминать о днях рождения"
            description="Windows-уведомление в день рождения, пока приложение запущено"
          >
            <Switch
              checked={notifyBirthdays}
              onChange={(v) => notifyBirthdaysStore.set(v ? "1" : "0")}
              label="Напоминать о днях рождения"
            />
          </Row>
          <Row
            title="Уведомления о напоминаниях"
            description="Срабатывания, пропущенные и предварительные оповещения раздела «Напоминания»"
          >
            <Switch
              checked={notifyReminders}
              onChange={(v) => notifyRemindersStore.set(v ? "1" : "0")}
              label="Уведомления о напоминаниях"
            />
          </Row>
        </Section>

        <Section title="Дни рождения">
          <Row
            title="Живой отсчёт секунд"
            description="Тикающие секунды на карточках в последние дни до дня рождения"
          >
            <Switch
              checked={liveSeconds}
              onChange={setLiveSeconds}
              label="Живой отсчёт секунд"
            />
          </Row>
        </Section>

        <Section title="Обновления" description="Новые версии приходят с GitHub.">
          <UpdatePanel />
        </Section>

        <Section title="Бэкап" description="Архив с базой и фотографиями в выбранной папке.">
          <BackupPanel />
        </Section>

        <Section title="Данные" description="База и медиа хранятся в папке приложения.">
          <div>
            <Button variant="secondary" onClick={openDataFolder}>
              <FolderOpen size={15} />
              Открыть папку данных
            </Button>
          </div>
        </Section>

        <Section title="Справочники" description="Категории событий и типы быстрых отметок.">
          <CategoryManager />
          <MarkTypeManager />
        </Section>

        <Section title="О приложении">
          <div className="flex items-center gap-3">
            <Mark size={40} />
            <div>
              <p className="m-0 text-sm font-semibold text-app-text">Rings</p>
              <p className="m-0 text-sm text-muted">Личный таймлайн жизни · версия {version ?? "—"}</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
