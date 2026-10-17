import { NextResponse } from "next/server";
import { findUserById, updateUserProfile } from "@/lib/serwer/uzytkownicy";
import {
  getCustomerSessionCsrf,
  getCustomerUserId,
} from "@/lib/serwer/bramaKlienta";
import { safeEqual } from "@/lib/serwer/bramaAdmina";
import {
  getRequiredCustomerUserId,
  requireCustomer,
} from "@/lib/serwer/ochronaKlienta";
import { clampString, isValidEmail } from "@/lib/serwer/walidacjaWejscia";

export async function GET() {
  const denied = await requireCustomer();
  if (denied) return denied;

  const userId = await getRequiredCustomerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const denied = await requireCustomer();
  if (denied) return denied;

  const userId = await getRequiredCustomerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; email?: string; csrf?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const csrf = await getCustomerSessionCsrf();
  if (!csrf || !body.csrf || !safeEqual(csrf, body.csrf)) {
    return NextResponse.json({ error: "Sesja wygasła. Odśwież stronę." }, { status: 400 });
  }

  const name = body.name != null ? clampString(body.name, 120) : undefined;
  const email =
    body.email != null ? clampString(body.email, 254).toLowerCase() : undefined;

  if (email != null && (!email || !isValidEmail(email))) {
    return NextResponse.json({ error: "Nieprawidłowy e-mail" }, { status: 400 });
  }

  const updated = await updateUserProfile(userId, {
    ...(name != null ? { name } : {}),
    ...(email != null ? { email } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Nie znaleziono konta" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
