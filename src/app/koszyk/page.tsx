"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Minus, Plus, ShoppingBag, Tag, Trash2, User, X } from "lucide-react";
import { Header } from "@/components/uklad/Naglowek";
import { Footer } from "@/components/uklad/Stopka";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { describeCartColor } from "@/lib/infoTkanin";
import { PayUCheckoutNotices } from "@/components/kasa/InformacjePayU";
import {
  CheckoutAuthPanel,
  type CheckoutAuthMode,
  type GuestCheckoutInput,
} from "@/components/kasa/LogowanieKoszyk";
import {
  CheckoutShippingForm,
  validateCheckoutShipping,
  type CheckoutShippingInput,
} from "@/components/kasa/FormularzDostawyKoszyk";
import { useShop } from "@/kontekst/KontekstSklepu";
import { formatPrice } from "@/lib/dane";
import { calculateOrderTotal, resolvePaymentStatus } from "@/lib/kasa";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { remainingWarehouseQty, warehouseQty } from "@/lib/stanMagazynu";
import { PayUInstallmentsMini } from "@/components/sklep/WidgetRatyPayU";
import { FailedPaymentScreen } from "@/components/sklep/PlatnoscNieudana";
import { storage } from "@/lib/schowek";
import { beginApplePayPayment, canUseApplePay } from "@/lib/applePayKasa";
import {
  CartPaymentMethodPicker,
  type CartPayMethod,
} from "@/components/kasa/WyborPlatnosci";

function userInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function SectionHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-end gap-4 border-b border-taupe/20 pb-4">
      <span className="font-serif text-3xl leading-none text-taupe/70">{step}</span>
      <h2 className="font-serif text-2xl leading-tight text-charcoal sm:text-3xl">{title}</h2>
    </div>
  );
}

