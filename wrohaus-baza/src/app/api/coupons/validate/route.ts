import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/serwer/kupony";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { clampString } from "@/lib/serwer/walidacjaWejscia";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "coupons", 30, 15 * 60 * 1000);
  if (limited) return limited;

  const body = (await request.json()) as { code?: string; subtotal?: number };
  const code = clampString(body.code, 40);
  const subtotal = Math.max(0, Number(body.subtotal) || 0);

  if (!code) {
    return NextResponse.json({ error: "Podaj kod rabatowy" }, { status: 400 });
  }
  if (subtotal <= 0) {
    return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
  }

  const result = await validateCoupon(code, subtotal);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    code: result.coupon.code,
    name: result.coupon.name,
    discountPercent: result.coupon.discountPercent,
    discountAmount: result.discountAmount,
  });
}
