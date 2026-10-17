import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { resetOperationalData, RESET_CONFIRM_PHRASE } from "@/lib/serwer/resetSklepu";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { confirmPhrase?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  if (body.confirmPhrase?.trim() !== RESET_CONFIRM_PHRASE) {
    return NextResponse.json(
      { error: `Wpisz dokładnie: ${RESET_CONFIRM_PHRASE}` },
      { status: 400 }
    );
  }

  try {
    const result = await resetOperationalData();
    return NextResponse.json({
      ok: true,
      message: "Dane operacyjne zostały zresetowane.",
      cleared: result.cleared,
    });
  } catch (err) {
    console.error("[admin/reset-store]", err);
    return NextResponse.json(
      { error: "Reset nie powiódł się. Sprawdź uprawnienia serwera." },
      { status: 500 }
    );
  }
}
