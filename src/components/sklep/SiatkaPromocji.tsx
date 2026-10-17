import Link from "next/link";
import type { Product } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";

export function PromotionProductGrid({
  title,
  description,
  href,
  products,
  emptyText,
}: {
  title: string;
  description?: string;
  href?: string;
  products: Product[];
  emptyText?: string;
}) {
  return (
    <section className="page-gutter py-10 sm:py-14">
      <div className="page-width">
        <div className="mb-8 max-w-2xl">
          {href ? (
            <Link href={href} className="font-serif text-3xl text-charcoal hover:text-sand sm:text-4xl">
              {title}
            </Link>
          ) : (
            <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">{title}</h2>
          )}
          {description ? (
            <p className="section-intro mt-3">{description}</p>
          ) : null}
        </div>
        {products.length === 0 ? (
          emptyText ? <p className="text-sm text-sand">{emptyText}</p> : null
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant="shop" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
