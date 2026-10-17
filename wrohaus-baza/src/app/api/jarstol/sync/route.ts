import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { getJarstolSyncStatus, syncJarstolCatalog } from "@/lib/serwer/jarstol";

export const maxDuration = 120;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const status = await getJarstolSyncStatus();
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const limited = await enforceRateLimit(request, "jarstol-sync", 8, 10 * 60 * 1000);
  if (limited) return limited;

  let ifStale = false;
  try {
    const body = (await request.json()) as { ifStale?: boolean };
    ifStale = Boolean(body?.ifStale);
  } catch {
    ifStale = false;
  }

  const result = await syncJarstolCatalog({ ifStale });
  return NextResponse.json(result);
}
