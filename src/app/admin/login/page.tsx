import type { Metadata } from "next";
import { AdminLoginGate } from "@/components/panel/BramaLogowania";

export const metadata: Metadata = {
  title: { absolute: "Logowanie | Wrohaus Admin" },
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export default function AdminLoginPage() {
  return <AdminLoginGate />;
}
