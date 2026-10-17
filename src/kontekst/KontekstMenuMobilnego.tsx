"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface AdminMobileNavContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const AdminMobileNavContext = createContext<AdminMobileNavContextValue | null>(
  null
);

export function AdminMobileNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <AdminMobileNavContext.Provider value={{ open, toggle, close }}>
      {children}
    </AdminMobileNavContext.Provider>
  );
}

export function useAdminMobileNav() {
  const ctx = useContext(AdminMobileNavContext);
  if (!ctx) {
    throw new Error("useAdminMobileNav must be used within AdminMobileNavProvider");
  }
  return ctx;
}
