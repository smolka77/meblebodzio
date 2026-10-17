import OgImage from "./opengraph-image";

export const alt = "Blog Wrohaus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function TwitterImage(
  props: Parameters<typeof OgImage>[0]
) {
  return OgImage(props);
}
