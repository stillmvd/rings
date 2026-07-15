import type { ComponentType } from "react";
import { NavigationRail } from "./components/nav/NavigationRail";
import { modeStore, type ViewMode } from "./lib/mode";
import { useApplyTheme } from "./lib/theme";
import {
  TimelinePage,
  GalleryPage,
  CalendarPage,
  TrackingPage,
  BirthdaysPage,
  SettingsPage,
} from "./pages/stubs";

const PAGES: Record<ViewMode, ComponentType> = {
  timeline: TimelinePage,
  gallery: GalleryPage,
  calendar: CalendarPage,
  tracking: TrackingPage,
  birthdays: BirthdaysPage,
  settings: SettingsPage,
};

export default function App() {
  useApplyTheme();
  const mode = modeStore.use();
  const Page = PAGES[mode];

  return (
    <div className="flex h-screen bg-surface-0 text-app-text">
      <NavigationRail />
      <main className="flex-1 overflow-auto">
        <Page />
      </main>
    </div>
  );
}
