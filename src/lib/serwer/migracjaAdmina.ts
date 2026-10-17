import { readStore, writeStore, fileExists } from "./baza";
import {
  ADMIN_AUTH_VERSION,
  ADMIN_PASSWORD_HASH,
  ADMIN_USERNAME,
} from "./startAdmina";
import type { ShopSettings } from "@/lib/typy";
import { DEFAULT_SETTINGS } from "./startDanych";

export async function migrateAdminCredentials(): Promise<void> {
  if (!(await fileExists("settings.json"))) return;

  const settings = await readStore<ShopSettings>("settings.json", DEFAULT_SETTINGS);
  if ((settings.adminAuthVersion ?? 0) >= ADMIN_AUTH_VERSION) {
    return;
  }

  await writeStore("settings.json", {
    ...settings,
    adminUsername: ADMIN_USERNAME,
    adminPassword: ADMIN_PASSWORD_HASH,
    adminAuthVersion: ADMIN_AUTH_VERSION,
  });
}
