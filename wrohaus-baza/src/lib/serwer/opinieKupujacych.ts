import { revalidatePath } from "next/cache";
import type { ProductReview, StoreOrder } from "@/lib/typy";
import { getCustomerUserId } from "./bramaKlienta";
import { getOrders } from "./zamowienia";
import { getProductById, loadProductCatalog, saveProductCatalog } from "./produkty";

function bought(order: StoreOrder, productId: string): boolean {
  if (order.status === "cancelled") return false;
  if (!order.items.some((item) => item.productId === productId)) return false;
  return (
    order.paymentStatus === "confirmed" ||
    order.status === "processing" ||
    order.status === "shipped" ||
    order.status === "delivered"
  );
}

export async function buyerCanReview(
  productId: string,
  guest?: { orderId?: string; email?: string }
): Promise<{ ok: true; order: StoreOrder; userId?: string } | { ok: false }> {
  const orders = await getOrders();
  const userId = await getCustomerUserId();
  if (userId) {
    const order = orders.find((item) => item.userId === userId && bought(item, productId));
    if (order) return { ok: true, order, userId };
  }
  const orderId = guest?.orderId?.trim();
  const email = guest?.email?.trim().toLowerCase();
  if (orderId && email) {
    const order = orders.find(
      (item) =>
        item.id === orderId &&
        item.email.trim().toLowerCase() === email &&
        bought(item, productId)
    );
    if (order) return { ok: true, order, userId: order.userId };
  }
  return { ok: false };
}

export async function addBuyerReview(
  productId: string,
  input: {
    rating: number;
    text: string;
    author: string;
    orderId?: string;
    email?: string;
  }
): Promise<{ ok: true; review: ProductReview } | { ok: false; error: string; status: number }> {
  const product = await getProductById(productId);
  if (!product || product.draft) {
    return { ok: false, error: "Nie znaleziono produktu", status: 404 };
  }
  const rating = Math.round(Number(input.rating));
  const text = input.text.trim().slice(0, 1200);
  const author = input.author.trim().slice(0, 80);
  if (rating < 1 || rating > 5 || text.length < 8 || author.length < 2) {
    return { ok: false, error: "Uzupełnij ocenę, podpis i treść opinii", status: 400 };
  }
  const access = await buyerCanReview(productId, {
    orderId: input.orderId,
    email: input.email,
  });
  if (!access.ok) {
    return {
      ok: false,
      error: "Opinię może zostawić tylko klient, który kupił ten produkt.",
      status: 403,
    };
  }
  const reviews = product.reviews ?? [];
  const duplicate = reviews.some(
    (review) =>
      (access.userId && review.userId === access.userId) ||
      review.orderId === access.order.id
  );
  if (duplicate) {
    return { ok: false, error: "Przy tym meblu jest już opinia z tego zamówienia.", status: 409 };
  }
  const review: ProductReview = {
    id: crypto.randomUUID(),
    author,
    rating,
    text,
    createdAt: new Date().toISOString(),
    userId: access.userId,
    orderId: access.order.id,
  };
  const catalog = await loadProductCatalog();
  const index = catalog.findIndex((item) => item.id === productId);
  if (index === -1) {
    return { ok: false, error: "Nie znaleziono produktu", status: 404 };
  }
  catalog[index] = {
    ...catalog[index],
    reviews: [...(catalog[index].reviews ?? []), review],
  };
  await saveProductCatalog(catalog);
  revalidatePath(`/produkt/${product.slug}`);
  return { ok: true, review };
}
