"use client";

import { useEffect } from "react";

export default function AdminMaileRedirectPage() {
  useEffect(() => {
    window.location.replace("/admin/ustawienia#maile");
  }, []);
  return (
    <p className="admin-page text-sm text-sand">Przekierowanie do Ustawień…</p>
  );
}
