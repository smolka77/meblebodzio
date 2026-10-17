import { NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/serwer/kupony";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { CouponInput } from "@/lib/serwer/kupony";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const coupons = await getCoupons();
  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json()) as CouponInput;
  const coupon = await createCoupon(body);
  if (!coupon) {
    return NextResponse.json(
      { error: "Nie udało się utworzyć kodu — sprawdź dane i unikalność kodu" },
      { status: 400 }
    );
  }
  return NextResponse.json(coupon, { status: 201 });
}
