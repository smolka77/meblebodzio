import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDev = process.env.NODE_ENV === "development";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Nie DENY — PayU ładuje Apple Pay w ramce ze sklepu. CSP frame-ancestors ogranicza do PayU.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // payment=() wyłącza Payment Request API — PayU/Apple Pay wtedy nie wstaje
  // (także w iframe ze strony płatności PayU).
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=*"
  );
  response.headers.set("X-DNS-Prefetch-Control", "off");

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  }

  const isMediaRoute = request.nextUrl.pathname.startsWith("/api/media/");
  if (request.nextUrl.pathname.startsWith("/api/") && !isMediaRoute) {
    response.headers.set("Cache-Control", "no-store");
  } else if (
    request.method === "GET" &&
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/konto") &&
    !request.nextUrl.pathname.startsWith("/koszyk")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=120, stale-while-revalidate=600"
    );
  }

  // Dev: React/Next potrzebuje unsafe-eval i WebSocket (HMR).
  // Prod: bez unsafe-eval — bezpieczniejsza polityka.
  const payuHosts =
    "https://secure.payu.com https://secure.snd.payu.com https://static.payu.com https://credit-widget-config.payu.com https://credit.payu.com https://poland.payu.com";
  const applePayHosts =
    "https://apple-pay-gateway.apple.com https://apple-pay-gateway-nc-pod1.apple.com https://apple-pay-gateway-nc-pod2.apple.com https://apple-pay-gateway-nc-pod3.apple.com https://apple-pay-gateway-nc-pod4.apple.com https://apple-pay-gateway-nc-pod5.apple.com https://apple-pay-gateway-pr-pod1.apple.com https://apple-pay-gateway-pr-pod2.apple.com https://apple-pay-gateway-pr-pod3.apple.com https://apple-pay-gateway-pr-pod4.apple.com https://apple-pay-gateway-pr-pod5.apple.com https://apple-pay-gateway-cert.apple.com https://applepay.cdn-apple.com";
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.payu.com https://applepay.cdn-apple.com`
    : `script-src 'self' 'unsafe-inline' https://static.payu.com https://applepay.cdn-apple.com`;
  const connectSrc = isDev
    ? `connect-src 'self' ws: wss: ${payuHosts} ${applePayHosts}`
    : `connect-src 'self' ${payuHosts} ${applePayHosts}`;

  const formAction = isDev
    ? "form-action 'self' https://secure.payu.com https://secure.snd.payu.com"
    : "form-action 'self' https://secure.payu.com https://secure.snd.payu.com";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://static.payu.com https://applepay.cdn-apple.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://app.jarstol.eu https://static.payu.com https://poland.payu.com https://secure.payu.com https://secure.snd.payu.com https://credit.payu.com https://applepay.cdn-apple.com https://www.apple.com",
    "media-src 'self' blob: https:",
    "font-src 'self' https://static.payu.com",
    connectSrc,
    "frame-ancestors 'self' https://secure.payu.com https://secure.snd.payu.com",
    "frame-src https://secure.payu.com https://secure.snd.payu.com https://static.payu.com https://credit.payu.com https://credit-widget-config.payu.com https://applepay.cdn-apple.com https://www.apple.com https://apple.com",
    "child-src https://secure.payu.com https://secure.snd.payu.com https://static.payu.com https://applepay.cdn-apple.com https://www.apple.com https://apple.com",
    "base-uri 'self'",
    formAction,
    "object-src 'none'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|\\.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
