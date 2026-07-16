import { getSignificanceMeta } from "@/lib/significance";
import type { Significance } from "@/lib/constants";

const STAR =
  "M12 2.6 14.78 8.24 21 9.15 16.5 13.53 17.56 19.73 12 16.8 6.44 19.73 7.5 13.53 3 9.15 9.22 8.24Z";
const SPARKLE = "M19.4 2.8 20.1 4.5 21.8 5.2 20.1 5.9 19.4 7.6 18.7 5.9 17 5.2 18.7 4.5Z";

interface SignificanceIconProps {
  level: Significance;
  size?: number;
}

// Нарастающая метафора важности: 1 — контур звезды, 2 — залитая, 3 — залитая с искрой.
export function SignificanceIcon({ level, size = 16 }: SignificanceIconProps) {
  const color = getSignificanceMeta(level).color;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    style: { color },
    "aria-hidden": true as const,
  };

  if (level === 1) {
    return (
      <svg
        {...common}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d={STAR} />
      </svg>
    );
  }

  if (level === 2) {
    return (
      <svg {...common} fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinejoin="round">
        <path d={STAR} />
      </svg>
    );
  }

  return (
    <svg {...common} fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinejoin="round">
      <path d={STAR} />
      <path d={SPARKLE} />
    </svg>
  );
}
