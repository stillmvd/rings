import { useSyncExternalStore } from "react";

export function createLocalStore<T extends string>(key: string, fallback: T) {
  let listeners: Array<() => void> = [];
  const get = () => (localStorage.getItem(key) as T | null) ?? fallback;
  const set = (value: T) => {
    localStorage.setItem(key, value);
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
