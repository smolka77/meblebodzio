"use client";

import type { ProductReview } from "@/lib/typy";
import { averageRating, formatAverageRating } from "@/lib/opinie";
import { useLanguage } from "@/kontekst/KontekstJezyka";

function StarIcon({
  filled,
  size,
}: {
  filled: boolean;
  size: number;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className="block shrink-0 overflow-visible"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-hidden
    >
      <path
        d="M10 1.6 12.4 6.5l5.4.8-3.9 3.8.9 5.4L10 14.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L10 1.6z"
        fill={filled ? "#E2B100" : "none"}
        stroke={filled ? "#E2B100" : "#C9C0B4"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RatingStars({
  rating,
  size = 16,
  onSelect,
}: {
  rating: number;
  size?: number;
  onSelect?: (value: number) => void;
}) {
  const filledCount = onSelect ? rating : Math.round(rating);
  const gap = Math.max(2, Math.round(size * 0.12));
  return (
    <span
      className="inline-flex shrink-0 items-center"
      style={{ gap, minWidth: size * 5 + gap * 4 }}
      aria-hidden={!onSelect}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1;
        const filled = value <= filledCount;
        if (!onSelect) {
          return <StarIcon key={value} filled={filled} size={size} />;
        }
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-label={`${value} / 5`}
            aria-pressed={filled}
            className="inline-flex shrink-0 rounded-sm p-0.5 transition-transform hover:scale-110"
          >
            <StarIcon filled={filled} size={size} />
          </button>
        );
      })}
    </span>
  );
}

export function ProductAverageRating({
  reviews,
  className = "mt-1.5 flex flex-nowrap items-center gap-2.5 text-sm text-charcoal",
}: {
  reviews?: ProductReview[];
  className?: string;
}) {
  const { t } = useLanguage();
  const list = reviews ?? [];
  if (!list.length) return null;
  const avg = averageRating(list);
  const avgLabel = formatAverageRating(avg);

  return (
    <p
      className={className}
      aria-label={t("product.avgRatingAria", {
        avg: avgLabel,
        count: String(list.length),
      })}
    >
      <RatingStars rating={avg} size={16} />
      <span className="relative z-[1] shrink-0 tracking-normal font-medium tabular-nums">
        {avgLabel}
      </span>
      <span className="relative z-[1] shrink-0 text-charcoal/55">({list.length})</span>
    </p>
  );
}
