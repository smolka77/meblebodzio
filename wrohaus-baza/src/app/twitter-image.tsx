import OgImage from "./opengraph-image";

export const alt = "Wrohaus | Meble i wyposażenie domu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default function TwitterImage() {
  return OgImage();
}
