"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductReview } from "@/lib/typy";
import { averageRating, formatAverageRating } from "@/lib/opinie";
import { RatingStars } from "@/components/sklep/GwiazdkiOceny";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { useShop } from "@/kontekst/KontekstSklepu";

export { averageRating } from "@/lib/opinie";

function BuyerReviewForm({ productId }: { productId: string }) {
  const { t } = useLanguage();
  const { user } = useShop();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        author,
        text,
        ...(!user ? { orderId, email } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error ?? t("product.reviewNeedPurchase"));
      return;
    }
    setMessage(t("product.reviewThanks"));
    setText("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 border-t border-taupe/25 pt-6">
      <h3 className="text-base font-semibold text-charcoal">{t("product.reviewFormTitle")}</h3>
      <p className="text-sm text-charcoal/70">{t("product.reviewFormHint")}</p>
      {!user ? (
        <p className="text-sm text-charcoal/70">{t("product.reviewGuestHint")}</p>
      ) : null}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase">
          {t("product.reviewRating")}
        </p>
        <RatingStars rating={rating} size={22} onSelect={setRating} />
      </div>
      <div>
        <label
          htmlFor={`review-author-${productId}`}
          className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
        >
          {t("product.reviewAuthor")}
        </label>
        <input
          id={`review-author-${productId}`}
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor={`review-text-${productId}`}
          className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
        >
          {t("product.reviewText")}
        </label>
        <textarea
          id={`review-text-${productId}`}
          required
          minLength={8}
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none"
        />
      </div>
      {!user ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`review-order-${productId}`}
              className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
            >
              {t("product.reviewOrder")}
            </label>
            <input
              id={`review-order-${productId}`}
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`review-email-${productId}`}
              className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
            >
              {t("product.reviewEmail")}
            </label>
            <input
              id={`review-email-${productId}`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-terracotta">{error}</p> : null}
      {message ? <p className="text-sm text-charcoal">{message}</p> : null}
      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-charcoal px-6 py-3 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase disabled:opacity-50"
      >
        {t("product.reviewSubmit")}
      </button>
    </form>
  );
}

export function ProductReviewsSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: ProductReview[];
}) {
  const { t } = useLanguage();
  if (!reviews.length) {
    return (
      <section className="pb-8">
        <div className="rounded-2xl bg-white px-5 py-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.14)] sm:px-8 sm:py-8">
          <h2 className="text-xl font-semibold tracking-normal text-charcoal">
            {t("product.reviews")}
          </h2>
          <BuyerReviewForm productId={productId} />
        </div>
      </section>
    );
  }
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
          <BuyerReviewForm productId={productId} />
        </div>
    </section>
  );
}
