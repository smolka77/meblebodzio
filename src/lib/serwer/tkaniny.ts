import { revalidatePath } from "next/cache";
import { isStoreMediaUrl } from "@/lib/obrazy";
import { getDefaultFabrics } from "@/lib/tkaninyDomyslne";
import type { Fabric, FabricRole } from "@/lib/typy";
import { deleteFabricImage } from "./wgrywanieBloga";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";

const FILE = "fabrics.json";

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function sanitizeShades(raw: unknown): Fabric["colors"] {
  if (!Array.isArray(raw)) return undefined;
  const out: NonNullable<Fabric["colors"]> = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { id?: string; name?: string; hex?: string; image?: string };
    const name = rec.name?.trim() || "";
    const image = optionalText(rec.image);
    if (!name && !image) continue;
    out.push({
      id: rec.id?.trim() || crypto.randomUUID(),
      name,
      hex: rec.hex?.trim() || "#D4C9B8",
      image,
    });
  }
  return out.length > 0 ? out : undefined;
}

function normalizeSurcharge(value: unknown): number | undefined {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return Math.round(amount);
}

function sanitizeRole(value: unknown): FabricRole {
  return value === "pokrowiec" || value === "plyta" ? value : "tkanina";
}

export async function getFabrics(activeOnly = false): Promise<Fabric[]> {
  await ensureStoreSeeded();
  const fabrics = await readStore<Fabric[]>(FILE, getDefaultFabrics());
  const list = activeOnly ? fabrics.filter((f) => f.active) : fabrics;
  return list.sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

export async function getFabricById(id: string): Promise<Fabric | undefined> {
  const fabrics = await getFabrics();
  return fabrics.find((f) => f.id === id);
}

function revalidateFabrics() {
  revalidatePath("/probki-tkanin");
  revalidatePath("/admin/tkaniny");
  revalidatePath("/admin/produkty");
  revalidatePath("/produkt/[slug]", "page");
}

export type FabricInput = Omit<Fabric, "id">;

export async function createFabric(data: FabricInput): Promise<Fabric | null> {
  const image = data.image?.trim() ?? "";
  const video = optionalText(data.video) ?? "";
  if (!data.name.trim() || (!image && !video)) return null;
  const fabrics = await getFabrics();
  const fabric: Fabric = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    description: data.description.trim(),
    material: data.material.trim() || "Tkanina",
    colorHex:
      data.colorHex?.trim() || sanitizeShades(data.colors)?.[0]?.hex || "#CCCCCC",
    image,
    video: video || undefined,
    colors: sanitizeShades(data.colors),
    role: sanitizeRole(data.role),
    watermark: optionalText(data.watermark),
    surcharge: normalizeSurcharge(data.surcharge),
    specs: optionalText(data.specs),
    care: optionalText(data.care),
    active: data.active ?? true,
  };
  await writeStore(FILE, [...fabrics, fabric]);
  revalidateFabrics();
  return fabric;
}

export async function updateFabric(
  id: string,
  data: Partial<FabricInput>
): Promise<Fabric | null> {
  const fabrics = await getFabrics();
  const index = fabrics.findIndex((f) => f.id === id);
  if (index === -1) return null;
  const current = fabrics[index];
  const updated: Fabric = {
    ...current,
    id,
    name: data.name?.trim() ?? current.name,
    description: data.description?.trim() ?? current.description,
    material: data.material?.trim() ?? current.material,
    colorHex:
      data.colorHex?.trim() ??
      sanitizeShades(data.colors)?.[0]?.hex ??
      current.colorHex,
    image: data.image?.trim() ?? current.image,
    video: data.video !== undefined ? optionalText(data.video) : current.video,
    colors:
      data.colors !== undefined ? sanitizeShades(data.colors) : current.colors,
    role: data.role !== undefined ? sanitizeRole(data.role) : current.role,
    watermark:
      data.watermark !== undefined ? optionalText(data.watermark) : current.watermark,
    surcharge:
      data.surcharge !== undefined
        ? normalizeSurcharge(data.surcharge)
        : current.surcharge,
    specs: data.specs !== undefined ? optionalText(data.specs) : current.specs,
    care: data.care !== undefined ? optionalText(data.care) : current.care,
    active: data.active ?? current.active,
  };
  fabrics[index] = updated;
  await writeStore(FILE, fabrics);

  if (
    data.image &&
    data.image !== current.image &&
    isStoreMediaUrl(current.image)
  ) {
    await deleteFabricImage(current.image);
  }
  if (
    data.video !== undefined &&
    data.video !== current.video &&
    current.video &&
    isStoreMediaUrl(current.video)
  ) {
    await deleteFabricImage(current.video);
  }

  if (
    data.watermark !== undefined &&
    data.watermark !== current.watermark &&
    current.watermark &&
    isStoreMediaUrl(current.watermark)
  ) {
    await deleteFabricImage(current.watermark);
  }
  revalidateFabrics();
  return updated;
}

export async function deleteFabric(id: string): Promise<boolean> {
  const fabrics = await getFabrics();
  const fabric = fabrics.find((f) => f.id === id);
  if (!fabric) return false;
  await writeStore(
    FILE,
    fabrics.filter((f) => f.id !== id)
  );
  if (fabric.image && isStoreMediaUrl(fabric.image)) {
    await deleteFabricImage(fabric.image);
  }
  if (fabric.video && isStoreMediaUrl(fabric.video)) {
    await deleteFabricImage(fabric.video);
  }
  if (fabric.watermark && isStoreMediaUrl(fabric.watermark)) {
    await deleteFabricImage(fabric.watermark);
  }
  revalidateFabrics();
  return true;
}
