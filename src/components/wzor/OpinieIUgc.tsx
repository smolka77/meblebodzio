import Link from "next/link";
import type { Product } from "@/lib/typy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { REVIEWS, REVIEW_SUMMARY, UGC } from "@/lib/glownaTresc";
import { formatPrice } from "@/lib/dane";
import * as I from "./ikony";

function Stars({ count = 5, className = "h-4 w-4" }: { count?: number; className?: string }) {
  return (
    <span className="flex text-[#d9a441]" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <I.Star key={index} className={className} />
      ))}
    </span>
  );
}

export function OpinieIUgc({
  products,
  instagramUrl,
}: {
  products: Product[];
  instagramUrl?: string;
}) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const feed = UGC.map((entry) => ({ ...entry, product: bySlug.get(entry.productSlug) })).filter(
    (entry) => entry.product
  );

  return (
    <section className="mt-16 bg-white py-14 lg:mt-24 lg:py-20">
      <div className="pw">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
          <div>
            <p className="text-[13px] font-medium text-meta">Opinie klientów</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-[56px] leading-none tracking-[-0.05em]">
                {REVIEW_SUMMARY.average}
              </span>
              <span className="text-[18px] text-meta">/ 5</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Stars className="h-5 w-5" />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[14.5px]">
              <I.Check className="h-4 w-4 text-emerald-700" />
              {REVIEW_SUMMARY.count} zweryfikowanych opinii
            </p>
            <ul className="mt-6 space-y-2" aria-label="Rozkład ocen">
              {REVIEW_SUMMARY.distribution.map((row) => (
                <li key={row.stars} className="flex items-center gap-3 text-[13px]">
                  <span className="w-3 text-right tabular-nums">{row.stars}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                    <span
                      className="block h-full rounded-full bg-[#d9a441]"
                      style={{ width: `${row.percent}%` }}
                    />
                  </span>
                  <span className="w-9 text-right text-meta tabular-nums">{row.percent}%</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
            {REVIEWS.map((review) => (
              <li
                key={`${review.author}-${review.city}`}
                className="flex w-[80%] shrink-0 snap-start flex-col rounded-md border border-line bg-cream p-5 sm:w-[46%] lg:w-auto"
              >
                <div className="flex items-center justify-between gap-2">
                  <Stars count={review.rating} className="h-3.5 w-3.5" />
                  <span className="text-[12px] text-meta">{review.product}</span>
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">
                  „{review.text}”
                </blockquote>
                <div className="mt-4 flex items-center justify-between gap-2 text-[13px]">
                  <span>
                    <b className="font-semibold">{review.author}</b>{" "}
                    <span className="text-meta">· {review.city}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-emerald-800">
                    <I.Check className="h-3.5 w-3.5" />
                    Zweryfikowany zakup
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {feed.length > 0 ? (
          <div className="mt-14 lg:mt-20">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-meta">Wasze wnętrza</p>
                <h3 className="font-display mt-1.5 text-[24px] leading-tight sm:text-[30px]">
                  Zobacz, jak mieszkają nasi klienci
                </h3>
              </div>
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ulink hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
                >
                  Obserwuj nas na Instagramie
                  <I.Arrow className="h-4 w-4" />
                </a>
              ) : null}
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
              {feed.map(({ image, author, city, product }) => (
                <li key={image}>
                  <Link
                    href={`/produkt/${product!.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-paper"
                  >
                    <StoreImage
                      src={image}
                      alt={`Wnętrze klienta: ${author}, ${city}`}
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                      className="transition duration-[900ms] ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 to-transparent" />
                    <div className="absolute right-2.5 bottom-2.5 left-2.5 text-white">
                      <div className="text-[12px] text-white/85">
                        {author} · {city}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 rounded bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink">
                        <span className="truncate">{product!.name}</span>
                        <span className="shrink-0">{formatPrice(product!.price)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
