"use client";

import { AdminHeader } from "@/components/panel/MenuBoczne";
import { EmailTemplatesPanel } from "@/components/panel/SzablonyMaile";

export function AdminMailePage() {
  return (
    <>
      <AdminHeader title="Maile do klienta" />
      <div className="admin-page">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-sm leading-relaxed text-sand">
            Tu zmieniasz treść maili, które klient dostaje po zamówieniu i po
            opłaceniu. SMTP (skrzynka nadawcy) jest w{" "}
            <a href="/admin/ustawienia" className="underline underline-offset-2">
              Ustawieniach
            </a>
            .
          </p>
          <EmailTemplatesPanel />
        </div>
      </div>
    </>
  );
}
