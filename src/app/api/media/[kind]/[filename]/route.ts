import { NextResponse } from "next/server";
import {
  mimeFromStoreFilename,
  readLegacyStoreUpload,
  readStoreUpload,
  type StoreUploadKind,
} from "@/lib/serwer/wgrywanie";
import { resizedStoreImage, snapImageWidth } from "@/lib/serwer/miniatura";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = new Set<StoreUploadKind>(["products", "blog", "fabrics"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; filename: string }> }
) {
  const { kind: rawKind, filename: rawFilename } = await params;
  if (!KINDS.has(rawKind as StoreUploadKind)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const kind = rawKind as StoreUploadKind;
  const filename = decodeURIComponent(rawFilename);

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stored = await readStoreUpload(kind, filename);
  if (stored) {
    const width = snapImageWidth(new URL(request.url).searchParams.get("w"));
    const resized = await resizedStoreImage(
      kind,
      filename,
      stored.buffer,
      stored.mimeType,
      width
    );
    const body = resized?.buffer ?? stored.buffer;
    const mimeType = resized?.mimeType ?? stored.mimeType;
    const isPdf = mimeType === "application/pdf";
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": resized
          ? "public, max-age=31536000, immutable"
          : "public, max-age=86400",
        "X-Robots-Tag": "all",
        ...(isPdf
          ? { "Content-Disposition": `inline; filename="${filename}"` }
          : {}),
      },
    });
  }

  const legacy = await readLegacyStoreUpload(kind, filename);
  if (legacy) {
    return new NextResponse(new Uint8Array(legacy), {
      headers: {
        "Content-Type": mimeFromStoreFilename(filename),
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
