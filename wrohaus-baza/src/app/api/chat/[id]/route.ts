import { NextResponse } from "next/server";
import {
  getConversationById,
  sendAdminReply,
  markReadByAdmin,
  markReadByVisitor,
  deleteConversation,
} from "@/lib/serwer/czaty";
import type { ChatAttachment } from "@/lib/typy";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId");

  const conv = await getConversationById(id);
  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (visitorId) {
    if (visitorId.length < 8 || visitorId.length > 64) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (conv.visitorId !== visitorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(conv);
  }

  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(conv);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const { text, attachment } = (await request.json()) as {
    text: string;
    attachment?: ChatAttachment;
  };
  if (!text?.trim() && !attachment) {
    return NextResponse.json({ error: "Wiadomość pusta" }, { status: 400 });
  }

  const conv = await sendAdminReply(id, text ?? "", attachment);
  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(conv);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action, visitorId } = (await request.json()) as {
    action: "read_admin" | "read_visitor";
    visitorId?: string;
  };

  if (action === "read_admin") {
    const denied = await requireAdmin();
    if (denied) return denied;
    await markReadByAdmin(id);
    return NextResponse.json({ ok: true });
  }

  if (action === "read_visitor") {
    const conv = await getConversationById(id);
    if (!conv || conv.visitorId !== visitorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await markReadByVisitor(id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const ok = await deleteConversation(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
