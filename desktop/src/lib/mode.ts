import { createLocalStore } from "./localStore";

export type ViewMode =
  | "timeline"
  | "gallery"
  | "calendar"
  | "tracking"
  | "birthdays"
  | "settings";

export const modeStore = createLocalStore<ViewMode>("rings.mode", "timeline");
