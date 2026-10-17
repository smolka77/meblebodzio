import { NextResponse } from "next/server";
import type { StoreUploadKind } from "@/lib/serwer/wgrywanie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = new Set<StoreUploadKind>(["products", "blog", "fabrics"]);

/** Stare /uploads/… → /api/media/… z miniaturą. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; filename: string }> }
) {
  const { kind: rawKind, filename: rawFilename } = await params;
  if (!KINDS.has(rawKind as StoreUploadKind)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filename = decodeURIComponent(rawFilename);
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const dest = new URL(
    `/api/media/${rawKind}/${encodeURIComponent(filename)}`,
    url.origin
  );
  url.searchParams.forEach((value, key) => dest.searchParams.set(key, value));
  return NextResponse.redirect(dest, 308);
}
