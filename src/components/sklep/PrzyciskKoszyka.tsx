"use client";

import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import type { Product, ProductColor, ProductSize } from "@/lib/typy";
import type { OptionSelection } from "@/lib/opcjeProduktu";
import { isPurchasable, remainingWarehouseQty } from "@/lib/stanMagazynu";

interface AddToCartButtonProps {
  product: Product;
  color?: ProductColor;
  size?: ProductSize;
  options?: OptionSelection;
  quantity?: number;
  className?: string;
  label?: string;
  /** Gdy ogłoszenie ma kolory / pokrowce — bez wyboru przycisk jest nieaktywny. */
  requireColor?: boolean;
  choiceLabel?: string;
}

export function AddToCartButton({
  product,
  color,
  size,
  options,
  quantity = 1,
  className = "",
  label,
  requireColor = false,
  choiceLabel,
}: AddToCartButtonProps) {
  const { addToCart, cart } = useShop();
  const { t } = useLanguage();
  const remaining = remainingWarehouseQty(product, cart);
  const canBuy = isPurchasable(product) && (remaining == null || remaining > 0);
  const needsColor = requireColor && !color;
  const enabled = canBuy && !needsColor;

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => addToCart(product, quantity, color, size, options)}
      className={
        className ||
        "inline-flex h-[50px] items-center justify-center rounded-full bg-accent px-8 text-[15px] font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {label ??
        (needsColor
          ? choiceLabel ?? t("product.pickColorFirst")
          : canBuy
            ? t("product.addToCart")
            : t("product.soldOut"))}
    </button>
  );
}
