import { NextResponse } from "next/server";
import {
  createOrder,
  issueGuestAccessToken,
  setOrderPayUOrderId,
  toUserOrder,
} from "@/lib/serwer/zamowienia";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { getRequiredCustomerUserId } from "@/lib/serwer/ochronaKlienta";
import { findUserById } from "@/lib/serwer/uzytkownicy";
import { originOk } from "@/lib/serwer/bramaAdmina";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";
import { clampString, isValidEmail } from "@/lib/serwer/walidacjaWejscia";
import type { CreateOrderInput } from "@/lib/serwer/zamowienia";
import {
  createPayUPayment,
  isPayUConfigured,
  payuCustomerIp,
} from "@/lib/serwer/payuApi";
import { getSettings } from "@/lib/serwer/ustawienia";
import { queueShopNewOrderAlerts } from "@/lib/serwer/powiadomieniaZamowien";
import { isCartPayMethod } from "@/lib/kasa";

function clientIp(request: Request): string {
  return payuCustomerIp(request);
}

function validateShipping(body: CreateOrderInput): string | null {
  const phone = body.phone?.trim() ?? "";
  const address = body.address?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const postal = body.postalCode?.trim() ?? "";
  const method = body.deliveryMethod?.trim() ?? "";

  if (!phone || phone.length < 9) return "Podaj numer telefonu";
  if (!address || address.length < 3) return "Podaj adres dostawy";
  if (!city || city.length < 2) return "Podaj miasto";
  if (!/^\d{2}-\d{3}$/.test(postal)) return "Podaj kod pocztowy (np. 55-080)";
  if (!method) return "Wybierz sposób dostawy";
  return null;
}

function validateGuestContact(customer: string, email: string): string | null {
  if (customer.trim().length < 2) return "Podaj imię i nazwisko";
  if (!isValidEmail(email.trim())) return "Podaj prawidłowy e-mail";
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { getOrders } = await import("@/lib/serwer/zamowienia");
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const userId = await getRequiredCustomerUserId();
  const user = userId ? await findUserById(userId) : null;
  if (userId && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user && !originOk(request.headers)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = await enforceRateLimit(request, "orders", 25, 15 * 60 * 1000);
  if (limited) return limited;

  if (!isPayUConfigured()) {
    return NextResponse.json(
      {
        error:
          "Płatności PayU nie są jeszcze skonfigurowane. Skontaktuj się ze sklepem.",
      },
      { status: 503 }
    );
  }

  let body: CreateOrderInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const shippingError = validateShipping(body);
  if (shippingError) {
    return NextResponse.json({ error: shippingError }, { status: 400 });
  }

  const rawPayMethod =
    typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";
  if (rawPayMethod && !isCartPayMethod(rawPayMethod)) {
    return NextResponse.json({ error: "Wybierz sposób płatności" }, { status: 400 });
  }

  const guest = !user;
  const customer = guest
    ? clampString(body.customer, 120)
    : user.name;
  const email = guest ? clampString(body.email, 254) : user.email;
  if (guest) {
    const guestError = validateGuestContact(customer, email);
    if (guestError) {
      return NextResponse.json({ error: guestError }, { status: 400 });
    }
  }

  const guestAccess = guest ? issueGuestAccessToken() : null;

  const order = await createOrder({
    customer,
    email,
    userId: user?.id,
    guestAccessTokenHash: guestAccess?.hash,
    items: body.items,
    subtotal: body.subtotal,
    couponCode: body.couponCode,
    deliveryFee: body.deliveryFee,
    total: body.total,
    phone: clampString(body.phone, 40),
    address: clampString(body.address, 200),
    city: clampString(body.city, 80),
    postalCode: clampString(body.postalCode, 12),
    deliveryMethod: clampString(
      body.deliveryMethod === "premium" ? "standard" : body.deliveryMethod,
      40
    ),
    paymentMethod: isCartPayMethod(rawPayMethod) ? rawPayMethod : undefined,
    invoiceNip: body.invoiceNip ? clampString(body.invoiceNip, 15) : undefined,
  });

  if ("error" in order) {
    return NextResponse.json({ error: order.error }, { status: 400 });
  }

  try {
    const payu = await createPayUPayment(order, clientIp(request), {
      guestAccessToken: guestAccess?.token,
      applePayToken: (body as CreateOrderInput & { applePayToken?: unknown })
        .applePayToken,
    });
    await setOrderPayUOrderId(order.id, payu.payuOrderId);

    const settings = await getSettings();
    queueShopNewOrderAlerts(order, settings.adminEmail, settings.notifyNewOrders);

    return NextResponse.json(
      {
        ...toUserOrder(order),
        payuRedirectUri: payu.redirectUri,
        ...(guestAccess ? { guestAccessToken: guestAccess.token } : {}),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Nie udało się rozpocząć płatności. Spróbuj ponownie." },
      { status: 502 }
    );
  }
}
