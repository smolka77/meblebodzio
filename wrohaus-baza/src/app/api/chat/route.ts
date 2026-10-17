import { NextResponse } from "next/server";
import {
  getConversations,
  getConversationByVisitorId,
  sendVisitorMessage,
  getUnreadAdminCount,
} from "@/lib/serwer/czaty";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import {
  clampString,
  isValidVisitorId,
  sanitizeChatAttachmentUrl,
} from "@/lib/serwer/walidacjaWejscia";
import type { ChatAttachment } from "@/lib/typy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId");
  const unreadOnly = searchParams.get("unread");

  if (unreadOnly === "count") {
    const denied = await requireAdmin();
    if (denied) return denied;
    const count = await getUnreadAdminCount();
    return NextResponse.json({ count });
  }

  if (visitorId) {
    if (!isValidVisitorId(visitorId)) {
      return NextResponse.json({ error: "Invalid visitor" }, { status: 400 });
    }
    const limited = await enforceRateLimit(
      request,
      `chat-read:${visitorId}`,
      120,
      60 * 1000
    );
    if (limited) return limited;

    const conv = await getConversationByVisitorId(visitorId);
    return NextResponse.json(conv ?? null);
  }

  const denied = await requireAdmin();
  if (denied) return denied;
  const conversations = await getConversations();
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "chat-send", 40, 60 * 60 * 1000);
  if (limited) return limited;

  let body: {
    visitorId?: string;
    visitorName?: string;
    visitorEmail?: string;
    userId?: string;
    text?: string;
    attachment?: ChatAttachment;
    conversationId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const visitorId = clampString(body.visitorId, 64);
  if (!visitorId || !isValidVisitorId(visitorId)) {
    return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 });
  }

  if (body.attachment?.url && !sanitizeChatAttachmentUrl(body.attachment.url)) {
    return NextResponse.json({ error: "Nieprawidłowy załącznik" }, { status: 400 });
  }

  const text = clampString(body.text, 4000);
  if (!text && !body.attachment) {
    return NextResponse.json({ error: "Brak wymaganych danych" }, { status: 400 });
  }

  const name = clampString(body.visitorName, 120) || "Gość";
  const visitorEmail = body.visitorEmail
    ? clampString(body.visitorEmail, 254)
    : undefined;

  try {
    const conv = await sendVisitorMessage({
      visitorId,
      visitorName: name,
      visitorEmail,
      userId: body.userId ? clampString(body.userId, 64) : undefined,
      text,
      attachment: body.attachment,
      conversationId: body.conversationId
        ? clampString(body.conversationId, 64)
        : undefined,
    });
    return NextResponse.json(conv, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd wysyłki";
    const status = message.includes("dostępu") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
