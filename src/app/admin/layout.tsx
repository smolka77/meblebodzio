import { AdminAuthGuard } from "@/components/panel/StraznikSesji";
import { AdminLayoutClient } from "@/components/panel/UkladPanelu";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Panel Wrohaus" },
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminAuthGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthGuard>
  );
}
