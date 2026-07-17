export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-amber" : "bg-surface-0 ring-1 ring-inset ring-line"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full transition-transform ${
          checked ? "bg-ink" : "bg-muted"
        }`}
        style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }}
      />
    </button>
  );
}
