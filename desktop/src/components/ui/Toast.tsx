import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{ show: (message: string, type?: ToastType) => void } | null>(
  null,
);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const META: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: "#34d399" },
  error: { icon: AlertCircle, color: "var(--rg-rust)" },
  info: { icon: Info, color: "var(--rg-amber)" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = META[t.type].icon;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-surface-1 px-4 py-3 text-sm text-app-text shadow-lg"
                >
                  <Icon size={18} style={{ color: META[t.type].color }} />
                  <span className="max-w-xs">{t.message}</span>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="ml-1 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
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
