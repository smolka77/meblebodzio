import type { SVGProps } from "react";
import {
  POLAND_OUTLINE_PATH,
  POLAND_OUTLINE_TRANSFORM,
} from "./konturPolski";

/** Obrys mapy Polski — Wikimedia Commons, domena publiczna. */
export function PolandMapIcon({
  className,
  strokeWidth = 1.2,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  // viewBox 600×600 — skaluj grubość jak w Lucide (viewBox 24)
  const scaledStroke = strokeWidth <= 2 ? strokeWidth * 17 : strokeWidth;

  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      stroke="currentColor"
      strokeWidth={scaledStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <g transform={POLAND_OUTLINE_TRANSFORM}>
        <path d={POLAND_OUTLINE_PATH} />
      </g>
    </svg>
  );
}
