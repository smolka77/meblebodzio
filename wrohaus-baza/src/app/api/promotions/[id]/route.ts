import { NextResponse } from "next/server";
import {
  deletePromotion,
  updatePromotion,
  type PromotionInput,
} from "@/lib/serwer/promocje";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json()) as Partial<PromotionInput>;
  const promotion = await updatePromotion(id, body);
  if (!promotion) {
    return NextResponse.json(
      { error: "Nie znaleziono promocji albo brak nazwy" },
      { status: 400 }
    );
  }
  return NextResponse.json(promotion);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const ok = await deletePromotion(id);
  if (!ok) {
    return NextResponse.json({ error: "Nie znaleziono promocji" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
