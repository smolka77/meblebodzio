"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/uklad/Naglowek";
import { Footer } from "@/components/uklad/Stopka";
import { FailedPaymentScreen } from "@/components/sklep/PlatnoscNieudana";
import { OrderPaymentConfirmation } from "@/components/sklep/PotwierdzeniePlatnosci";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { resolvePaymentStatus } from "@/lib/kasa";
import { payuReturnLooksFailed } from "@/lib/platnoscPowrot";
import { storage } from "@/lib/schowek";
import type { UserOrder } from "@/lib/typy";

function PaymentReturnContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const guestToken =
    searchParams.get("g")?.trim() || storage.getPendingCheckout()?.guestToken || "";
  const looksFailed = payuReturnLooksFailed(searchParams);
  const { user, orders, discardPendingCheckout } = useShop();
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const cached = useMemo(
    () => (orderId ? orders.find((o) => o.id === orderId) ?? null : null),
    [orderId, orders]
  );

  useEffect(() => {
    if (!orderId || (!user && !guestToken)) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const url = user
          ? `/api/account/orders/${encodeURIComponent(orderId!)}`
          : `/api/orders/guest?id=${encodeURIComponent(orderId!)}&g=${encodeURIComponent(guestToken)}`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as UserOrder;
          if (!cancelled) setOrder(data);
        } else if (!cancelled) {
          setOrder(cached);
        }
      } catch {
        if (!cancelled) setOrder(cached);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setOrder(cached);
    void load();

    const interval = window.setInterval(load, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [orderId, user, guestToken, cached]);

  const paymentStatus = order ? resolvePaymentStatus(order) : null;
  const confirmed = paymentStatus === "confirmed";
  const failed = !confirmed && (paymentStatus === "failed" || looksFailed);

  useEffect(() => {
    if (confirmed) discardPendingCheckout();
  }, [confirmed, discardPendingCheckout]);

  if (failed) {
    return <FailedPaymentScreen orderId={orderId} />;
  }

  if (!user && !guestToken) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sand">{t("payu.guestStatusHint")}</p>
        <Link href="/konto" className="mt-4 inline-block text-charcoal underline">
          {t("header.myAccount")}
        </Link>
      </div>
    );
  }

  if (loading && !order) {
    return <p className="py-16 text-center text-sand">Sprawdzamy status płatności…</p>;
  }

  if (!orderId || !order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sand">Nie znaleziono zamówienia.</p>
        {user ? (
          <Link href="/konto?tab=orders" className="mt-4 inline-block text-charcoal underline">
            Moje zamówienia
          </Link>
        ) : (
          <p className="mt-4 text-sm text-sand">{t("payu.guestEmailNote")}</p>
        )}
      </div>
    );
  }

  return <OrderPaymentConfirmation order={order} guest={!user} />;
}

export default function PaymentReturnPage() {
  return (
    <>
      <Header />
      <main className="py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<p className="py-16 text-center text-sand">Ładowanie…</p>}>
            <PaymentReturnContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
