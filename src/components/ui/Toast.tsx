"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const mountSubscribe = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(
    mountSubscribe,
    () => true,
    () => false,
  );

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const meta: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: "var(--tl-success)" },
  error: { icon: AlertCircle, color: "var(--tl-danger)" },
  info: { icon: Info, color: "var(--tl-accent-500)" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useIsMounted();
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
            <AnimatePresence>
              {toasts.map((t) => {
                const Icon = meta[t.type].icon;
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-[var(--md-sys-color-inverse-surface)] px-4 py-3 text-sm text-[var(--md-sys-color-inverse-on-surface)] shadow-lg"
                  >
                    <Icon size={18} style={{ color: meta[t.type].color }} />
                    <span className="max-w-xs">{t.message}</span>
                    <button
                      type="button"
                      onClick={() => dismiss(t.id)}
                      className="ml-1 text-[var(--md-sys-color-inverse-on-surface)]/70 transition-colors hover:text-[var(--md-sys-color-inverse-on-surface)]"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
