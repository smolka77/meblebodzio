import { NextResponse } from "next/server";
import { subscribeEmail, getSubscribers } from "@/lib/serwer/newsletter";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { clampString, isValidEmail } from "@/lib/serwer/walidacjaWejscia";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const subscribers = await getSubscribers();
  return NextResponse.json(subscribers);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "newsletter", 10, 60 * 60 * 1000);
  if (limited) return limited;

  const { email: raw } = (await request.json()) as { email?: string };
  const email = clampString(raw, 254).toLowerCase();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  const result = await subscribeEmail(email);
  return NextResponse.json(result);
}
