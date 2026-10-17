"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, XCircle } from "lucide-react";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { useShop } from "@/kontekst/KontekstSklepu";

export function FailedPaymentScreen({
  orderId,
  onRetry,
}: {
  orderId?: string | null;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { restorePendingCheckout } = useShop();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    restorePendingCheckout();
  }, [restorePendingCheckout]);

  function handleRetry() {
    restorePendingCheckout();
    onRetry?.();
    router.push("/koszyk");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
          <XCircle className="h-7 w-7" strokeWidth={1.25} />
        </div>
        <h1 className="mt-6 font-serif text-2xl text-charcoal sm:text-3xl">
          {t("payu.failedTitle")}
        </h1>
        {orderId ? (
          <p className="mt-2 text-sm text-sand">
            {t("payu.failedOrder")}{" "}
            <span className="font-medium text-charcoal">{orderId}</span>
          </p>
        ) : null}
        <p className="mt-4 inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-medium text-red-800">
          {t("payu.failedBadge")}
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-red-100 bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
        <p className="text-sm leading-relaxed text-charcoal/80">{t("payu.failedBody")}</p>
        <p className="mt-4 text-sm leading-relaxed text-sand">{t("payu.failedHint")}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase hover:bg-charcoal/85"
        >
          {t("payu.retry")}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-taupe/30 px-8 py-3 text-[11px] tracking-[0.2em] text-charcoal uppercase hover:bg-cream-light"
        >
          {t("product.home")}
        </Link>
      </div>
    </div>
  );
}
