import { Mark } from "@/components/brand/Mark";

export function CoverPlaceholder({
  fill,
  container,
  dimmed,
}: {
  fill: string;
  container: string;
  dimmed?: boolean;
}) {
  const gradient = `linear-gradient(140deg, color-mix(in srgb, ${fill} 30%, ${container}) 0%, ${container} 55%, color-mix(in srgb, #000 16%, ${container}) 100%)`;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: gradient, opacity: dimmed ? 0.6 : undefined }}
    >
      <span aria-hidden style={{ filter: "blur(7px)", opacity: 0.28 }}>
        <Mark size={140} />
      </span>
    </div>
  );
}
