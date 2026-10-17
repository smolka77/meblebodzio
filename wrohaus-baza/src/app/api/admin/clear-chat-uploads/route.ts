import { NextResponse } from "next/server";
import { clearAllChatAttachments } from "@/lib/serwer/czyszczenieCzatu";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export const CLEAR_CHAT_ATTACHMENTS_PHRASE = "WYCZYŚĆ ZAŁĄCZNIKI";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as { confirmPhrase?: string };
  if (body.confirmPhrase?.trim() !== CLEAR_CHAT_ATTACHMENTS_PHRASE) {
    return NextResponse.json(
      { error: `Wpisz dokładnie: ${CLEAR_CHAT_ATTACHMENTS_PHRASE}` },
      { status: 400 }
    );
  }

  const result = await clearAllChatAttachments();
  return NextResponse.json({
    ok: true,
    ...result,
    message: `Usunięto ${result.filesRemoved} plik(ów), wyczyszczono ${result.messagesCleared} załącznik(ów) w rozmowach.`,
  });
}
