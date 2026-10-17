import { NextResponse } from "next/server";
import { deleteFaqCategory, renameFaqCategory } from "@/lib/serwer/faq";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { clampString } from "@/lib/serwer/walidacjaWejscia";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  let body: { title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const ok = await renameFaqCategory(id, clampString(body.title, 80));
  if (!ok) {
    return NextResponse.json(
      { error: "Podaj nazwę kategorii" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const ok = await deleteFaqCategory(id);
  if (!ok) {
    return NextResponse.json(
      { error: "Nie znaleziono kategorii" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
