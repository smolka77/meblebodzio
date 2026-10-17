import { NextResponse } from "next/server";
import {
  mimeFromFilename,
  readChatUpload,
  readLegacyChatUpload,
} from "@/lib/serwer/wgrywanieCzatu";
import { visitorCanAccessChatFile } from "@/lib/serwer/czaty";
import { isAdminAuthenticated } from "@/lib/serwer/uwierzytelnianie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: raw } = await params;
  const filename = decodeURIComponent(raw);

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = await isAdminAuthenticated();
  if (!admin) {
    const url = new URL(request.url);
    const visitorId = url.searchParams.get("visitorId")?.trim() ?? "";
    if (!visitorId || !(await visitorCanAccessChatFile(filename, visitorId))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const stored = await readChatUpload(filename);
  if (stored) {
    return new NextResponse(new Uint8Array(stored.buffer), {
      headers: {
        "Content-Type": stored.mimeType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${filename.replace(/^[^-]+-/, "")}"`,
      },
    });
  }

  const legacy = await readLegacyChatUpload(filename);
  if (legacy) {
    return new NextResponse(new Uint8Array(legacy), {
      headers: {
        "Content-Type": mimeFromFilename(filename),
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${filename.replace(/^[^-]+-/, "")}"`,
      },
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
