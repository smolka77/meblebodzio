import { NextResponse } from "next/server";
import { createApplePaySession, isPayUConfigured } from "@/lib/serwer/payuApi";
import { originOk } from "@/lib/serwer/bramaAdmina";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";

export async function POST(request: Request) {
  if (!originOk(request.headers)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const limited = await enforceRateLimit(request, "apple-pay", 30, 15 * 60 * 1000);
  if (limited) return limited;
  if (!isPayUConfigured()) {
    return NextResponse.json({ error: "PayU nie jest skonfigurowane" }, { status: 503 });
  }

  try {
    const session = await createApplePaySession();
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { error: "Nie udało się otworzyć Apple Pay" },
      { status: 502 }
    );
  }
}
