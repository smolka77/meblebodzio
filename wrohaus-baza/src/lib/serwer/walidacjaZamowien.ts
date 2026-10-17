import { getProducts } from "./produkty";
import { getFabricSurcharge } from "@/lib/infoTkanin";
import { getProductColorImage } from "@/lib/zdjeciaProduktu";
import { warehouseQty } from "@/lib/stanMagazynu";
import {
  describeSelectedOptions,
  optionsSurcharge,
  resolveOptionSelection,
  selectionFromResolved,
} from "@/lib/opcjeProduktu";
import type { UserOrderItem } from "@/lib/typy";

const MAX_QTY = 20;

export async function validateOrderItems(
  items: UserOrderItem[]
): Promise<
  | { ok: true; items: UserOrderItem[]; subtotal: number }
  | { ok: false; error: string }
> {
  if (!items?.length) {
    return { ok: false, error: "Koszyk jest pusty" };
  }
  if (items.length > 50) {
    return { ok: false, error: "Zbyt wiele pozycji w zamówieniu" };
  }

  const products = await getProducts();
  let subtotal = 0;
  const validated: UserOrderItem[] = [];
  const reserved = new Map<string, number>();

  for (const item of items) {
    if (!item.productId) {
      return { ok: false, error: "Nieprawidłowa pozycja koszyka" };
    }

    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return { ok: false, error: "Produkt nie istnieje lub został usunięty" };
    }
    if (!product.inStock) {
      return { ok: false, error: `${product.name} jest niedostępny` };
    }
    if (product.draft) {
      return { ok: false, error: `${product.name} nie jest dostępny` };
    }

    const already = reserved.get(product.id) ?? 0;
    const stock = warehouseQty(product);
    if (stock === 0) {
      return { ok: false, error: `${product.name} jest niedostępny` };
    }
    const requested = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (stock != null && already + requested > stock) {
      return {
        ok: false,
        error: `Na magazynie zostało tylko ${stock} szt. — ${product.name}`,
      };
    }
    const qty = Math.min(
      MAX_QTY,
      requested
    );
    reserved.set(product.id, already + qty);

    const chosenSize = product.sizes?.length
      ? product.sizes.find((entry) => entry.id === item.sizeId) ??
        product.sizes.find((entry) => entry.label === item.sizeName) ??
        product.sizes[0]
      : undefined;
    const sizeSurcharge = chosenSize?.surcharge ?? 0;
    const chosenColor = item.colorName?.trim()
      ? product.colors?.find((color) => color.name === item.colorName.trim())
      : undefined;
    const colorName = chosenColor?.name;
    const fabricSurcharge = getFabricSurcharge(chosenColor);
    const selectedOptions = resolveOptionSelection(
      product,
      item.options && typeof item.options === "object" ? item.options : undefined
    );
    const optionsExtra = optionsSurcharge(selectedOptions);
    const optionsName = describeSelectedOptions(selectedOptions);

    const line: UserOrderItem = {
      productId: product.id,
      name: product.name,
      price: product.price + sizeSurcharge + fabricSurcharge + optionsExtra,
      quantity: qty,
      image: chosenColor
        ? getProductColorImage(chosenColor, product.image)
        : product.image,
      colorName,
      sizeId: chosenSize?.id,
      sizeName: chosenSize?.label ?? (item.sizeName?.slice(0, 40) || undefined),
      ...(selectedOptions.length
        ? { options: selectionFromResolved(selectedOptions), optionsName }
        : {}),
    };

    validated.push(line);
    subtotal += line.price * qty;
  }

  return { ok: true, items: validated, subtotal };
}
