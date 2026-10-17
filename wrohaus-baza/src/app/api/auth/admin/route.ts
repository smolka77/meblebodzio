import { NextResponse } from "next/server";
import { handleGateAction, originOk } from "@/lib/serwer/bramaAdmina";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function json(body: Record<string, unknown>, status: number) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

export async function POST(request: Request) {
  const headerList = await headers();
  if (!originOk(headerList)) {
    return json({ ok: false, error: "Nieprawidłowe pochodzenie żądania." }, 403);
  }

  if ((request.headers.get("content-type") ?? "").toLowerCase().indexOf("application/json") < 0) {
    return json({ ok: false, error: "Nieprawidłowe żądanie." }, 400);
  }

  let input: Record<string, unknown> = {};
  try {
    const decoded = (await request.json()) as unknown;
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      input = decoded as Record<string, unknown>;
    }
  } catch {
    return json({ ok: false, error: "Nieprawidłowe żądanie." }, 400);
  }

  const action = String(input.action ?? "status");
  const result = await handleGateAction(action, input);
  const { status, ...body } = result;
  return json(body, status);
}

/** Kompatybilność: strażnik panelu pyta czy sesja jest w stanie app. */
export async function GET() {
  const result = await handleGateAction("status", {});
  return json(
    {
      ok: result.ok,
      authenticated: result.step === "app",
      step: result.step,
      csrf: result.csrf,
      error: result.error,
    },
    result.status
  );
}
