"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { isLocalUpload } from "@/lib/obrazy";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import type { HomepageReview, HomepageReviews } from "@/lib/stronaGlowna";

function Stars({ size }: { size: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} fill-[#F5C518] text-[#F5C518]`}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

function ReviewCard({
  review,
  sizes,
}: {
  review: HomepageReview;
  sizes: string;
}) {
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
      {review.image ? (
        <div className="relative aspect-[16/10] bg-cream-light">
          <Image
            src={review.image}
            alt={`${review.product || review.name} — ${review.name}`}
            fill
            className="object-cover"
            sizes={sizes}
            unoptimized={isLocalUpload(review.image)}
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col px-6 py-5">
        <div className="flex items-center">
          <Stars size="h-5 w-5" />
        </div>
        {review.text ? (
          <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-charcoal/85">
            {review.text}
          </blockquote>
        ) : null}
        <figcaption className="mt-5 border-t border-taupe/25 pt-4">
          <p className="text-sm font-semibold text-charcoal">{review.name}</p>
          {(review.city || review.product) && (
            <p className="mt-0.5 text-xs text-sand">
              {[review.city, review.product].filter(Boolean).join(" · ")}
            </p>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

function ReviewReelSet({
  items,
  hidden,
}: {
  items: HomepageReview[];
  hidden?: boolean;
}) {
  return (
    <div
      className="review-reel-set flex gap-3 pr-3"
      aria-hidden={hidden || undefined}
    >
      {items.map((review) => (
        <div
          key={`${hidden ? "dup-" : ""}${review.id}`}
          className="w-[min(20.5rem,calc(100vw-3.25rem))] shrink-0"
        >
          <ReviewCard review={review} sizes="85vw" />
        </div>
      ))}
    </div>
  );
}

export function HomeSocialProof({ content }: { content: HomepageReviews }) {
  const { t } = useLanguage();
  if (content.items.length === 0) return null;

  return (
    <section className="page-gutter py-12 sm:py-16">
      <div className="page-width">
        <div className="mb-8 sm:mb-10">
          {content.eyebrow ? (
            <p className="section-kicker text-terracotta">{content.eyebrow}</p>
          ) : null}
          <h2 className="mt-1 font-serif text-3xl text-charcoal sm:text-4xl">
            {content.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-charcoal">
            <Stars size="h-5 w-5" />
            {content.rating ? (
              <span className="font-semibold">{content.rating}</span>
            ) : null}
            {content.meta ? (
              <span className="text-[15px] text-charcoal/70">{content.meta}</span>
            ) : (
              <span className="text-[15px] text-charcoal/70">
                {t("home.reviewsMeta")}
              </span>
            )}
          </div>
        </div>

        <div className="review-reel sm:hidden">
          <div className="review-reel-track">
            <ReviewReelSet items={content.items} />
            <ReviewReelSet items={content.items} hidden />
          </div>
        </div>

        <div
          className={`hidden gap-4 sm:grid sm:gap-5 ${
            content.items.length === 1
              ? "sm:grid-cols-1 sm:max-w-md"
              : content.items.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3"
          }`}
        >
          {content.items.map((review) => (
            <ReviewCard key={review.id} review={review} sizes="33vw" />
          ))}
        </div>
      </div>
    </section>
  );
}
