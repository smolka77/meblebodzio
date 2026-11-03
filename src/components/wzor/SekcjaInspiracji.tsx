import Link from "next/link";
import type { Product } from "@/lib/typy";
import { LOOKS } from "@/lib/aranzacje";
import { KartaAranzacji } from "@/components/wnetrza/KartaAranzacji";
import * as I from "./ikony";

export function SekcjaInspiracji({ products }: { products: Product[] }) {
  const [first, ...rest] = LOOKS;
  return (
    <section className="pw pt-16 lg:pt-24" id="inspiracje">
      <div className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
        <div>
          <p className="text-[13px] font-medium text-meta">Inspiracje</p>
          <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[36px]">
            Aranżacje, które możesz kupić
          </h2>
        </div>
        <Link
          href="/inspiracje"
          className="ulink hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
        >
          Zobacz wszystkie inspiracje
          <I.Arrow className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
        <div className="col-span-2 lg:row-span-2">
          <div className="h-[420px] lg:h-full">
            <KartaAranzacji look={first} products={products} size="lg" />
          </div>
        </div>
        {rest.slice(0, 4).map((look) => (
          <div key={look.slug} className="h-[260px] lg:h-auto">
            <KartaAranzacji look={look} products={products} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/inspiracje"
          className="grid h-12 place-items-center rounded-full border border-ink px-7 text-[15px] font-semibold"
        >
          Zobacz wszystkie inspiracje
        </Link>
      </div>
    </section>
  );
}
