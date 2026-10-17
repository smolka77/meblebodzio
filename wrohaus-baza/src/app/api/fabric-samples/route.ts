import { NextResponse } from "next/server";
import {
  getFabricSampleRequests,
  getUnreadFabricSampleCount,
  submitFabricSampleRequest,
} from "@/lib/serwer/probkiTkanin";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("unread") === "count") {
    const denied = await requireAdmin();
    if (denied) return denied;
    const count = await getUnreadFabricSampleCount();
    return NextResponse.json({ count });
  }
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await getFabricSampleRequests());
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "fabric-samples", 8, 60 * 60 * 1000);
  if (limited) return limited;

  const body = (await request.json()) as {
    fabricIds?: string[];
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    message?: string;
  };
  const result = await submitFabricSampleRequest({
    fabricIds: body.fabricIds ?? [],
    name: body.name ?? "",
    email: body.email ?? "",
    phone: body.phone,
    street: body.street ?? "",
    city: body.city ?? "",
    postalCode: body.postalCode ?? "",
    message: body.message,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
