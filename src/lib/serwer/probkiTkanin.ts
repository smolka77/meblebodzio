import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import type { FabricSampleRequest } from "@/lib/typy";
import { getFabrics } from "./tkaniny";
import { isSampleCatalogFabric } from "@/lib/rolaTkaniny";

const FILE = "fabric-sample-requests.json";

export async function getFabricSampleRequests(): Promise<FabricSampleRequest[]> {
  await ensureStoreSeeded();
  const requests = await readStore<FabricSampleRequest[]>(FILE, []);
  return requests.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getUnreadFabricSampleCount(): Promise<number> {
  const requests = await getFabricSampleRequests();
  return requests.filter((r) => !r.read).length;
}

export async function submitFabricSampleRequest(input: {
  fabricIds: string[];
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  postalCode: string;
  message?: string;
}): Promise<{ ok: boolean; message: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const street = input.street.trim();
  const city = input.city.trim();
  const postalCode = input.postalCode.trim();
  const fabricIds = [...new Set(input.fabricIds)];

  if (!name || !email || !street || !city || !postalCode) {
    return { ok: false, message: "Uzupełnij wymagane pola formularza" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Podaj prawidłowy adres e-mail" };
  }
  if (fabricIds.length === 0) {
    return { ok: false, message: "Wybierz co najmniej jedną tkaninę" };
  }
  if (fabricIds.length > 100) {
    return { ok: false, message: "Zbyt wiele próbek w jednym zamówieniu" };
  }

  const catalog = (await getFabrics(true)).filter(isSampleCatalogFabric);
  const selected = fabricIds
    .map((id) => catalog.find((fabric) => fabric.id === id))
    .filter((fabric): fabric is NonNullable<typeof fabric> => Boolean(fabric));
  if (selected.length !== fabricIds.length) {
    return { ok: false, message: "Wybrano nieprawidłową tkaninę" };
  }

  const entry: FabricSampleRequest = {
    id: crypto.randomUUID(),
    fabricIds: selected.map((fabric) => fabric.id),
    fabricNames: selected.map((fabric) => fabric.name),
    name,
    email,
    phone: input.phone?.trim() || undefined,
    street,
    city,
    postalCode,
    message: input.message?.trim() || undefined,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const requests = await getFabricSampleRequests();
  await writeStore(FILE, [entry, ...requests]);
  return { ok: true, message: "Dziękujemy — wysyłamy próbki na podany adres." };
}

export async function markFabricSampleRead(id: string): Promise<boolean> {
  const requests = await getFabricSampleRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return false;
  requests[index] = { ...requests[index], read: true };
  await writeStore(FILE, requests);
  return true;
}

export async function deleteFabricSampleRequest(id: string): Promise<boolean> {
  const requests = await getFabricSampleRequests();
  const next = requests.filter((r) => r.id !== id);
  if (next.length === requests.length) return false;
  await writeStore(FILE, next);
  return true;
}
