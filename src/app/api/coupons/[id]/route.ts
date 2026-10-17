import { NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/serwer/kupony";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { CouponInput } from "@/lib/serwer/kupony";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json()) as Partial<CouponInput>;
  const coupon = await updateCoupon(id, body);
  if (!coupon) {
    return NextResponse.json({ error: "Not found or invalid data" }, { status: 400 });
  }
  return NextResponse.json(coupon);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const ok = await deleteCoupon(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
