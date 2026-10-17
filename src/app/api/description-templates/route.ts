import { NextResponse } from "next/server";
import {
  deleteCustomDescriptionTemplate,
  getDescriptionTemplatesStore,
  saveCustomDescriptionTemplate,
} from "@/lib/serwer/szablonyOpisu";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { DescriptionTemplateDetails } from "@/lib/szablonyOpisuZapis";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const store = await getDescriptionTemplatesStore();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    id?: string;
    label?: string;
    hint?: string;
    details?: DescriptionTemplateDetails;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  if (!body.label?.trim() || !body.details) {
    return NextResponse.json({ error: "Podaj nazwę i treść szablonu" }, { status: 400 });
  }

  const saved = await saveCustomDescriptionTemplate({
    id: body.id,
    label: body.label,
    hint: body.hint,
    details: body.details,
  });
  return NextResponse.json(saved);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Brak id szablonu" }, { status: 400 });
  }

  await deleteCustomDescriptionTemplate(id);
  return NextResponse.json({ ok: true });
}
