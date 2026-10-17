import type { MetadataRoute } from "next";
import { company } from "@/lib/firma";
import { getBlogPosts } from "@/lib/serwer/blog";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { getLivePromotions } from "@/lib/serwer/promocje";
import { getFurnitureLines } from "@/lib/serwer/linieMeblowe";
import { getAbout } from "@/lib/serwer/oNas";
import { getVisibleProductCategories } from "@/lib/serwer/ustawienia";
import { getCustomCategories } from "@/lib/serwer/kategorieWlasne";
import { absObraz, okladkaProduktu } from "@/lib/seo";
import type { Product } from "@/lib/typy";

const base = `https://${company.domain}`;

const legal = new Set([
  "/regulamin",
  "/polityka-prywatnosci",
  "/polityka-zwrotow",
  "/polityka-cookies",
  "/formularz-odstapienia",
]);

function dated(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function productLastModified(product: Product): Date | undefined {
  return dated(product.priceHistory?.at(-1)?.at);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, about, visibleProductCategories, promotions, furnitureLines, customCategories] =
    await Promise.all([
    getPublicProducts({ translate: false }),
    getBlogPosts(),
    getAbout(),
    getVisibleProductCategories(),
    getLivePromotions(),
    getFurnitureLines(),
    getCustomCategories(),
  ]);

  const staticPaths = [
    "/",
    "/produkty",
    "/linia/smart",
    "/linia/comfort",
    "/linia/premium",
    "/dostawa",
    "/gwarancja",
    "/faq",
    "/kontakt",
    ...(about.archived ? [] : ["/o-nas"]),
    "/regulamin",
    "/polityka-prywatnosci",
    "/polityka-zwrotow",
    "/polityka-cookies",
    "/formularz-odstapienia",
    "/b2b",
    "/blog",
    "/promocje",
    "/linie",
    "/meble-od-reki",
    "/meble-do-7-dni",
    "/probki-tkanin",
    "/wiecej",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: legal.has(path) ? "monthly" : "weekly",
    priority:
      path === "/"
        ? 1
        : path === "/produkty"
          ? 0.9
          : legal.has(path)
            ? 0.3
            : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = [
    ...visibleProductCategories.map((category) => ({
      url: `${base}/kategoria/${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...customCategories
      .filter((row) => row.visible)
      .map((row) => ({
        url: `${base}/kategoria/${row.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...(visibleProductCategories.includes("narozniki")
      ? [
          {
            url: `${base}/kategoria/narozniki?ksztalt=l`,
            changeFrequency: "weekly" as const,
            priority: 0.75,
          },
          {
            url: `${base}/kategoria/narozniki?ksztalt=u`,
            changeFrequency: "weekly" as const,
            priority: 0.75,
          },
        ]
      : []),
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((product) => {
    const cover = okladkaProduktu(product);
    const lastModified = productLastModified(product);
    return {
      url: `${base}/produkt/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: product.featured || product.readyToShip ? 0.8 : 0.7,
      ...(lastModified ? { lastModified } : {}),
      ...(cover ? { images: [absObraz(cover)] } : {}),
    };
  });

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    ...(dated(post.date) ? { lastModified: dated(post.date) } : {}),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const promotionEntries: MetadataRoute.Sitemap = promotions.map((promo) => ({
    url: `${base}/promocje/${promo.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const furnitureLineEntries: MetadataRoute.Sitemap = furnitureLines.map((line) => ({
    url: `${base}/linie/${line.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...productEntries,
    ...blogEntries,
    ...promotionEntries,
    ...furnitureLineEntries,
  ];
}
