import { NextResponse } from "next/server";
import {
  getContactMessages,
  getUnreadContactCount,
  submitContactMessage,
} from "@/lib/serwer/kontakt";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("unread") === "count") {
    const denied = await requireAdmin();
    if (denied) return denied;
    const count = await getUnreadContactCount();
    return NextResponse.json({ count });
  }

  const denied = await requireAdmin();
  if (denied) return denied;
  const messages = await getContactMessages();
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "contact", 8, 60 * 60 * 1000);
  if (limited) return limited;

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };

  const result = await submitContactMessage({
    name: body.name ?? "",
    email: body.email ?? "",
    phone: body.phone,
    subject: body.subject ?? "",
    message: body.message ?? "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
