import { obrazMarki, obrazSamoZdjecie } from "@/lib/ogObrazy";
import { urlZdjeciaProduktu, zrodloObrazuOg } from "@/lib/serwer/obrazOg";
import { getProductBySlug } from "@/lib/serwer/produkty";

export const alt = "Produkt Wrohaus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProductOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.draft) return obrazMarki("Meble i wyposażenie domu");

  const photo = urlZdjeciaProduktu(product);
  if (!photo) return obrazMarki(product.name);

  const imageSrc = await zrodloObrazuOg(photo);
  if (!imageSrc) return obrazMarki(product.name);

  try {
    return await obrazSamoZdjecie(imageSrc);
  } catch {
    return obrazMarki(product.name);
  }
}
