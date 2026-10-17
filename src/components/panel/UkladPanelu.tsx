"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/panel/MenuBoczne";
import { AdminBloodDrips } from "@/components/panel/KropleKrwi";
import { JarstolSyncPing } from "@/components/panel/PingJarstol";
import { AdminMobileNavProvider } from "@/kontekst/KontekstMenuMobilnego";
import {
  WantedThemeProvider,
  useWantedTheme,
} from "@/kontekst/KontekstPoszukiwanego";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminMobileNavProvider>
      <WantedThemeProvider>
        <AdminShell>{children}</AdminShell>
      </WantedThemeProvider>
    </AdminMobileNavProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unlocked } = useWantedTheme();
  const wantedTheme =
    pathname.startsWith("/admin/kto-to-robil") && unlocked;

  return (
    <div
      className={
        wantedTheme ? "admin-wanted min-h-screen" : "min-h-screen bg-cream"
      }
    >
      {wantedTheme && <AdminBloodDrips />}
      <JarstolSyncPing />
      <AdminSidebar />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
