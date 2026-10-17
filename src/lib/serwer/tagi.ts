import { cache } from "react";
import { revalidatePath } from "next/cache";
import { readStore, writeStore, fileExists } from "./baza";
import {
  DEFAULT_PRODUCT_TAGS,
  mergeProductTags,
  type ProductTagsConfig,
} from "@/lib/tagi";
import { ensureStoreSeeded } from "./startDanych";

const FILE = "tags.json";

export const getProductTags = cache(async (): Promise<ProductTagsConfig> => {
  await ensureStoreSeeded();
  if (!(await fileExists(FILE))) {
    await writeStore(FILE, DEFAULT_PRODUCT_TAGS);
  }
  const stored = await readStore<Partial<ProductTagsConfig>>(FILE, DEFAULT_PRODUCT_TAGS);
  return mergeProductTags(stored);
});

export async function updateProductTags(
  data: Partial<ProductTagsConfig>
): Promise<ProductTagsConfig> {
  const updated = mergeProductTags(data);
  await writeStore(FILE, updated);
  revalidatePath("/");
  revalidatePath("/produkty");
  revalidatePath("/promocje");
  revalidatePath("/meble-od-reki");
  revalidatePath("/meble-do-7-dni");
  revalidatePath("/admin/tagi");
  return updated;
}
