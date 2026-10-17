import Link from "next/link";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { pickRandomProducts } from "@/lib/losowyProdukt";
import { ProductCard } from "@/components/sklep/KartaProduktu";

export async function FeaturedProducts() {
  const products = await getPublicProducts();
  const featured = products.filter((p) => p.featured);
  const display =
    featured.length > 0 ? featured : pickRandomProducts(products, Math.min(4, products.length));

  return (
    <section id="produkty" className="section-y scroll-mt-24 sm:scroll-mt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-sand uppercase">
              Wybrane dla Ciebie
            </p>
            <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl md:text-4xl">
              Polecane produkty
            </h2>
          </div>
          <Link
            href="/kategoria/sofy"
            className="inline-flex min-h-[44px] items-center text-[10px] tracking-[0.2em] text-charcoal uppercase underline underline-offset-4 transition-colors hover:text-sand md:min-h-0"
          >
            Zobacz wszystkie
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {display.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
