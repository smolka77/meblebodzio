"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import {
  EMPTY_PROFILE,
  clearProfile,
  readProfile,
  recommendForProfile,
  subscribeProfile,
  type BrowsingProfile,
} from "@/lib/profilPrzegladania";
import { formatPrice } from "@/lib/dane";
import * as I from "./ikony";

/** „Wybrane dla Ciebie” - pojawia się dopiero, gdy klient coś obejrzy (i zgodzi się na pliki analityczne). */
export function DlaCiebie({ products }: { products: Product[] }) {
  const [profile, setProfile] = useState<BrowsingProfile>(EMPTY_PROFILE);

  useEffect(() => {
    const sync = () => setProfile(readProfile());
    sync();
    return subscribeProfile(sync);
  }, []);

  const picks = useMemo(() => recommendForProfile(products, profile, 4), [products, profile]);
  const recent = useMemo(
    () =>
      profile.recent
        .map((slug) => products.find((product) => product.slug === slug))
        .filter((product): product is Product => Boolean(product))
        .slice(0, 6),
    [products, profile.recent]
  );

  if (picks.length === 0 && recent.length === 0) return null;

  return (
    <section className="pw pt-16 lg:pt-24" aria-label="Wybrane dla Ciebie">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[14px] font-medium text-accent">
            <I.Sparkle className="h-4 w-4" />
            Dopasowane do Ciebie
          </p>
          <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[36px]">
            Wybrane dla Ciebie
          </h2>
          <p className="mt-1.5 text-[14.5px] text-meta">
            Na podstawie tego, co oglądasz w sklepie. Dane zostają w Twojej przeglądarce.
          </p>
        </div>
        <button
          type="button"
          onClick={clearProfile}
          className="ulink hidden shrink-0 text-[14.5px] font-medium sm:block"
        >
          Wyczyść historię
        </button>
      </div>

      {picks.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {picks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      {recent.length > 0 ? (
        <div className={picks.length > 0 ? "mt-12" : ""}>
          <h3 className="text-[15px] font-semibold">Ostatnio oglądane</h3>
          <ul className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {recent.map((product) => (
              <li key={product.id} className="w-[150px] shrink-0 sm:w-[170px]">
                <Link href={`/produkt/${product.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#f4f4f4]">
                    <StoreImage
                      src={product.image}
                      alt=""
                      fill
                      sizes="170px"
                      className="transition duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="mt-2 truncate text-[14.5px] font-medium">{product.name}</div>
                  <div className="text-[14px] text-meta">{formatPrice(product.price)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
