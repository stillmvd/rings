import { useSyncExternalStore } from "react";
import { EMPTY_FILTER, type EventFilter } from "./filter";

function createMemoryStore<T>(initial: T) {
  let value = initial;
  let listeners: Array<() => void> = [];
  const get = () => value;
  const set = (next: T) => {
    value = next;
    listeners.forEach((l) => l());
  };
  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };
  const use = () => useSyncExternalStore(subscribe, get);
  return { use, set, get };
}

export const filterStore = createMemoryStore<EventFilter>(EMPTY_FILTER);
export const searchOpenStore = createMemoryStore<boolean>(false);
