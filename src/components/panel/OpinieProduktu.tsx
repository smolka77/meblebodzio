"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProductReview } from "@/lib/typy";
import { averageRating, formatAverageRating } from "@/lib/opinie";
import { RatingStars } from "@/components/sklep/GwiazdkiOceny";
import {
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

function emptyReview(): ProductReview {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `review-${Date.now()}`,
    author: "",
    city: "",
    rating: 5,
    text: "",
  };
}

export function ProductReviewsField({
  reviews,
  onChange,
}: {
  reviews: ProductReview[];
  onChange: (reviews: ProductReview[]) => void;
}) {
  const filled = reviews.filter(
    (review) => review.author.trim() || review.text.trim()
  );
  const avg = filled.length ? averageRating(filled) : 0;

  function patch(index: number, next: ProductReview) {
    const copy = [...reviews];
    copy[index] = next;
    onChange(copy);
  }

  return (
    <section className="rounded-2xl border border-taupe/25 bg-white p-4 sm:p-5">
      <p className={panelLabelClass}>Opinie przy ogłoszeniu</p>
      <p className={`mt-1 max-w-xl ${panelHintClass}`}>
        Pokazują się na stronie produktu. Ocenę klikasz gwiazdkami — średnia
        wychodzi pod ID na ogłoszeniu. Wystarczy imię albo treść, żeby opinia
        zapisała się w sklepie.
      </p>

      {filled.length > 0 ? (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-charcoal">
          <span className={panelMetaClass}>Średnia na ogłoszeniu:</span>
          <RatingStars rating={avg} size={16} />
          <span className="relative z-[1] shrink-0 tracking-normal font-medium tabular-nums text-charcoal">
            {formatAverageRating(avg)} / 5
          </span>
          <span className={panelMetaClass}>({filled.length})</span>
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {reviews.map((review, index) => (
          <div key={review.id} className="rounded-xl bg-cream-light/70 p-3 sm:p-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[8rem] flex-1">
                <label className={panelLabelClass}>Imię</label>
                <input
                  value={review.author}
                  onChange={(e) => patch(index, { ...review, author: e.target.value })}
                  placeholder="np. Marta W."
                  className={`${panelInputClass} mt-1 bg-white`}
                />
              </div>
              <div className="w-28">
                <label className={panelLabelClass}>Miasto</label>
                <input
                  value={review.city ?? ""}
                  onChange={(e) => patch(index, { ...review, city: e.target.value })}
                  placeholder="np. Kraków"
                  className={`${panelInputClass} mt-1 bg-white`}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange(reviews.filter((_, i) => i !== index))}
                className="mb-1 p-1.5 text-charcoal/70 hover:text-red-600"
                aria-label="Usuń opinię"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3">
              <p className={panelLabelClass}>Ocena w gwiazdkach</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <RatingStars
                  rating={review.rating}
                  size={24}
                  onSelect={(value) => patch(index, { ...review, rating: value })}
                />
                <span className={`${panelMetaClass} shrink-0 tabular-nums`}>
                  {review.rating} / 5
                </span>
              </div>
            </div>
            <textarea
              rows={3}
              value={review.text}
              onChange={(e) => patch(index, { ...review, text: e.target.value })}
              placeholder="Treść opinii"
              className={`${panelInputClass} mt-2 bg-white`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...reviews, emptyReview()])}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal"
      >
        <Plus className="h-4 w-4" />
        Dodaj opinię
      </button>
    </section>
  );
}
