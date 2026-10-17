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
        "min-h-[48px] rounded-full bg-charcoal px-8 py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85 disabled:cursor-not-allowed disabled:opacity-50"
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
