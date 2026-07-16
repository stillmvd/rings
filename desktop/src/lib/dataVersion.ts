// Глобальная ревизия данных: после любой мутации bump → все useQuery перечитывают БД.
let version = 0;
const listeners = new Set<() => void>();

export function bumpDataVersion(): void {
  version++;
  listeners.forEach((l) => l());
}

export function subscribeDataVersion(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getDataVersion(): number {
  return version;
}
