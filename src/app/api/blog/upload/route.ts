import { NextResponse } from "next/server";
import { saveBlogImage } from "@/lib/serwer/wgrywanieBloga";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    }
    const result = await saveBlogImage(file);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
