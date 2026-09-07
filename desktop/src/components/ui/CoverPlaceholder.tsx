export function CoverPlaceholder({
  fill,
  dimmed,
}: {
  fill: string;
  dimmed?: boolean;
}) {
  const gradient = `linear-gradient(140deg, color-mix(in srgb, ${fill} 14%, var(--ds-surface-2)) 0%, var(--ds-surface-1) 100%)`;
  return (
    <div
      className="h-full w-full"
      style={{ background: gradient, opacity: dimmed ? 0.6 : undefined }}
    />
  );
}
