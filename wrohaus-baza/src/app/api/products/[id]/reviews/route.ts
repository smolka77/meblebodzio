import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { addBuyerReview, buyerCanReview } from "@/lib/serwer/opinieKupujacych";
import { getCustomerUserId } from "@/lib/serwer/bramaKlienta";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const access = await buyerCanReview(id, {
    orderId: url.searchParams.get("orderId") ?? undefined,
    email: url.searchParams.get("email") ?? undefined,
  });
  const userId = await getCustomerUserId();
  return NextResponse.json({
    eligible: access.ok,
    loggedIn: Boolean(userId),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await enforceRateLimit(request, "review", 8, 15 * 60 * 1000);
  if (limited) return limited;
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }
  const result = await addBuyerReview(id, {
    rating: Number(body.rating),
    text: String(body.text ?? ""),
    author: String(body.author ?? ""),
    orderId: typeof body.orderId === "string" ? body.orderId : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
