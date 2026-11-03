import Link from "next/link";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { CATEGORY_TILES } from "@/lib/glownaTresc";
import { produktyLabel } from "@/lib/liczebniki";
import * as I from "./ikony";

export function KafleKategorii({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="pw pt-16 lg:pt-24">
      <div className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
        <div>
          <p className="text-[13px] font-medium text-meta">Kategorie</p>
          <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[36px]">
            Wybierz, co chcesz urządzić
          </h2>
        </div>
        <Link
          href="/produkty"
          className="ulink hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
        >
          Cała oferta
          <I.Arrow className="h-4 w-4" />
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {CATEGORY_TILES.map((tile) => {
          const total = tile.categories.reduce((sum, slug) => sum + (counts[slug] ?? 0), 0);
          return (
            <li key={tile.label}>
              <Link
                href={tile.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-paper"
              >
                <StoreImage
                  src={tile.image}
                  alt=""
                  fill
                  fit={tile.studio ? "contain" : "cover"}
                  position={tile.position}
                  className={`transition duration-[900ms] ease-out group-hover:scale-[1.04] ${
                    tile.studio ? "scale-[0.82] mix-blend-multiply" : ""
                  }`}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3 text-white sm:right-5 sm:bottom-5 sm:left-5">
                  <div>
                    <div className="text-[18px] leading-tight font-semibold tracking-[-0.02em] sm:text-[22px]">
                      {tile.label}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-white/80 sm:text-[13.5px]">
                      {produktyLabel(total)}
                    </div>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink transition group-hover:bg-accent group-hover:text-white sm:h-10 sm:w-10">
                    <I.Arrow className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
