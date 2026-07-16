import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { subscribeDataVersion, getDataVersion } from "./dataVersion";

export function useQuery<T>(fn: () => Promise<T>): {
  data: T | null;
  error: string | null;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const version = useSyncExternalStore(subscribeDataVersion, getDataVersion);

  useEffect(() => {
    let alive = true;
    fn().then(
      (d) => alive && setData(d),
      (e) => alive && setError(String(e)),
    );
    return () => {
      alive = false;
    };
  }, [fn, tick, version]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, reload };
}
