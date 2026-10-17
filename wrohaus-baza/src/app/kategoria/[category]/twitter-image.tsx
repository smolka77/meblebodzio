import OgImage from "./opengraph-image";

export const alt = "Kategoria Wrohaus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default function TwitterImage(
  props: Parameters<typeof OgImage>[0]
) {
  return OgImage(props);
}
