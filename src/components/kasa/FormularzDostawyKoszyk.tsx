"use client";

import { Home, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { checkoutDeliveryMethods, DEFAULT_DELIVERY, type DeliveryIcon, type DeliveryMethod } from "@/lib/dostawa";

export interface CheckoutShippingInput {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryMethod: string;
  invoiceNip?: string;
}

interface CheckoutShippingFormProps {
  value: CheckoutShippingInput;
  onChange: (next: CheckoutShippingInput) => void;
  errors?: Partial<Record<keyof CheckoutShippingInput, string>>;
}

const fallbackDeliveryMethods = checkoutDeliveryMethods(DEFAULT_DELIVERY.methods);

const DELIVERY_LUCIDE: Record<DeliveryIcon, typeof Package> = {
  package: Package,
  home: Home,
  "map-pin": MapPin,
  truck: Package,
};

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
    >
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3.5 text-base text-charcoal placeholder:text-sand/80 transition-colors focus:border-charcoal focus:bg-white focus:outline-none";

export function CheckoutShippingForm({
  value,
  onChange,
  errors = {},
}: CheckoutShippingFormProps) {
  const [deliveryMethods, setDeliveryMethods] = useState(fallbackDeliveryMethods);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/delivery")
      .then((r) => r.json())
      .then((data: { methods?: DeliveryMethod[] }) => {
        if (cancelled || !Array.isArray(data?.methods)) return;
        const next = checkoutDeliveryMethods(data.methods);
        if (next.length) setDeliveryMethods(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (value.deliveryMethod !== "premium") return;
    onChange({ ...value, deliveryMethod: "standard" });
    // value/onChange omitted: remap only when the removed method is selected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.deliveryMethod]);

  function set<K extends keyof CheckoutShippingInput>(key: K, val: CheckoutShippingInput[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <FieldLabel>Sposób dostawy</FieldLabel>
        <div className="grid gap-3">
          {deliveryMethods.map((method) => {
            const selected = value.deliveryMethod === method.id;
            const Icon = DELIVERY_LUCIDE[method.icon] ?? Package;
            return (
              <label
                key={method.id}
                className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all sm:p-5 ${
                  selected
                    ? "border-charcoal bg-white shadow-[0_8px_28px_-18px_rgba(17,17,17,0.22)]"
                    : "border-taupe/25 bg-white/80 hover:border-taupe/45"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.id}
                  checked={selected}
                  onChange={() => set("deliveryMethod", method.id)}
                  className="sr-only"
                />
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    selected
                      ? "bg-charcoal text-cream"
                      : "bg-cream-light text-charcoal group-hover:bg-cream"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-serif text-lg text-charcoal">{method.title}</span>
                    <span
                      className={`text-sm font-medium ${selected ? "text-charcoal" : "text-sand"}`}
                    >
                      {method.priceLabel}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-charcoal/65">
                    {method.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.deliveryMethod && (
          <p className="text-sm text-terracotta">{errors.deliveryMethod}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="checkout-phone">Telefon</FieldLabel>
          <input
            id="checkout-phone"
            required
            type="tel"
            autoComplete="tel"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
            placeholder="+48 000 000 000"
          />
          {errors.phone && <p className="mt-1.5 text-sm text-terracotta">{errors.phone}</p>}
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="checkout-address">Ulica i numer</FieldLabel>
          <input
            id="checkout-address"
            required
            autoComplete="street-address"
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            className={inputClass}
            placeholder="ul. Przykładowa 12/3"
          />
          {errors.address && <p className="mt-1.5 text-sm text-terracotta">{errors.address}</p>}
        </div>

        <div>
          <FieldLabel htmlFor="checkout-city">Miasto</FieldLabel>
          <input
            id="checkout-city"
            required
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
            placeholder="Kąty Wrocławskie"
          />
          {errors.city && <p className="mt-1.5 text-sm text-terracotta">{errors.city}</p>}
        </div>

        <div>
          <FieldLabel htmlFor="checkout-postal">Kod pocztowy</FieldLabel>
          <input
            id="checkout-postal"
            required
            autoComplete="postal-code"
            value={value.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            className={inputClass}
            placeholder="00-000"
          />
          {errors.postalCode && (
            <p className="mt-1.5 text-sm text-terracotta">{errors.postalCode}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="checkout-nip">NIP na fakturę (opcjonalnie)</FieldLabel>
          <input
            id="checkout-nip"
            type="text"
            value={value.invoiceNip ?? ""}
            onChange={(e) => set("invoiceNip", e.target.value)}
            className={inputClass}
            placeholder="0000000000"
          />
        </div>
      </div>
    </div>
  );
}

export function validateCheckoutShipping(
  value: CheckoutShippingInput
): Partial<Record<keyof CheckoutShippingInput, string>> {
  const errors: Partial<Record<keyof CheckoutShippingInput, string>> = {};
  if (!value.phone.trim() || value.phone.trim().length < 9) {
    errors.phone = "Podaj numer telefonu";
  }
  if (!value.address.trim()) errors.address = "Podaj adres dostawy";
  if (!value.city.trim()) errors.city = "Podaj miasto";
  if (!/^\d{2}-\d{3}$/.test(value.postalCode.trim())) {
    errors.postalCode = "Kod pocztowy w formacie 00-000";
  }
  if (!value.deliveryMethod.trim()) {
    errors.deliveryMethod = "Wybierz sposób dostawy";
  }
  return errors;
}
