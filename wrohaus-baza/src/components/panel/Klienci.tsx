"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { formatPrice } from "@/lib/dane";
import type { Customer } from "@/lib/typy";

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {});
  }, []);

  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <>
      <AdminHeader title="Klienci" />
      <div className="admin-page">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <p className="text-xs text-sand uppercase">Aktywni klienci</p>
            <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
              {customers.length}
            </p>
          </div>
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <p className="text-xs text-sand uppercase">Łączne wydatki</p>
            <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
              {formatPrice(totalSpent)}
            </p>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {customers.length === 0 ? (
            <p className="rounded-xl border border-taupe/30 bg-white px-4 py-8 text-center text-sm text-sand">
              Brak klientów — pojawią się po rejestracji lub złożeniu zamówienia.
            </p>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-xl border border-taupe/30 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs text-cream">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal">{customer.name}</p>
                    <p className="truncate text-sm text-sand">{customer.email}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-taupe/15 pt-3 text-center text-xs">
                  <div>
                    <dt className="text-sand">Zamówienia</dt>
                    <dd className="mt-0.5 font-medium text-charcoal">{customer.orders}</dd>
                  </div>
                  <div>
                    <dt className="text-sand">Wydatki</dt>
                    <dd className="mt-0.5 font-medium text-charcoal">
                      {formatPrice(customer.totalSpent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sand">Dołączył</dt>
                    <dd className="mt-0.5 text-charcoal">{customer.joined}</dd>
                  </div>
                </dl>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-taupe/30 bg-white md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taupe/20 text-left text-xs tracking-wide text-sand uppercase">
                <th className="px-6 py-3 font-medium">Klient</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Zamówienia</th>
                <th className="px-6 py-3 font-medium">Wydatki</th>
                <th className="px-6 py-3 font-medium">Dołączył</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sand">
                    Brak klientów — pojawią się po rejestracji lub złożeniu zamówienia.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-taupe/10 transition-colors hover:bg-cream-light/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-xs text-cream">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="font-medium text-charcoal">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sand">{customer.email}</td>
                    <td className="px-6 py-4 text-charcoal">{customer.orders}</td>
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-sand">{customer.joined}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
