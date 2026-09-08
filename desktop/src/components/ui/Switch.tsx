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
      className={`relative inline-flex h-7 w-[3.25rem] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 ease-[var(--rg-ease)] before:absolute before:left-1/2 before:top-1/2 before:h-10 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] ${
        checked ? "bg-amber" : "bg-surface-3"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full transition-[transform,background-color] duration-150 ease-[var(--rg-ease)] ${
          checked ? "bg-ink" : "bg-muted"
        }`}
        style={{ transform: checked ? "translateX(28px)" : "translateX(4px)" }}
      />
    </button>
  );
}
