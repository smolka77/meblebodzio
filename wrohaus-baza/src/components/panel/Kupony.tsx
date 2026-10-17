"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { formatPrice } from "@/lib/dane";
import type { Coupon } from "@/lib/typy";

const emptyForm = {
  code: "",
  name: "",
  description: "",
  discountPercent: 10,
  minSubtotal: "",
  maxUses: "",
  active: true,
  expiresAt: "",
};

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/coupons")
      .then((r) => r.json())
      .then(setCoupons)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description ?? "",
      discountPercent: coupon.discountPercent,
      minSubtotal: coupon.minSubtotal?.toString() ?? "",
      maxUses: coupon.maxUses?.toString() ?? "",
      active: coupon.active,
      expiresAt: coupon.expiresAt?.slice(0, 10) ?? "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      code: form.code,
      name: form.name,
      description: form.description,
      discountPercent: Number(form.discountPercent),
      minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      active: form.active,
      expiresAt: form.expiresAt || undefined,
    };

    const res = await fetch(editingId ? `/api/coupons/${editingId}` : "/api/coupons", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Nie udało się zapisać kodu");
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć ten kod rabatowy?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

  return (
    <>
      <AdminHeader title="Kody rabatowe" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-sand">
            Twórz kody z limitem użyć, procentem rabatu i datą wygaśnięcia. To nie
            jest lista mebli na wyprzedaży — te akcje są w{" "}
            <Link href="/admin/promocje" className="underline underline-offset-2">
              Promocjach
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream hover:bg-charcoal/85"
          >
            <Plus className="h-4 w-4" />
            Nowy kod
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-xl border border-taupe/30 bg-white p-6"
          >
            <h3 className="text-sm font-medium text-charcoal">
              {editingId ? "Edytuj kod rabatowy" : "Nowy kod rabatowy"}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-sand uppercase">Kod</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="np. WIOSNA10"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Nazwa wewnętrzna</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="np. Promocja wiosenna"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Rabat (%)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm({ ...form, discountPercent: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">
                  Min. wartość koszyka (zł)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.minSubtotal}
                  onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
                  placeholder="Opcjonalnie"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">
                  Maks. liczba użyć (puste = bez limitu)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="np. 100"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Data wygaśnięcia</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-sand uppercase">Opis (opcjonalnie)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-charcoal">Kod aktywny</span>
              </label>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] rounded-lg bg-charcoal px-6 text-sm text-cream disabled:opacity-50"
              >
                {saving ? "Zapisywanie…" : editingId ? "Zapisz zmiany" : "Utwórz kod"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setError("");
                }}
                className="min-h-[44px] rounded-lg border border-taupe/30 px-6 text-sm text-charcoal"
              >
                Anuluj
              </button>
            </div>
          </form>
        )}

        {coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-taupe/40 px-6 py-16 text-center">
            <Tag className="mx-auto h-10 w-10 text-sand/40" strokeWidth={1} />
            <p className="mt-4 text-sm text-charcoal">Brak kodów rabatowych</p>
            <p className="mt-1 text-sm text-sand">
              Utwórz pierwszy kod — klienci wpiszą go w koszyku.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-taupe/30 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-taupe/20 text-left text-xs tracking-wide text-sand uppercase">
                    <th className="px-4 py-3 font-medium sm:px-6">Kod</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Nazwa</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Rabat</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Użycia</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Ważność</th>
                    <th className="px-4 py-3 font-medium sm:px-6" />
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => {
                    const exhausted =
                      coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;
                    const expired =
                      coupon.expiresAt != null &&
                      new Date(coupon.expiresAt) < new Date();
                    return (
                      <tr
                        key={coupon.id}
                        className="border-b border-taupe/10 last:border-b-0"
                      >
                        <td className="px-4 py-4 font-medium text-charcoal sm:px-6">
                          {coupon.code}
                        </td>
                        <td className="px-4 py-4 text-charcoal sm:px-6">{coupon.name}</td>
                        <td className="px-4 py-4 text-charcoal sm:px-6">
                          −{coupon.discountPercent}%
                          {coupon.minSubtotal ? (
                            <span className="mt-0.5 block text-xs text-sand">
                              od {formatPrice(coupon.minSubtotal)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-charcoal sm:px-6">
                          {coupon.usedCount}
                          {coupon.maxUses != null ? ` / ${coupon.maxUses}` : " / ∞"}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${
                              !coupon.active
                                ? "bg-gray-100 text-gray-700"
                                : exhausted
                                  ? "bg-red-50 text-red-700"
                                  : expired
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {!coupon.active
                              ? "Nieaktywny"
                              : exhausted
                                ? "Wyczerpany"
                                : expired
                                  ? "Wygasły"
                                  : "Aktywny"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sand sm:px-6">
                          {coupon.expiresAt
                            ? new Date(coupon.expiresAt).toLocaleDateString("pl-PL")
                            : "—"}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(coupon)}
                              className="rounded-lg border border-taupe/30 p-2 text-charcoal hover:bg-cream-light"
                              aria-label="Edytuj"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(coupon.id)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                              aria-label="Usuń"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
