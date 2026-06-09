import { AppShell } from "@/components/AppShell";
import { getEventsInRange } from "@/db/queries/events";
import { listCategories } from "@/db/queries/categories";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";

export default function Home() {
  const events = getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);
  const categories = listCategories();
  return <AppShell events={events} categories={categories} />;
}
