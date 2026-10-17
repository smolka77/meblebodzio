"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [ready, setReady] = useState(isLogin);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    fetch("/api/auth/admin", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    })
      .then((r) => r.json())
      .then((data: { step?: string }) => {
        if (data.step !== "app") {
          router.replace("/admin/login");
        } else {
          setReady(true);
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [isLogin, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-sand">Ładowanie panelu...</p>
      </div>
    );
  }

  return <>{children}</>;
}
