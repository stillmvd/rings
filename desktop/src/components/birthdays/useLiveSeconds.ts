import { useSyncExternalStore } from "react";

// Предпочтение «живой отсчёт секунд на карточках ДР» — localStorage + useSyncExternalStore
// + кастом-event (паттерн проекта). Ключа нет → включено (сохраняем текущее поведение).
const LS_KEY = "timeline:birthday-live-seconds";
const EVENT = "timeline:birthday-live-seconds";

export function readLiveSeconds(): boolean {
  return window.localStorage.getItem(LS_KEY) !== "0";
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

export function useLiveSeconds(): boolean {
  return useSyncExternalStore(subscribe, readLiveSeconds, () => true);
}

export function setLiveSeconds(value: boolean): void {
  window.localStorage.setItem(LS_KEY, value ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}
