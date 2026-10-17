"use client";

import type { ProductReview } from "@/lib/typy";
import { averageRating, formatAverageRating } from "@/lib/opinie";
import { RatingStars } from "@/components/sklep/GwiazdkiOceny";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export { averageRating } from "@/lib/opinie";

export function ProductReviewsSection({ reviews }: { reviews: ProductReview[] }) {
  const { t } = useLanguage();
  if (!reviews.length) return null;
  const avg = averageRating(reviews);

  return (
    <section className="pb-8">
      <div className="rounded-2xl bg-white px-5 py-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.14)] sm:px-8 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-normal text-charcoal">
              {t("product.reviews")}
            </h2>
            <p className="flex shrink-0 flex-nowrap items-center gap-2.5 text-sm text-charcoal">
              <RatingStars rating={avg} size={16} />
              <span className="relative z-[1] shrink-0 tracking-normal font-medium tabular-nums">
                {formatAverageRating(avg)} / 5
              </span>
              <span className="relative z-[1] shrink-0 text-charcoal/60">
                ({reviews.length})
              </span>
            </p>
          </div>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-taupe/30 bg-cream/40 px-4 py-4"
              >
                <RatingStars rating={review.rating} size={16} />
                <p className="mt-3 text-[15px] leading-relaxed text-charcoal/85">
                  {review.text}
                </p>
                <p className="mt-3 text-sm font-semibold text-charcoal">{review.author}</p>
                {review.city ? (
                  <p className="text-xs text-sand">{review.city}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
    </section>
  );
}
