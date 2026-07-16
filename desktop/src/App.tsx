import type { ComponentType } from "react";
import { Titlebar } from "./components/Titlebar";
import { NavigationRail } from "./components/nav/NavigationRail";
import { modeStore, type ViewMode } from "./lib/mode";
import { useApplyTheme } from "./lib/theme";
import { TimelinePage, SettingsPage } from "./pages/stubs";
import { GalleryPage } from "./pages/GalleryPage";
import { CalendarPage } from "./pages/CalendarPage";
import { TrackingPage } from "./pages/TrackingPage";
import { BirthdaysPage } from "./pages/BirthdaysPage";

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
    <div className="flex h-screen flex-col bg-surface-0 text-app-text">
      <Titlebar />
      <div className="flex min-h-0 flex-1">
        <NavigationRail />
        <main className="min-h-0 flex-1 overflow-hidden">
          <Page />
        </main>
      </div>
    </div>
  );
}
