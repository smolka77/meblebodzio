"use client";

import type { ProductReview } from "@/lib/typy";
import { formatAverageRating, productScore } from "@/lib/opinie";
import { useLanguage } from "@/kontekst/KontekstJezyka";

function StarShape({
  size,
  fill,
  stroke,
}: {
  size: number;
  fill: string;
  stroke: string;
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
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon({
  amount,
  size,
  color,
}: {
  amount: number;
  size: number;
  color: string;
}) {
  if (amount >= 0.99) return <StarShape size={size} fill={color} stroke={color} />;
  if (amount <= 0.01) return <StarShape size={size} fill="none" stroke="#d8d0c5" />;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }} aria-hidden>
      <StarShape size={size} fill="none" stroke="#d8d0c5" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${amount * 100}%` }}>
        <StarShape size={size} fill={color} stroke={color} />
      </span>
    </span>
  );
}

export function RatingStars({
  rating,
  size = 16,
  color = "#a68445",
  onSelect,
}: {
  rating: number;
  size?: number;
  color?: string;
  onSelect?: (value: number) => void;
}) {
  const gap = Math.max(2, Math.round(size * 0.12));
  return (
    <span
      className="inline-flex shrink-0 items-center"
      style={{ gap, minWidth: size * 5 + gap * 4 }}
      aria-hidden={!onSelect}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1;
        const amount = onSelect ? (value <= rating ? 1 : 0) : Math.max(0, Math.min(1, rating - i));
        if (!onSelect) {
          return <StarIcon key={value} amount={amount} size={size} color={color} />;
        }
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-label={`${value} / 5`}
            aria-pressed={amount >= 1}
            className="inline-flex shrink-0 rounded-sm p-0.5 transition-transform hover:scale-110"
          >
            <StarIcon amount={amount} size={size} color={color} />
          </button>
        );
      })}
    </span>
  );
}

export function ProductAverageRating({
  reviews,
  rating,
  count,
  className = "mt-1.5 flex flex-nowrap items-center gap-2.5 text-sm text-charcoal",
  size = 16,
  color = "#a68445",
}: {
  reviews?: ProductReview[];
  rating?: number;
  count?: number;
  className?: string;
  size?: number;
  color?: string;
}) {
  const { t } = useLanguage();
  const score = productScore({ reviews, rating, reviewCount: count });
  if (!score) return null;
  const avgLabel = formatAverageRating(score.rating);
  const listLength = score.count;

  return (
    <p
      className={className}
      aria-label={t("product.avgRatingAria", {
        avg: avgLabel,
        count: String(listLength),
      })}
    >
      <RatingStars rating={score.rating} size={size} color={color} />
      <span className="relative z-[1] shrink-0 tracking-normal font-medium tabular-nums">
        {avgLabel}
      </span>
      <span className="relative z-[1] shrink-0 text-charcoal/70">({listLength})</span>
    </p>
  );
}
