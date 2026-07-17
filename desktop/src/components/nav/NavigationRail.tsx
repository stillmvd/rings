import {
  Waypoints,
  LayoutGrid,
  CalendarDays,
  Target,
  Cake,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import { Mark } from "../brand/Mark";
import { modeStore, type ViewMode } from "../../lib/mode";
import { themeStore, type ThemePref } from "../../lib/theme";
import { searchOpenStore } from "../../lib/search";

const DESTINATIONS: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: "timeline", label: "Таймлайн", icon: Waypoints },
  { value: "gallery", label: "Галерея", icon: LayoutGrid },
  { value: "calendar", label: "Календарь", icon: CalendarDays },
  { value: "tracking", label: "Отслеживание", icon: Target },
  { value: "birthdays", label: "Дни рождения", icon: Cake },
];

const THEME_CYCLE: Record<ThemePref, ThemePref> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const THEME_ICON: Record<ThemePref, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const THEME_LABEL: Record<ThemePref, string> = {
  system: "Тема: системная",
  light: "Тема: светлая",
  dark: "Тема: тёмная",
};

function RailButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-amber text-ink"
          : "text-muted hover:bg-surface-1 hover:text-app-text"
      }`}
    >
      <Icon size={20} />
    </button>
  );
}

export function NavigationRail() {
  const mode = modeStore.use();
  const theme = themeStore.use();

  return (
    <nav
      aria-label="Основная навигация"
      className="flex h-full w-16 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface-0 py-4"
    >
      <div className="mb-3">
        <Mark size={34} />
      </div>

      {DESTINATIONS.map(({ value, label, icon }) => (
        <RailButton
          key={value}
          label={label}
          icon={icon}
          active={mode === value}
          onClick={() => modeStore.set(value)}
        />
      ))}

      <div className="flex-1" />

      <RailButton
        label="Поиск (/)"
        icon={Search}
        onClick={() => searchOpenStore.set(true)}
      />
      <RailButton
        label={THEME_LABEL[theme]}
        icon={THEME_ICON[theme]}
        onClick={() => themeStore.set(THEME_CYCLE[theme])}
      />
      <RailButton
        label="Настройки"
        icon={Settings}
        active={mode === "settings"}
        onClick={() => modeStore.set("settings")}
      />
    </nav>
  );
}
