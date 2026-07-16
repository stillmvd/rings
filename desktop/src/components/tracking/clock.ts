import { useSyncExternalStore } from "react";
import { todayISO } from "@/lib/dates";

// Один секундный тикер на весь раздел: и живые отсчёты карточек, и переход секций в полночь.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let nowValue = 0;

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (timer === null) {
    nowValue = Date.now();
    timer = setInterval(() => {
      nowValue = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const noopSubscribe = (): (() => void) => () => {};
const getNow = (): number => (nowValue === 0 ? (nowValue = Date.now()) : nowValue);
const getNull = (): null => null;

// Живое «сейчас» (мс) только когда active; иначе null (статичный вывод).
export function useNowMs(active: boolean): number | null {
  return useSyncExternalStore<number | null>(
    active ? subscribe : noopSubscribe,
    active ? getNow : getNull,
    getNull,
  );
}

// Реактивный сегодняшний день: значение стабильно в пределах суток,
// подписчик ререндерится только при смене даты в полночь.
export function useTodayISO(): string {
  return useSyncExternalStore(subscribe, todayISO, todayISO);
}
