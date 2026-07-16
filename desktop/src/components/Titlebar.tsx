import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { Mark } from "./brand/Mark";

export function Titlebar() {
  const win = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="flex h-9 shrink-0 items-center justify-between border-b border-line bg-surface-0"
    >
      <div className="pointer-events-none flex items-center gap-2 pl-3">
        <Mark size={16} />
        <span className="text-[13px] font-semibold tracking-tight text-app-text">
          Rings
        </span>
      </div>
      <div className="flex h-full">
        <button
          type="button"
          onClick={() => win.minimize()}
          title="Свернуть"
          className="flex h-full w-12 items-center justify-center text-muted transition-colors hover:bg-surface-1 hover:text-app-text"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={() => win.toggleMaximize()}
          title="Развернуть"
          className="flex h-full w-12 items-center justify-center text-muted transition-colors hover:bg-surface-1 hover:text-app-text"
        >
          <Square size={12} />
        </button>
        <button
          type="button"
          onClick={() => win.close()}
          title="Закрыть"
          className="flex h-full w-12 items-center justify-center text-muted transition-colors hover:bg-rust hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
