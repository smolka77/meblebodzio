import { obrazMarki } from "@/lib/ogObrazy";
import { getCategoryPageModel } from "@/lib/serwer/kategorieWlasne";

export const alt = "Kategoria Wrohaus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function CategoryOgImage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const model = await getCategoryPageModel(category);
  const label = model?.name ?? "Meble";
  return obrazMarki(`${label} polskiej produkcji`);
}
