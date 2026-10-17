"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { FabricFormModal } from "@/components/panel/FormularzTkaniny";
import { formatChatDate } from "@/lib/klientCzatu";
import { isLocalUpload } from "@/lib/obrazy";
import type { Fabric, FabricSampleRequest } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { FABRIC_ROLES, fabricRole } from "@/lib/rolaTkaniny";

export function AdminFabrics() {
  const [tab, setTab] = useState<"fabrics" | "requests">("fabrics");
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [requests, setRequests] = useState<FabricSampleRequest[]>([]);
  const [editing, setEditing] = useState<Fabric | null>(null);
  const [creating, setCreating] = useState(false);

  const loadFabrics = useCallback(() => {
    fetch("/api/fabrics?active=false")
      .then((r) => r.json())
      .then(setFabrics)
      .catch(() => {});
  }, []);

  const loadRequests = useCallback(() => {
    fetch("/api/fabric-samples")
      .then((r) => r.json())
      .then(setRequests)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFabrics();
    loadRequests();
  }, [loadFabrics, loadRequests]);

  async function deleteFabric(fabric: Fabric) {
    if (!confirm(`Usunąć tkaninę „${fabric.name}”?`)) return;
    await fetch(`/api/fabrics/${fabric.id}`, { method: "DELETE" });
    loadFabrics();
  }

  async function deleteRequest(id: string) {
    if (!confirm("Usunąć tę prośbę?")) return;
    await fetch(`/api/fabric-samples/${id}`, { method: "DELETE" });
    loadRequests();
  }

  async function markRead(id: string) {
    await fetch(`/api/fabric-samples/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
    loadRequests();
  }

  const unread = requests.filter((r) => !r.read).length;

  return (
    <>
      <AdminHeader title="Tkaniny i próbki" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["fabrics", "requests"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`min-h-[40px] rounded-lg px-4 text-sm ${
                  tab === key ? "bg-charcoal text-cream" : "border border-taupe/30 bg-white"
                }`}
              >
                {key === "fabrics" ? "Katalog tkanin" : `Prośby o próbki${unread ? ` (${unread})` : ""}`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Link
              href="/probki-tkanin"
              target="_blank"
              className="flex min-h-[44px] items-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Podgląd
            </Link>
            {tab === "fabrics" && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex min-h-[44px] items-center gap-2 rounded-lg bg-charcoal px-4 text-sm text-cream"
              >
                <Plus className="h-4 w-4" />
                Dodaj tkaninę
              </button>
            )}
          </div>
        </div>

        {tab === "fabrics" ? (
          fabrics.length === 0 ? (
            <p className="rounded-xl border border-taupe/30 bg-white p-6 text-sm font-medium text-charcoal/85">
              Brak tkanin. Dodaj je w katalogu — potem przypniesz do produktu jednym kliknięciem
              w zakładce „Kolory i tkaniny”.
            </p>
          ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fabrics.map((fabric) => (
              <div key={fabric.id} className="rounded-xl border border-taupe/30 bg-white p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-light">
                  {fabric.video ? (
                    <video
                      src={fabric.video}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={fabric.image}
                      alt={fabric.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                      unoptimized={isLocalUpload(fabric.image)}
                    />
                  )}
                  <span
                    className="absolute bottom-2 left-2 h-5 w-5 rounded-full border border-white shadow"
                    style={{ backgroundColor: fabric.colorHex }}
                  />
                  {(fabric.colors?.length ?? 0) > 1 && (
                    <span className="absolute bottom-2 right-2 flex -space-x-1">
                      {(fabric.colors ?? []).slice(0, 5).map((shade) => (
                        <span
                          key={shade.id}
                          className="h-4 w-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: shade.hex }}
                        />
                      ))}
                    </span>
                  )}
                  {fabric.video && (
                    <span className="absolute top-2 right-2 rounded-full bg-charcoal/80 px-2 py-0.5 text-[10px] tracking-wide text-cream uppercase">
                      Wideo
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-charcoal">{fabric.name}</p>
                    <p className="text-xs text-sand">{fabric.material}</p>
                    {fabricRole(fabric) !== "tkanina" && (
                      <p className="mt-0.5 text-[11px] font-semibold text-charcoal/70">
                        {FABRIC_ROLES.find((role) => role.id === fabricRole(fabric))?.label}
                        {" · "}ukryta w próbkach
                      </p>
                    )}
                    {fabric.surcharge != null && fabric.surcharge > 0 && (
                      <p className="mt-0.5 text-xs font-semibold text-terracotta">
                        Dopłata: +{formatPrice(fabric.surcharge)}
                      </p>
                    )}
                    {!fabric.active && (
                      <span className="mt-1 inline-block text-[10px] text-red-600">Nieaktywna</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(fabric)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-taupe/30"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFabric(fabric)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-sand">{fabric.description}</p>
              </div>
            ))}
          </div>
          )
        ) : (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-sand">Brak próśb o próbki.</p>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`rounded-xl border bg-white p-4 ${req.read ? "border-taupe/30" : "border-charcoal/30"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-charcoal">{req.name}</p>
                      <p className="text-sm text-sand">{req.email}</p>
                      <p className="mt-1 text-xs text-charcoal/70">
                        {req.fabricNames.join(", ")}
                      </p>
                      <p className="mt-2 text-xs text-sand">
                        {req.street}, {req.postalCode} {req.city}
                      </p>
                      {req.message && (
                        <p className="mt-2 text-sm text-charcoal/80">{req.message}</p>
                      )}
                      <p className="mt-2 text-[10px] text-sand">
                        {formatChatDate(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!req.read && (
                        <button
                          type="button"
                          onClick={() => markRead(req.id)}
                          className="rounded-lg border border-taupe/30 px-2 py-1 text-xs"
                        >
                          Oznacz
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteRequest(req.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {creating && (
        <FabricFormModal
          onClose={() => setCreating(false)}
          onSaved={loadFabrics}
        />
      )}
      {editing && (
        <FabricFormModal
          fabric={editing}
          onClose={() => setEditing(null)}
          onSaved={loadFabrics}
        />
      )}
    </>
  );
}
