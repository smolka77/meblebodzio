import { NextResponse } from "next/server";
import { getCustomerUserId } from "./bramaKlienta";

export async function requireCustomer() {
  const userId = await getCustomerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function getRequiredCustomerUserId(): Promise<string | null> {
  return getCustomerUserId();
}
