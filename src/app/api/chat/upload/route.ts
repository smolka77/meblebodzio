import { NextResponse } from "next/server";
import { saveChatUpload } from "@/lib/serwer/wgrywanieCzatu";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { clampString, isValidVisitorId } from "@/lib/serwer/walidacjaWejscia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "chat-upload", 20, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const formData = await request.formData();
    const visitorId = clampString(formData.get("visitorId"), 64);

    if (!visitorId || !isValidVisitorId(visitorId)) {
      return NextResponse.json({ error: "Brak identyfikatora czatu" }, { status: 400 });
    }

    const entry = formData.get("file");

    if (!entry || typeof entry === "string") {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    }

    if (!("arrayBuffer" in entry) || typeof entry.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Nieprawidłowy plik" }, { status: 400 });
    }

    const attachment = await saveChatUpload(entry as File);
    return NextResponse.json(attachment);
  } catch (err) {
    console.error("[chat/upload]", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
