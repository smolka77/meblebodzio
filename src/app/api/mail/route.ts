import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { getSettings } from "@/lib/serwer/ustawienia";
import {
  saveSmtpConfig,
  sendTestEmail,
  smtpStatus,
} from "@/lib/serwer/poczta";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await smtpStatus());
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    from?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  try {
    await saveSmtpConfig({
      host: body.host ?? "",
      port: body.port,
      secure: body.secure,
      user: body.user ?? "",
      pass: body.pass,
      from: body.from ?? "",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Nie udało się zapisać SMTP.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(await smtpStatus());
}

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const settings = await getSettings();
  const to = settings.adminEmail?.trim() || settings.contactEmail?.trim();
  if (!to) {
    return NextResponse.json(
      { error: "Uzupełnij e-mail administratora w ustawieniach sklepu." },
      { status: 400 }
    );
  }

  try {
    const sent = await sendTestEmail(to);
    if (!sent) {
      return NextResponse.json(
        {
          error:
            "SMTP nie jest skonfigurowane. Wpisz host, login i hasło skrzynki, potem zapisz.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, to });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Nie udało się wysłać testowego maila.",
      },
      { status: 502 }
    );
  }
}
