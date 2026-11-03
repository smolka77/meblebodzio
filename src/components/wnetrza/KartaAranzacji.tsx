import Link from "next/link";
import type { Product } from "@/lib/typy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { lookItems, lookTotals, type Look } from "@/lib/aranzacje";
import { roomInfo, styleInfo } from "@/lib/stylePomieszczenia";
import { formatPrice } from "@/lib/dane";
import { produktyLabel } from "@/lib/liczebniki";
import * as I from "@/components/wzor/ikony";

/** Karta aranżacji: zdjęcie, pomieszczenie + styl, miniatury mebli z looku. */
export function KartaAranzacji({
  look,
  products,
  size = "md",
}: {
  look: Look;
  products: Product[];
  size?: "md" | "lg";
}) {
  const items = lookItems(look, products);
  const totals = lookTotals(items);
  const room = roomInfo(look.room);
  const big = size === "lg";

  return (
    <Link
      href={`/inspiracje/${look.slug}`}
      className="group relative block h-full min-h-[320px] overflow-hidden rounded-md bg-paper"
    >
      <StoreImage
        src={look.image}
        alt={look.title}
        fill
        position={look.position}
        sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
        className="transition duration-[1000ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold">{room.label}</span>
        {look.styles.slice(0, 1).map((style) => (
          <span
            key={style}
            className="rounded-full bg-black/40 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm"
          >
            {styleInfo(style).label}
          </span>
        ))}
      </div>
      <div className="absolute right-4 bottom-4 left-4 text-white sm:right-5 sm:bottom-5 sm:left-5">
        <h3
          className={`font-display leading-[1.08] tracking-[-0.03em] ${
            big ? "text-[26px] sm:text-[34px]" : "text-[20px] sm:text-[22px]"
          }`}
        >
          {look.title}
        </h3>
        {big ? <p className="mt-2 max-w-md text-[14.5px] text-white/85">{look.short}</p> : null}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ul className="flex -space-x-2">
              {items.slice(0, 4).map(({ product }) => (
                <li
                  key={product.id}
                  className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-soft"
                >
                  <StoreImage src={product.image} alt="" fill sizes="32px" />
                </li>
              ))}
            </ul>
            <span className="text-[12.5px] text-white/90">
              {produktyLabel(items.length)} · od {formatPrice(Math.min(...items.map((i) => i.product.price)))}
            </span>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink transition group-hover:bg-accent group-hover:text-white">
            <I.Arrow className="h-4 w-4" />
          </span>
        </div>
        {big ? (
          <p className="mt-2 text-[12.5px] text-white/75">
            Cały zestaw −10%: {formatPrice(totals.discounted)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
