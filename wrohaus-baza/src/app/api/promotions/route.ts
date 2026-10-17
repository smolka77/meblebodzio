import { NextResponse } from "next/server";
import {
  createPromotion,
  getPromotions,
  type PromotionInput,
} from "@/lib/serwer/promocje";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const promotions = await getPromotions();
  return NextResponse.json(promotions);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json()) as PromotionInput;
  const promotion = await createPromotion(body);
  if (!promotion) {
    return NextResponse.json(
      { error: "Podaj nazwę promocji" },
      { status: 400 }
    );
  }
  return NextResponse.json(promotion, { status: 201 });
}
