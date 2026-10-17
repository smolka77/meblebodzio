import { NextResponse } from "next/server";
import { pingSession } from "@/lib/serwer/sesje";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { clampString } from "@/lib/serwer/walidacjaWejscia";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "analytics", 120, 60 * 1000);
  if (limited) return limited;

  const body = (await request.json()) as {
    sessionId?: string;
    path?: string;
    cartCount?: number;
    cartTotal?: number;
  };

  const sessionId = clampString(body.sessionId, 80);
  if (!sessionId || sessionId.length < 8) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  await pingSession({
    sessionId,
    path: clampString(body.path, 500) || "/",
    cartCount: Math.min(99, Math.max(0, Math.floor(Number(body.cartCount) || 0))),
    cartTotal: Math.min(1_000_000, Math.max(0, Number(body.cartTotal) || 0)),
  });
  return NextResponse.json({ ok: true });
}
