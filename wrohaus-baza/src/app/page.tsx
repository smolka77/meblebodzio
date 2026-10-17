import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { HomeHeroCarousel, type HeroSlide } from "@/components/glowna/KaruzelaBanera";
import { HomePromoStrip } from "@/components/glowna/PasekPromocji";
import { HomeProductRail } from "@/components/glowna/PasekProduktow";
import { HomeBenefits } from "@/components/glowna/Korzysci";
import { HomeCollections } from "@/components/glowna/KolekcjeGlowne";
import { HomeInspirationLook, type LookHotspot } from "@/components/glowna/Inspiracja";
import { HomeSocialProof } from "@/components/glowna/OpinieSpoleczne";
import { HomeInspirations } from "@/components/glowna/Inspiracje";
import { Newsletter } from "@/components/glowna/Newsletter";
import { getHomepage, filterHomepageForStorefront } from "@/lib/serwer/stronaGlowna";
import { getAbout } from "@/lib/serwer/oNas";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { getBlogPosts } from "@/lib/serwer/blog";
import { getVisibleProductCategories, getSettings } from "@/lib/serwer/ustawienia";
import { hasSalePrice, saleDiscountPercent, saleSavings } from "@/lib/ceny";
import type { Product } from "@/lib/typy";
import type { HomepageLook } from "@/lib/stronaGlowna";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import { getI18n } from "@/lib/jezyk/serwer";
import { localizeHomepage } from "@/lib/jezyk/stronaGlowna";
import { localizeBlogPosts } from "@/lib/jezyk/trescCms";
import { seoZUstawien, stronaMeta } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteSeo = seoZUstawien(settings);
  return {
    ...stronaMeta({
      title: "Meble i wyposażenie domu",
      description: siteSeo.description,
      path: "/",
    }),
    title: { absolute: siteSeo.title },
  };
}

export default async function HomePage() {
  const [{ locale, t }, homepageRaw, about, products, posts, visibleCategories, settings] =
    await Promise.all([
      getI18n(),
      getHomepage(),
      getAbout(),
      getPublicProducts(),
      getBlogPosts(),
      getVisibleProductCategories(),
      getSettings(),
    ]);
  const homepage = await localizeHomepage(
    filterHomepageForStorefront(homepageRaw, visibleCategories),
    locale
  );

  const bestsellers = products.filter((p) => p.featured && p.inStock);
  const saleProducts = products.filter((p) => p.inStock && hasSalePrice(p));
  const onSale = saleProducts.slice(0, 8);
  const featuredSale = pickBestSale(saleProducts);
  const maxDiscount = featuredSale?.originalPrice
    ? Math.max(
        ...saleProducts.map((p) =>
          saleDiscountPercent(p.price, p.originalPrice ?? p.price)
        )
      )
    : 0;
  const fromPrice = saleProducts.length
    ? Math.min(...saleProducts.map((p) => p.price))
    : 0;

  const lookHotspots = buildLookHotspots(products, homepage.look);
  const localizedPosts = await localizeBlogPosts(posts, locale);

  const slides: HeroSlide[] = [
    {
      image: homepage.hero.image,
      title: homepage.hero.title,
      eyebrow: homepage.hero.eyebrow,
      href: homepage.hero.buttonHref,
      cta: homepage.hero.buttonLabel,
    },
    ...homepage.heroSlides.map((slide) => ({
      image: slide.image,
      title: slide.title,
      eyebrow: slide.eyebrow,
      href: slide.buttonHref,
      cta: slide.buttonLabel,
    })),
  ];

  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">{seoZUstawien(settings).title}</h1>
        <HomeHeroCarousel slides={slides} />
        {featuredSale && (
          <HomePromoStrip
            product={featuredSale}
            saleCount={saleProducts.length}
            maxDiscount={maxDiscount}
            fromPrice={fromPrice}
          />
        )}
        <HomeProductRail
          id="produkty"
          eyebrow={homepage.bestsellers.eyebrow}
          title={homepage.bestsellers.title}
          intro={homepage.bestsellers.intro}
          href="/produkty"
          hrefLabel={t("home.seeAll")}
          products={bestsellers}
        />
        <HomeInspirationLook
          hotspots={lookHotspots}
          content={homepage.look}
        />
        <HomeCollections content={homepage.collections} />
        <HomeBenefits
          content={homepage.benefits}
          aboutArchived={about.archived}
        />
        <HomeSocialProof content={homepage.reviews} />
        <HomeProductRail
          title={t("home.saleTitle")}
          intro={
            maxDiscount > 0
              ? t("home.saleIntro", { n: maxDiscount })
              : t("home.saleIntroZero")
          }
          href="/promocje"
          products={onSale}
        />
        <HomeInspirations posts={localizedPosts} />
        <Newsletter
          offer={
            settings.newsletterOfferEnabled && settings.newsletterOfferCode
              ? {
                  code: settings.newsletterOfferCode,
                  percent: settings.newsletterOfferPercent,
                }
              : undefined
          }
        />
      </main>
      <ShopFooter />
    </>
  );
}

function pickBestSale(products: Product[]): Product | null {
  if (products.length === 0) return null;
  return products.reduce((best, product) => {
    const save = product.originalPrice
      ? saleSavings(product.price, product.originalPrice)
      : 0;
    const bestSave = best.originalPrice
      ? saleSavings(best.price, best.originalPrice)
      : 0;
    return save > bestSave ? product : best;
  });
}

function buildLookHotspots(
  products: Product[],
  look: HomepageLook
): LookHotspot[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return look.hotspots.flatMap((spot) => {
    const product = bySlug.get(spot.productSlug);
    if (!product) return [];
    return [
      {
        id: spot.id,
        slug: product.slug,
        name: collapseRepeatedProductName(product.name),
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        x: spot.x,
        y: spot.y,
      },
    ];
  });
}
