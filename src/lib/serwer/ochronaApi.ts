import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/serwer/uwierzytelnianie";

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
