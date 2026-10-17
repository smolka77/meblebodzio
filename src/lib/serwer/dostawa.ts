import { cache } from "react";
import { revalidatePath } from "next/cache";
import { readStore, writeStore, fileExists } from "./baza";
import {
  DEFAULT_DELIVERY,
  mergeDelivery,
  type DeliveryContent,
} from "@/lib/dostawa";
import { ensureStoreSeeded } from "./startDanych";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";

const FILE = "delivery.json";

export const getDelivery = cache(async (): Promise<DeliveryContent> => {
  await ensureStoreSeeded();
  if (!(await fileExists(FILE))) {
    await writeStore(FILE, DEFAULT_DELIVERY);
  }
  const stored = await readStore<Partial<DeliveryContent>>(FILE, DEFAULT_DELIVERY);
  return mergeDelivery(stored);
});

export async function updateDelivery(
  data: Partial<DeliveryContent>
): Promise<DeliveryContent> {
  const updated = mergeDelivery(data);
  await writeStore(FILE, updated);
  revalidatePath("/dostawa");
  revalidatePath("/admin/dostawa");
  revalidatePath("/koszyk");
  prefetchListingTranslationsFrom(updated);
  return updated;
}
