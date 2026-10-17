"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import type { NewsletterSubscriber } from "@/lib/typy";

export function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  const load = useCallback(() => {
    fetch("/api/newsletter")
      .then((r) => r.json())
      .then(setSubscribers)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id: string, action: "unsubscribe" | "delete") {
    await fetch(`/api/newsletter/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  function exportCsv() {
    const active = subscribers.filter((s) => s.active);
    const csv = ["email,data_zapisu", ...active.map((s) => `${s.email},${s.subscribedAt}`)].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wrohaus-newsletter.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = subscribers.filter((s) => s.active).length;

  return (
    <>
      <AdminHeader title="Newsletter" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-taupe/30 bg-white p-4">
              <p className="text-xs text-sand uppercase">Subskrybenci</p>
              <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
                {activeCount}
              </p>
            </div>
            <div className="rounded-xl border border-taupe/30 bg-white p-4">
              <p className="text-xs text-sand uppercase">Wypisanych</p>
              <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
                {subscribers.length - activeCount}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm text-charcoal active:bg-cream-light sm:w-auto sm:justify-start"
          >
            <Download className="h-4 w-4" />
            Eksportuj CSV
          </button>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-taupe/30 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-charcoal">{sub.email}</p>
                  <p className="mt-1 text-xs text-sand">
                    {new Date(sub.subscribedAt).toLocaleString("pl-PL")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    sub.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {sub.active ? "Aktywny" : "Wypisany"}
                </span>
              </div>
              <div className="mt-3 flex gap-2 border-t border-taupe/15 pt-3">
                {sub.active && (
                  <button
                    type="button"
                    onClick={() => handleAction(sub.id, "unsubscribe")}
                    className="min-h-[40px] flex-1 rounded-lg border border-taupe/30 text-xs text-charcoal active:bg-cream-light"
                  >
                    Wypisz
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAction(sub.id, "delete")}
                  className="flex min-h-[40px] min-w-[44px] items-center justify-center rounded-lg border border-red-200 text-red-600 active:bg-red-50"
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {subscribers.length === 0 && (
            <p className="rounded-xl border border-taupe/30 bg-white px-4 py-8 text-center text-sm text-sand">
              Brak subskrybentów — zachęć klientów do zapisu na stronie głównej.
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-taupe/30 bg-white md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taupe/20 text-left text-xs tracking-wide text-sand uppercase">
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Data zapisu</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-taupe/10 transition-colors hover:bg-cream-light/50"
                >
                  <td className="px-6 py-4 font-medium text-charcoal">{sub.email}</td>
                  <td className="px-6 py-4 text-sand">
                    {new Date(sub.subscribedAt).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        sub.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub.active ? "Aktywny" : "Wypisany"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {sub.active && (
                        <button
                          type="button"
                          onClick={() => handleAction(sub.id, "unsubscribe")}
                          className="text-xs text-sand hover:text-charcoal"
                        >
                          Wypisz
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAction(sub.id, "delete")}
                        className="p-1 text-sand hover:text-red-600"
                        aria-label="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sand">
                    Brak subskrybentów — zachęć klientów do zapisu na stronie głównej.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
