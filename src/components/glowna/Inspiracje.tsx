"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/typy";
import { isLocalUpload } from "@/lib/obrazy";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function HomeInspirations({ posts }: { posts: BlogPost[] }) {
  const { t } = useLanguage();
  const preview = posts.slice(0, 3);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.min(preview.length - 1, Math.max(0, next)));
  }, [preview.length]);

  function goTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  }

  if (preview.length === 0) return null;

  return (
    <section className="page-gutter py-12 sm:py-16">
      <div className="page-width">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="section-kicker text-terracotta">{t("footer.blog")}</p>
            <h2 className="mt-1 font-serif text-3xl text-charcoal sm:text-4xl">
              {t("home.inspoTitle")}
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden text-[15px] font-semibold text-charcoal underline decoration-taupe underline-offset-4 hover:text-terracotta sm:inline"
          >
            {t("home.seeBlog")}
          </Link>
        </div>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible"
        >
          {preview.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group w-full min-w-full snap-start overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:min-w-0 sm:w-auto"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-light">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized={isLocalUpload(post.image)}
                />
              </div>
              <div className="px-5 py-4">
                <p className="text-[13px] font-semibold tracking-wide text-charcoal/70 uppercase">
                  {post.category}
                </p>
                <h3 className="mt-2 font-serif text-xl leading-snug text-charcoal">
                  {post.title}
                </h3>
                <p className="section-intro mt-2 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {preview.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
            {preview.map((post, i) => (
              <button
                key={post.id}
                type="button"
                aria-label={`Artykuł ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-charcoal" : "w-2 bg-taupe"
                }`}
              />
            ))}
          </div>
        )}

        <Link
          href="/blog"
          className="mt-6 flex min-h-[48px] items-center justify-center rounded-full border border-charcoal text-[15px] font-semibold text-charcoal sm:hidden"
        >
          {t("home.seeBlog")}
        </Link>
      </div>
    </section>
  );
}
