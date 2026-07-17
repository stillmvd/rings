import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { appDataDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import { Mark } from "@/components/brand/Mark";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { MarkTypeManager } from "@/components/settings/MarkTypeManager";
import { useLiveSeconds, setLiveSeconds } from "@/components/birthdays/useLiveSeconds";
import { themeStore, type ThemePref } from "@/lib/theme";
import { closeToTrayStore, trayIconStore, type TrayIconPref } from "@/lib/behavior";
import { useQuery } from "@/lib/useQuery";

const THEME_SEGMENTS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "Системная" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
];

const TRAY_ICON_SEGMENTS: { value: TrayIconPref; label: string }[] = [
  { value: "white", label: "Тёмная панель" },
  { value: "black", label: "Светлая панель" },
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
        <h2 className="text-base font-semibold text-app-text">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
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
              Белая марка для тёмной панели задач, чёрная — для светлой
            </span>
            <div className="mt-1">
              <SegmentedControl
                segments={TRAY_ICON_SEGMENTS}
                value={trayIcon}
                onChange={(v) => trayIconStore.set(v)}
              />
            </div>
          </div>
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
