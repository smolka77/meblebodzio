"use client";

import { useEffect } from "react";

/** Raz na sesję panelu: jeśli katalog Jarstol jest stary, dociąga nowe szkice. */
export function JarstolSyncPing() {
  useEffect(() => {
    if (sessionStorage.getItem("jarstol-sync-ping")) return;
    sessionStorage.setItem("jarstol-sync-ping", "1");
    const ctrl = new AbortController();
    fetch("/api/jarstol/sync", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    })
      .then((res) => res.json())
      .then((status: { stale?: boolean }) => {
        if (!status?.stale) return;
        return fetch("/api/jarstol/sync", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ifStale: true }),
          signal: ctrl.signal,
        });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  return null;
}
