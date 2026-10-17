"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useShop } from "@/kontekst/KontekstSklepu";
import { createClientId } from "@/lib/idKlienta";
import {
  COOKIE_CONSENT_EVENT,
  hasAnalyticsConsent,
} from "@/lib/zgodaCookies";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("sofelio-session");
  if (!id) {
    id = createClientId();
    sessionStorage.setItem("sofelio-session", id);
  }
  return id;
}

export function SessionTracker() {
  const pathname = usePathname();
  const { cartCount, cartTotal } = useShop();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      setAllowed(hasAnalyticsConsent());
    }
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") || !allowed) return;

    function ping() {
      const sessionId = getSessionId();
      if (!sessionId) return;
      fetch("/api/analytics/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          path: pathname,
          cartCount,
          cartTotal,
        }),
      }).catch(() => {});
    }

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [pathname, cartCount, cartTotal, allowed]);

  return null;
}
