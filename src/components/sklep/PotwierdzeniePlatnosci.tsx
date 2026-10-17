"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, ArrowUpRight, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/dane";
import {
  orderDeliveryFee,
  orderSubtotal,
  orderDiscountAmount,
  resolvePaymentStatus,
} from "@/lib/kasa";
import type { UserOrder } from "@/lib/typy";
import { PaymentAwaitingBadge } from "@/components/sklep/ZnaczekOczekiwania";
import { PayUCheckoutNotices } from "@/components/kasa/InformacjePayU";
import { useLanguage } from "@/kontekst/KontekstJezyka";

const statusLabels: Record<string, string> = {
  pending: "Oczekujące na realizację",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
};

interface OrderPaymentConfirmationProps {
  order: UserOrder;
  guest?: boolean;
}

export function OrderPaymentConfirmation({
  order,
  guest = false,
}: OrderPaymentConfirmationProps) {
  const { t } = useLanguage();
  const paymentStatus = resolvePaymentStatus(order);
  const subtotal = orderSubtotal(order);
  const deliveryFee = orderDeliveryFee(order);
  const discountAmount = orderDiscountAmount(order);
  const awaitingPayment = paymentStatus === "awaiting";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            awaitingPayment ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {awaitingPayment ? (
            <Clock className="h-7 w-7" strokeWidth={1.25} />
          ) : (
            <Check className="h-7 w-7" strokeWidth={1.25} />
          )}
        </div>
        <h1 className="mt-6 font-serif text-2xl text-charcoal sm:text-3xl">
          {awaitingPayment ? "Oczekujemy na płatność PayU" : "Płatność potwierdzona"}
        </h1>
        <p className="mt-2 text-sm text-sand">
          Numer zamówienia:{" "}
          <span className="font-medium text-charcoal">{order.id}</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {awaitingPayment ? (
            <PaymentAwaitingBadge />
          ) : (
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">
              Płatność potwierdzona przez PayU
            </p>
          )}
          {(!awaitingPayment || order.status !== "pending") && (
            <p className="inline-flex items-center rounded-full bg-cream-light px-4 py-2 text-xs font-medium text-charcoal">
              {statusLabels[order.status] ?? order.status}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
        <h2 className="text-[10px] tracking-[0.2em] text-sand uppercase">Podsumowanie</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-sand">Produkty</dt>
            <dd className="text-charcoal">{formatPrice(subtotal)}</dd>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt className="text-sand">
                Rabat{order.couponCode ? ` (${order.couponCode})` : ""}
              </dt>
              <dd>−{formatPrice(discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-sand">Dostawa</dt>
            <dd className="text-charcoal">
              {deliveryFee === 0 ? "Gratis" : formatPrice(deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-taupe/20 pt-3">
            <dt className="font-medium text-charcoal">Do zapłaty</dt>
            <dd className="font-serif text-xl text-charcoal">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {awaitingPayment && (
        <div className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-6 sm:p-8">
          <h2 className="font-serif text-xl text-charcoal">Dokończ płatność w PayU</h2>
          <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
            Jeśli okno PayU zostało zamknięte, wróć do koszyka i spróbuj ponownie albo
            sprawdź e-mail z linkiem do płatności. Realizacja zamówienia rozpocznie się po
            zaksięgowaniu wpłaty (BLIK, karta lub szybki przelew).
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-sand">
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            Status odświeża się automatycznie co kilka sekund.
          </p>
          <div className="mt-6">
            <PayUCheckoutNotices />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {guest ? (
          <p className="w-full text-center text-sm text-sand">{t("payu.guestEmailNote")}</p>
        ) : (
          <Link
            href="/konto?tab=orders"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase hover:bg-charcoal/85"
          >
            Moje zamówienia
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        )}
        <Link
          href="/"
          className={`inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-[11px] tracking-[0.2em] uppercase ${
            guest
              ? "bg-charcoal font-semibold text-cream hover:bg-charcoal/85"
              : "border border-taupe/30 text-charcoal hover:bg-cream-light"
          }`}
        >
          {t("product.home")}
        </Link>
      </div>
    </div>
  );
}
