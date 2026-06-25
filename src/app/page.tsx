import { AppShell } from "@/components/AppShell";
import { getEventsInRange } from "@/db/queries/events";
import { getMarksInRange } from "@/db/queries/marks";
import { listMarkTypes } from "@/db/queries/markTypes";
import { listCategories } from "@/db/queries/categories";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE } from "@/lib/constants";

export default function Home() {
  const events = getEventsInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);
  const marks = getMarksInRange(TIMELINE_MIN_DATE, TIMELINE_MAX_DATE);
  const markTypes = listMarkTypes();
  const categories = listCategories();
  return (
    <AppShell events={events} marks={marks} markTypes={markTypes} categories={categories} />
  );
}
