import { obrazMarki } from "@/lib/ogObrazy";

export const alt = "Wrohaus | Meble i wyposażenie domu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  return obrazMarki();
}
