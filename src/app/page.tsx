import Link from "next/link";
import { Settings } from "lucide-react";
import { TimelineStage } from "@/components/timeline/TimelineStage";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getEventsInRange } from "@/db/queries/events";
import { listCategories } from "@/db/queries/categories";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";

export default function Home() {
  const events = getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);
  const categories = listCategories();
  return (
    <main className="h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <TimelineStage events={events} categories={categories} />
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Настройки"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1/80 text-muted backdrop-blur transition-colors hover:text-app-text"
        >
          <Settings size={18} />
        </Link>
      </div>
    </main>
  );
}
