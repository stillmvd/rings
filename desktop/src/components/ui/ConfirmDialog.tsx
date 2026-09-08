import { Dialog } from "./Dialog";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title = "Подтверждение",
  message,
  confirmLabel = "Удалить",
  danger = true,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} width={380}>
      <p className="text-[15px] leading-relaxed text-app-text">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
