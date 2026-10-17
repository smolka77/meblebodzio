import { NextResponse } from "next/server";
import { deleteFaqItem, updateFaqItem } from "@/lib/serwer/faq";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { clampString } from "@/lib/serwer/walidacjaWejscia";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  let body: { question?: string; answer?: string; categoryTitle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const question = clampString(body.question, 300);
  const answer = clampString(body.answer, 4000);
  if (!question || !answer) {
    return NextResponse.json(
      { error: "Wypełnij pytanie i odpowiedź" },
      { status: 400 }
    );
  }

  const item = await updateFaqItem(id, {
    question,
    answer,
    categoryTitle: body.categoryTitle
      ? clampString(body.categoryTitle, 80)
      : undefined,
  });

  if (!item) {
    return NextResponse.json({ error: "Nie znaleziono pytania" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const ok = await deleteFaqItem(id);
  if (!ok) {
    return NextResponse.json({ error: "Nie znaleziono pytania" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
