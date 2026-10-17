"use client";

import Link from "next/link";
import { Header } from "@/components/uklad/Naglowek";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">
          {t("error.title")}
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-charcoal/70">
          {t("error.body")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[44px] items-center rounded-full bg-charcoal px-5 text-sm font-semibold text-cream"
          >
            {t("error.retry")}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-charcoal px-5 text-sm font-semibold text-charcoal"
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
    </>
  );
}
