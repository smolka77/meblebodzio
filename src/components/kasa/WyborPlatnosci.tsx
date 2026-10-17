"use client";

import { useLanguage } from "@/kontekst/KontekstJezyka";

import type { MessageKey } from "@/lib/jezyk";

export type CartPayMethod = "blik" | "card" | "apple" | "bank";

const OPTIONS: { id: CartPayMethod; labelKey: MessageKey; hintKey?: MessageKey }[] = [
  { id: "blik", labelKey: "cart.payBlik" },
  { id: "card", labelKey: "cart.payCard" },
  { id: "apple", labelKey: "cart.payApple", hintKey: "cart.payAppleHint" },
  { id: "bank", labelKey: "cart.payBank" },
];

export function CartPaymentMethodPicker({
  value,
  onChange,
  error,
}: {
  value: CartPayMethod;
  onChange: (value: CartPayMethod) => void;
  error?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <fieldset className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.15)] sm:p-6">
      <legend className="font-serif text-xl leading-tight text-charcoal sm:text-[1.35rem]">
        {t("cart.payMethod")}
      </legend>
      <div className="mt-4 space-y-2">
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                selected
                  ? "border-charcoal bg-cream/40"
                  : "border-taupe/25 bg-cream/10 hover:border-taupe/50"
              }`}
            >
              <input
                type="radio"
                name="cart-pay-method"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-charcoal"
              />
              <span>
                <span className="block text-sm font-medium text-charcoal">{t(option.labelKey)}</span>
                {option.hintKey && selected && (
                  <span className="mt-1 block text-xs leading-relaxed text-sand">
                    {t(option.hintKey)}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-terracotta">{t("cart.payMethodError")}</p>}
    </fieldset>
  );
}
