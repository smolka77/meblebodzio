import Link from "next/link";
import type { Product } from "@/lib/typy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { COLLECTION_SLUGS } from "@/lib/glownaTresc";
import { formatPrice } from "@/lib/dane";
import * as I from "./ikony";

export function SekcjaKolekcji({ products }: { products: Product[] }) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const collections = COLLECTION_SLUGS.map((item) => ({
    ...item,
    product: bySlug.get(item.slug),
  })).filter((item) => item.product);
  if (collections.length === 0) return null;

  return (
    <section className="pw pt-16 lg:pt-24">
      <div className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
        <div>
          <p className="text-[13px] font-medium text-meta">Kolekcje</p>
          <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[36px]">
            Gotowe zestawy: Terra, Aurora i Nest
          </h2>
        </div>
        <Link
          href="/kategoria/kolekcje"
          className="ulink hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
        >
          Wszystkie kolekcje
          <I.Arrow className="h-4 w-4" />
        </Link>
      </div>
      <ul className="grid gap-5 md:grid-cols-3 lg:gap-6">
        {collections.map(({ slug, name, tagline, description, image, product }) => (
          <li key={slug}>
            <Link href={`/produkt/${slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-paper">
                <StoreImage
                  src={image}
                  alt={`Kolekcja ${name}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="transition duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold tracking-wide uppercase">
                  Kolekcja
                </span>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[28px] leading-none tracking-[-0.035em]">{name}</h3>
                <span className="text-[14.5px] font-semibold">
                  od {formatPrice(product!.price)}
                </span>
              </div>
              <p className="mt-1.5 text-[13.5px] font-medium text-accent">{tagline}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-meta">{description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[14.5px] font-semibold">
                <span className="ulink">Zobacz kolekcję</span>
                <I.Arrow className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
