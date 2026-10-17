import { cache } from "react";
import { revalidatePath } from "next/cache";
import { readStore, writeStore, fileExists } from "./baza";
import { DEFAULT_ABOUT, mergeAbout, type AboutContent } from "@/lib/oNas";
import { ensureStoreSeeded } from "./startDanych";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";

const FILE = "about.json";

export const getAbout = cache(async (): Promise<AboutContent> => {
  await ensureStoreSeeded();
  if (!(await fileExists(FILE))) {
    await writeStore(FILE, DEFAULT_ABOUT);
  }
  const stored = await readStore<Partial<AboutContent>>(FILE, DEFAULT_ABOUT);
  return mergeAbout(stored);
});

export async function updateAbout(
  data: Partial<AboutContent>
): Promise<AboutContent> {
  const updated = mergeAbout(data);
  await writeStore(FILE, updated);
  revalidatePath("/");
  revalidatePath("/o-nas");
  revalidatePath("/admin/o-nas");
  revalidatePath("/sitemap.xml");
  prefetchListingTranslationsFrom(updated);
  return updated;
}
