import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { getI18n } from "@/lib/jezyk/serwer";

export const metadata: Metadata = {
  title: "Strona nie znaleziona",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-terracotta uppercase">
          404
        </p>
        <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">
          {t("notFound.title")}
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-charcoal/70">
          {t("notFound.body")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full bg-charcoal px-5 text-sm font-semibold text-cream"
          >
            {t("notFound.home")}
          </Link>
          <Link
            href="/produkty"
            className="inline-flex min-h-[44px] items-center rounded-full border border-charcoal px-5 text-sm font-semibold text-charcoal"
          >
            {t("notFound.shop")}
          </Link>
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
