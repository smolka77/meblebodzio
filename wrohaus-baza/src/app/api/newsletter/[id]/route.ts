import { NextResponse } from "next/server";
import { deleteSubscriber, unsubscribeEmail } from "@/lib/serwer/newsletter";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const { action } = (await request.json()) as { action: "unsubscribe" | "delete" };
  const ok =
    action === "delete" ? await deleteSubscriber(id) : await unsubscribeEmail(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
