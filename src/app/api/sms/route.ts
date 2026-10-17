import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import {
  saveSmsToken,
  sendTestSms,
  smsStatus,
} from "@/lib/serwer/sms";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const status = await smsStatus();
  return NextResponse.json(status);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  try {
    await saveSmsToken(body.token ?? "");
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Nie udało się zapisać tokenu.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await smsStatus());
}

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const sent = await sendTestSms();
    if (!sent) {
      return NextResponse.json(
        {
          error:
            "Brak tokenu SMSAPI. Wklej token OAuth z panelu SMSAPI.pl i zapisz.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "SMSAPI odrzuciło wiadomość testową.",
      },
      { status: 502 }
    );
  }
}
