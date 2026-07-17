import type { ComponentType } from "react";
import { Titlebar } from "./components/Titlebar";
import { NavigationRail } from "./components/nav/NavigationRail";
import { ToastProvider } from "./components/ui/Toast";
import { EventsProvider } from "./components/events/EventsProvider";
import { PeopleProvider } from "./components/events/PeopleProvider";
import { SearchHost } from "./components/search/SearchHost";
import { modeStore, type ViewMode } from "./lib/mode";
import { useApplyTheme } from "./lib/theme";
import { useCloseToTray, useApplyTrayIcon } from "./lib/behavior";
import { useBirthdayNotifications } from "./lib/notifications";
import { useAutoBackup } from "./lib/backup";
import { SettingsPage } from "./pages/SettingsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { CalendarPage } from "./pages/CalendarPage";
import { TrackingPage } from "./pages/TrackingPage";
import { BirthdaysPage } from "./pages/BirthdaysPage";
import { TimelinePage } from "./pages/TimelinePage";

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
  useCloseToTray();
  useApplyTrayIcon();
  useBirthdayNotifications();
  useAutoBackup();
  const mode = modeStore.use();
  const Page = PAGES[mode];

  return (
    <ToastProvider>
      <EventsProvider>
        <PeopleProvider>
          <div className="flex h-screen flex-col bg-surface-0 text-app-text">
            <Titlebar />
            <div className="flex min-h-0 flex-1">
              <NavigationRail />
              <main className="min-h-0 flex-1 overflow-hidden">
                <Page />
              </main>
            </div>
          </div>
          <SearchHost />
        </PeopleProvider>
      </EventsProvider>
    </ToastProvider>
  );
}
