import { NextResponse } from "next/server";
import {
  getCustomerAuthStatus,
  handleCustomerAuthAction,
} from "@/lib/serwer/bramaKlienta";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";

export async function GET() {
  const result = await getCustomerAuthStatus();
  return NextResponse.json(
    {
      authenticated: result.authenticated ?? false,
      user: result.user ?? null,
      csrf: result.csrf,
    },
    { status: result.status }
  );
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "auth", 20, 15 * 60 * 1000);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const result = await handleCustomerAuthAction(action, body);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Błąd" },
      { status: result.status }
    );
  }

  if (
    action === "changePassword" ||
    action === "requestPasswordReset" ||
    action === "resetPassword"
  ) {
    return NextResponse.json({ ok: true, csrf: result.csrf, message: result.message });
  }

  return NextResponse.json(
    {
      authenticated: result.authenticated ?? false,
      user: result.user ?? null,
      csrf: result.csrf,
    },
    { status: result.status }
  );
}
