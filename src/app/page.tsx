import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { HomeView } from "@/components/wzor/StronaGlowna";
import { getBlogPosts } from "@/lib/serwer/blog";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { getSettings } from "@/lib/serwer/ustawienia";
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
  const [products, settings, posts] = await Promise.all([
    getPublicProducts(),
    getSettings(),
    getBlogPosts(),
  ]);
  const instagramUrl =
    settings.socialLinks?.find((link) => link.platform === "instagram")?.url?.trim() ||
    settings.instagramUrl?.trim() ||
    undefined;

  return (
    <>
      <Header />
      <main className="bg-cream">
        <p className="sr-only">{seoZUstawien(settings).title}</p>
        <HomeView products={products} posts={posts} instagramUrl={instagramUrl} />
      </main>
      <ShopFooter />
    </>
  );
}
