import type { Product } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";

/** „Skompletuj wnętrze” — podpowiedzi uzupełniające mebel z karty (inne kategorie, podobny styl). */
export function CompleteInterior({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="rounded-2xl bg-white px-5 py-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.14)] sm:px-8 sm:py-8">
      <h2 className="text-xl font-semibold text-charcoal">Skompletuj wnętrze</h2>
      <p className="mt-1 text-sm text-charcoal/65">
        Meble, które pasują do tego produktu stylem i przeznaczeniem.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