function CartSummaryPanel({
  cartTotal,
  discountAmount,
  appliedCoupon,
  deliveryFee,
  orderTotal,
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  applyingCoupon,
  termsAccepted,
  onTermsChange,
  termsError,
  authError,
  submitting,
  payMethod,
  onPayMethodChange,
  payMethodError,
  onCheckout,
  onClearCart,
}: {
  cartTotal: number;
  discountAmount: number;
  appliedCoupon: { code: string; name: string; discountPercent: number } | null;
  deliveryFee: number;
  orderTotal: number;
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  applyingCoupon: boolean;
  termsAccepted: boolean;
  onTermsChange: (value: boolean) => void;
  termsError: boolean;
  authError: boolean;
  submitting: boolean;
  payMethod: CartPayMethod;
  onPayMethodChange: (value: CartPayMethod) => void;
  payMethodError: boolean;
  onCheckout: () => void;
  onClearCart: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-[0_12px_40px_-24px_rgba(17,17,17,0.22)] sm:p-7">
        <p className="text-[10px] tracking-[0.22em] text-sand uppercase">Do zapłaty</p>
        <p className="mt-1 font-serif text-4xl text-charcoal sm:text-[2.75rem] sm:leading-none">
          {formatPrice(orderTotal)}
        </p>
        <PayUInstallmentsMini amount={orderTotal} id="cart" className="mt-3" />
        <p className="mt-2 text-sm text-sand lg:hidden">{t("cart.pricesNote")}</p>

        <dl className="mt-6 space-y-2.5 border-t border-taupe/15 pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-sand">{t("cart.products")}</dt>
            <dd className="font-medium text-charcoal">{formatPrice(cartTotal)}</dd>
          </div>
          {discountAmount > 0 && appliedCoupon && (
            <div className="flex justify-between gap-4 text-emerald-700">
              <dt>{t("cart.discount", { code: appliedCoupon.code })}</dt>
              <dd className="font-medium">−{formatPrice(discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-sand">{t("cart.delivery")}</dt>
            <dd className="font-medium text-charcoal">
              {deliveryFee === 0 ? t("cart.free") : formatPrice(deliveryFee)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.15)] sm:p-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/12 text-terracotta"
            aria-hidden
          >
            <Tag className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h3 className="font-serif text-xl leading-tight text-charcoal sm:text-[1.35rem]">
            {t("cart.coupon")}
          </h3>
        </div>
        {appliedCoupon ? (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3.5">
            <div>
              <p className="font-serif text-lg font-semibold tracking-[0.08em] text-charcoal uppercase">
                {appliedCoupon.code}
              </p>
              <p className="mt-0.5 font-serif text-sm text-sand">
                {appliedCoupon.name} · −{appliedCoupon.discountPercent}%
              </p>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-sand hover:text-charcoal"
              aria-label={t("cart.removeCoupon")}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => onCouponInputChange(e.target.value.toUpperCase())}
              placeholder={t("cart.couponPh")}
              className="min-h-[46px] flex-1 rounded-xl border border-taupe/30 bg-cream/20 px-4 font-serif text-base font-medium tracking-[0.1em] text-charcoal uppercase placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-sand/80 focus:border-charcoal focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={applyingCoupon || !couponInput.trim()}
              className="min-h-[46px] shrink-0 rounded-xl border border-charcoal px-5 font-serif text-sm font-semibold tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream disabled:opacity-50"
            >
              {applyingCoupon ? "…" : t("cart.apply")}
            </button>
          </div>
        )}
      </div>

      <CartPaymentMethodPicker
        value={payMethod}
        onChange={onPayMethodChange}
        error={payMethodError}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-taupe/25 bg-white p-4 text-sm leading-relaxed text-charcoal shadow-[0_4px_16px_-12px_rgba(17,17,17,0.12)]">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-charcoal"
        />
        <span>
          {t("cart.terms", { terms: "%%T%%", privacy: "%%P%%" }).split("%%T%%")[0]}
          <Link href="/regulamin" className="font-medium underline underline-offset-2">
            {t("footer.terms")}
          </Link>
          {t("cart.terms", { terms: "%%T%%", privacy: "%%P%%" }).split("%%T%%")[1]?.split("%%P%%")[0]}
          <Link href="/polityka-prywatnosci" className="font-medium underline underline-offset-2">
            {t("footer.privacy")}
          </Link>
          {t("cart.terms", { terms: "%%T%%", privacy: "%%P%%" }).split("%%P%%")[1]}
        </span>
      </label>
      {termsError && (
        <p className="text-sm text-terracotta">{t("cart.termsError")}</p>
      )}
      {authError && (
        <p className="text-sm text-terracotta">{t("cart.accountRequired")}</p>
      )}

      <PayUCheckoutNotices compact />

      <button
        type="button"
        onClick={onCheckout}
        disabled={submitting}
        className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-charcoal py-4 text-[12px] font-semibold tracking-[0.14em] text-cream uppercase transition-colors hover:bg-charcoal/90 disabled:opacity-50"
      >
        {submitting ? t("cart.paying") : t("cart.pay")}
        {!submitting && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
      </button>

      <button
        type="button"
        onClick={onClearCart}
        className="w-full py-2 text-center text-[11px] tracking-[0.16em] text-sand uppercase transition-colors hover:text-charcoal"
      >
        {t("cart.clear")}
      </button>

      <p className="text-center text-xs leading-relaxed text-sand lg:hidden">
        {t("cart.deliveryNote", {
          time: t("policy.deliveryTime"),
          returns: t("top.returns"),
        })}{" "}
        <Link href="/polityka-zwrotow" className="underline underline-offset-2">
          {t("cart.returnsPolicy")}
        </Link>
        .
      </p>
    </div>
  );
}

export default function CartPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const {
    cart,
    cartTotal,
    discountAmount,
    appliedCoupon,
    checkoutSettings,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    applyCouponCode,
    removeCoupon,
    user,
    orders,
    isRedirectingToPayU,
    discardPendingCheckout,
  } = useShop();
  const authSectionRef = useRef<HTMLElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [shipping, setShipping] = useState<CheckoutShippingInput>({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryMethod: "standard",
    invoiceNip: "",
  });
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof CheckoutShippingInput, string>>
  >({});
  const [showFailedPayment, setShowFailedPayment] = useState(false);
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutAuthMode>(() => {
    const tab = searchParams.get("tab");
    if (tab === "register" || tab === "login") return tab;
    return "guest";
  });
  const [guest, setGuest] = useState<GuestCheckoutInput>({ name: "", email: "" });
  const [guestErrors, setGuestErrors] = useState<
    Partial<Record<keyof GuestCheckoutInput, string>>
  >({});
  const [payMethod, setPayMethod] = useState<CartPayMethod>("blik");
  const [payMethodError, setPayMethodError] = useState(false);

  useEffect(() => {
    if (isRedirectingToPayU) return;
    const pending = storage.getPendingCheckout();
    if (!pending) return;
    const pendingOrder = orders.find((order) => order.id === pending.orderId);
    if (pendingOrder && resolvePaymentStatus(pendingOrder) === "confirmed") {
      discardPendingCheckout();
      setShowFailedPayment(false);
      setFailedOrderId(null);
      return;
    }
    setFailedOrderId(pending.orderId);
    setShowFailedPayment(true);
  }, [isRedirectingToPayU, orders, discardPendingCheckout]);

  useEffect(() => {
    if (user) {
      setAuthError(false);
      setGuestErrors({});
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setShipping((prev) => ({
      ...prev,
      phone: prev.phone || user.phone || "",
      address: prev.address || user.address || "",
      city: prev.city || user.city || "",
      postalCode: prev.postalCode || user.postalCode || "",
    }));
  }, [user]);

  const checkoutTotals = useMemo(() => {
    if (!checkoutSettings) {
      return { deliveryFee: 0, orderTotal: cartTotal };
    }
    const totals = calculateOrderTotal(
      cartTotal,
      discountAmount,
      checkoutSettings,
      shipping.deliveryMethod
    );
    return {
      deliveryFee: totals.deliveryFee,
      orderTotal: totals.total,
    };
  }, [cartTotal, discountAmount, checkoutSettings, shipping.deliveryMethod]);

  function checkoutReady(): boolean {
    if (submitting) return false;

    const fieldErrors = validateCheckoutShipping(shipping);
    if (Object.keys(fieldErrors).length > 0) {
      setShippingErrors(fieldErrors);
      return false;
    }
    setShippingErrors({});

    if (!termsAccepted) {
      setTermsError(true);
      return false;
    }
    setTermsError(false);

    if (!user) {
      if (checkoutMode !== "guest") {
        setAuthError(true);
        authSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      const nextGuestErrors: Partial<Record<keyof GuestCheckoutInput, string>> = {};
      if (guest.name.trim().length < 2) nextGuestErrors.name = t("cart.guestNameError");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
        nextGuestErrors.email = t("cart.guestEmailError");
      }
      if (Object.keys(nextGuestErrors).length > 0) {
        setGuestErrors(nextGuestErrors);
        setAuthError(true);
        authSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      setGuestErrors({});
    }
    setAuthError(false);
    return true;
  }

  function orderShipping() {
    return {
      phone: shipping.phone.trim(),
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      postalCode: shipping.postalCode.trim(),
      deliveryMethod: shipping.deliveryMethod,
      invoiceNip: shipping.invoiceNip?.trim() || undefined,
      ...(!user
        ? { customer: guest.name.trim(), email: guest.email.trim() }
        : {}),
    };
  }

  async function handleApplyCoupon() {
    setApplyingCoupon(true);
    const ok = await applyCouponCode(couponInput);
    setApplyingCoupon(false);
    if (ok) setCouponInput("");
  }

  async function handleCheckout() {
    if (!checkoutReady()) return;

    const shippingPayload = orderShipping();
    const useApplePay = payMethod === "apple";
    if (useApplePay && !canUseApplePay()) {
      setPayMethodError(true);
      return;
    }
    const applePay = useApplePay ? beginApplePayPayment(orderTotal) : null;
    setSubmitting(true);
    try {
      if (applePay) {
        const apple = await applePay;
        if (apple === "cancelled") return;
        if (apple === "failed") {
          setPayMethodError(true);
          return;
        }
        const result = await placeOrder({
          ...shippingPayload,
          applePayToken: apple.paymentData,
        });
        apple.complete(Boolean(result?.payuRedirectUri));
        if (result?.payuRedirectUri) {
          window.location.href = result.payuRedirectUri;
        }
        return;
      }
      const result = await placeOrder(shippingPayload);
      if (result?.payuRedirectUri) {
        window.location.href = result.payuRedirectUri;
      }
    } finally {
      setSubmitting(false);
    }
  }

  const { deliveryFee, orderTotal } = checkoutTotals;
  const hasItems = cart.length > 0;

  return (
    <>
      <Header />
      <main className="py-10 sm:py-14 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isRedirectingToPayU && !hasItems ? (
            <p className="mt-16 text-center font-serif text-xl text-charcoal sm:mt-20">
              {t("payu.redirecting")}
            </p>
          ) : showFailedPayment ? (
            <div className="mt-4 sm:mt-8">
              <FailedPaymentScreen
                orderId={failedOrderId}
                onRetry={() => setShowFailedPayment(false)}
              />
            </div>
          ) : (
            <>
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl text-charcoal sm:text-4xl lg:text-5xl">
              {t("cart.title")}
            </h1>
          </div>

          {!hasItems ? (
            <div className="mt-16 text-center sm:mt-20">
              <ShoppingBag className="mx-auto h-12 w-12 text-sand" strokeWidth={1} />
              <p className="mt-4 font-serif text-xl text-charcoal">{t("cart.empty")}</p>
              <Link
                href="/produkty"
                className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase"
              >
                {t("cart.browse")}
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-12 xl:gap-16">
              <div className="min-w-0 space-y-12">
                <section className="space-y-5">
                  <SectionHeading step="01" title="Twoje produkty" />
                  <ul className="space-y-4">
                    {cart.map((item) => {
                      const stock = warehouseQty(item);
                      const maxForLine = remainingWarehouseQty(
                        item,
                        cart.filter((line) => line.cartKey !== item.cartKey)
                      );
                      const atStockLimit =
                        maxForLine != null && item.quantity >= maxForLine;
                      const colorHref = item.selectedColor
                        ? `/produkt/${item.slug}?kolor=${encodeURIComponent(item.selectedColor.id)}`
                        : `/produkt/${item.slug}`;
                      const colorLabel = item.selectedColor
                        ? describeCartColor(item.selectedColor)
                        : "";
                      return (
                      <li
                        key={item.cartKey}
                        className="flex gap-4 rounded-2xl border border-taupe/20 bg-white p-4 shadow-[0_8px_28px_-18px_rgba(17,17,17,0.18)] sm:gap-5 sm:p-5"
                      >
                        <Link
                          href={colorHref}
                          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-cream-light sm:h-32 sm:w-32"
                        >
                          <StoreImage
                            src={item.image}
                            alt={
                              colorLabel
                                ? `${item.name} — ${colorLabel}`
                                : item.name
                            }
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={colorHref}
                                className="font-serif text-xl leading-snug text-charcoal transition-colors hover:text-charcoal/80 sm:text-2xl"
                              >
                                {item.name}
                              </Link>
                              {(item.selectedColor ||
                                item.selectedSize?.label ||
                                item.selectedOptions?.length) && (
                              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-sand">
                                {item.selectedColor ? (
                                  <>
                                    <span
                                      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-taupe/40"
                                      style={{ backgroundColor: item.selectedColor.hex }}
                                      aria-hidden
                                    />
                                    {colorLabel}
                                  </>
                                ) : null}
                                {item.selectedSize?.label
                                  ? `${item.selectedColor ? " · " : ""}${item.selectedSize.label}`
                                  : null}
                                {item.selectedOptions?.map((entry) => (
                                  <span key={entry.option.id}>
                                    {" · "}
                                    {entry.option.name}: {entry.value.label}
                                  </span>
                                ))}
                              </p>
                              )}
                              {stock != null && stock > 0 ? (
                                <p className="mt-1 text-xs text-charcoal/60">
                                  {stock === 1
                                    ? t("product.stockOne")
                                    : t("product.stock", { n: stock })}
                                </p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cartKey)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sand transition-colors hover:bg-cream-light hover:text-charcoal"
                              aria-label={t("cart.remove")}
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                            <div className="flex items-center rounded-full border border-taupe/30 bg-cream/20">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                                className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:bg-cream-light"
                                aria-label={t("product.qtyDown")}
                              >
                                <Minus className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                              <span className="min-w-[2rem] text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                                disabled={atStockLimit}
                                className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:bg-cream-light disabled:opacity-40"
                                aria-label={t("product.qtyUp")}
                              >
                                <Plus className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-sand">{formatPrice(item.price)} / szt.</p>
                              <p className="font-serif text-xl text-charcoal sm:text-2xl">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="space-y-6 rounded-2xl border border-taupe/20 bg-white p-5 shadow-[0_8px_28px_-18px_rgba(17,17,17,0.15)] sm:p-7 lg:p-8">
                  <SectionHeading step="02" title="Dostawa i dane" />
                  <p className="text-sm leading-relaxed text-charcoal/70">
                    Uzupełnij adres — potem przekierujemy Cię do bezpiecznej płatności PayU.
                  </p>
                  <CheckoutShippingForm
                    value={shipping}
                    onChange={setShipping}
                    errors={shippingErrors}
                  />
                </section>

                <section ref={authSectionRef} className="space-y-5 scroll-mt-28">
                  <SectionHeading step="03" title={t("cart.accountStep")} />
                  {user ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 sm:p-6">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal font-serif text-base text-cream">
                        {userInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] tracking-[0.2em] text-emerald-800/80 uppercase">
                          {t("cart.accountLoggedIn")}
                        </p>
                        <p className="mt-0.5 font-medium text-charcoal">{user.name}</p>
                        <p className="truncate text-sm text-sand">{user.email}</p>
                      </div>
                      <User
                        className="ml-auto hidden h-5 w-5 shrink-0 text-emerald-700/60 sm:block"
                        strokeWidth={1.5}
                      />
                    </div>
                  ) : (
                    <CheckoutAuthPanel
                      highlight={authError}
                      mode={checkoutMode}
                      onModeChange={(next) => {
                        setCheckoutMode(next);
                        setAuthError(false);
                      }}
                      guest={guest}
                      onGuestChange={(next) => {
                        setGuest(next);
                        setGuestErrors({});
                        if (authError) setAuthError(false);
                      }}
                      guestErrors={guestErrors}
                      onAuthenticated={() => setAuthError(false)}
                    />
                  )}
                </section>
              </div>

              <aside className="lg-cart-summary-aside">
                <p className="mb-4 hidden text-[10px] tracking-[0.22em] text-sand uppercase lg:block">
                  Podsumowanie
                </p>
                <CartSummaryPanel
                  cartTotal={cartTotal}
                  discountAmount={discountAmount}
                  appliedCoupon={appliedCoupon}
                  deliveryFee={deliveryFee}
                  orderTotal={orderTotal}
                  couponInput={couponInput}
                  onCouponInputChange={setCouponInput}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCoupon}
                  applyingCoupon={applyingCoupon}
                  termsAccepted={termsAccepted}
                  onTermsChange={(checked) => {
                    setTermsAccepted(checked);
                    if (checked) setTermsError(false);
                  }}
                  termsError={termsError}
                  authError={authError}
                  submitting={submitting}
                  payMethod={payMethod}
                  onPayMethodChange={(next) => {
                    setPayMethod(next);
                    setPayMethodError(false);
                  }}
                  payMethodError={payMethodError}
                  onCheckout={handleCheckout}
                  onClearCart={clearCart}
                />
              </aside>
            </div>
          )}
            </>
          )}
        </div>
      </main>
      <div className={hasItems ? "lg:hidden" : undefined}>
        <Footer />
      </div>
    </>
  );
}
