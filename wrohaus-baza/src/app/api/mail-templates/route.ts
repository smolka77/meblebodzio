import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import {
  getEmailTemplates,
  resetEmailTemplates,
  saveEmailTemplates,
} from "@/lib/serwer/szablonyPoczty";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_TOKENS,
  type ShopEmailTemplates,
} from "@/lib/szablonyMaile";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const templates = await getEmailTemplates();
  return NextResponse.json({
    templates,
    defaults: DEFAULT_EMAIL_TEMPLATES,
    tokens: EMAIL_TEMPLATE_TOKENS,
  });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<ShopEmailTemplates> & { reset?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const templates = body.reset
    ? await resetEmailTemplates()
    : await saveEmailTemplates(body);

  return NextResponse.json({
    templates,
    defaults: DEFAULT_EMAIL_TEMPLATES,
    tokens: EMAIL_TEMPLATE_TOKENS,
  });
}
