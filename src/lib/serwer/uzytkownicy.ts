import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import {
  assertPasswordStrength,
  hashPassword,
  isPasswordHashed,
  verifyPassword,
} from "./haslo";
import {
  decryptRecord,
  emailIndex,
  encryptRecord,
} from "./szyfrowanie";
import type { StoredUser, UserProfile } from "@/lib/typy";

const FILE = "users.json";

const PII_FIELDS = [
  "name",
  "email",
  "phone",
  "address",
  "city",
  "postalCode",
] as const;

type StoredUserRecord = StoredUser & { emailIndex?: string };

async function decryptUser(user: StoredUserRecord): Promise<StoredUser> {
  return decryptRecord(user, [...PII_FIELDS]);
}

async function encryptUser(user: StoredUser): Promise<StoredUserRecord> {
  const encrypted = await encryptRecord(user, [...PII_FIELDS]);
  return {
    ...encrypted,
    emailIndex: emailIndex(user.email),
  };
}

async function readUsersRaw(): Promise<StoredUserRecord[]> {
  await ensureStoreSeeded();
  return readStore<StoredUserRecord[]>(FILE, []);
}

export async function getUsers(): Promise<StoredUser[]> {
  const users = await readUsersRaw();
  return Promise.all(users.map(decryptUser));
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await readUsersRaw();
  const index = emailIndex(email);
  const found = users.find(
    (u) => u.emailIndex === index || u.email.toLowerCase() === email.toLowerCase()
  );
  return found ? decryptUser(found) : undefined;
}

export async function findUserById(id: string): Promise<UserProfile | null> {
  const users = await readUsersRaw();
  const found = users.find((u) => u.id === id);
  if (!found) return null;
  const { password: _, ...profile } = await decryptUser(found);
  return profile;
}

async function saveUserPassword(id: string, passwordHash: string) {
  const users = await readUsersRaw();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return;
  users[index] = { ...users[index], password: passwordHash };
  await writeStore(FILE, users);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<UserProfile | { error: string }> {
  const strength = assertPasswordStrength(data.password);
  if (strength) return { error: strength };

  const users = await readUsersRaw();
  const index = emailIndex(data.email);
  if (users.some((u) => u.emailIndex === index || u.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: "Konto z tym e-mailem już istnieje" };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: data.name.trim().slice(0, 120),
    email: data.email.trim().toLowerCase().slice(0, 254),
    password: await hashPassword(data.password),
    createdAt: new Date().toISOString(),
  };
  const encrypted = await encryptUser(user);
  await writeStore(FILE, [...users, encrypted]);
  const { password: _, ...profile } = user;
  return profile;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<UserProfile | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;

  if (!isPasswordHashed(user.password)) {
    await saveUserPassword(user.id, await hashPassword(password));
  }

  const { password: _, ...profile } = user;
  return profile;
}

export async function updateUserProfile(
  id: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> {
  const users = await readUsersRaw();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const current = await decryptUser(users[index]);
  const next: StoredUser = {
    ...current,
    ...data,
    id: current.id,
    password: current.password,
  };
  const encrypted = await encryptUser(next);
  users[index] = encrypted;
  await writeStore(FILE, users);
  const { password: _, ...profile } = next;
  return profile;
}

export async function changeUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { error: string }> {
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "Nie znaleziono konta" };
  }

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
    return { error: "Aktualne hasło jest nieprawidłowe" };
  }

  const strength = assertPasswordStrength(newPassword);
  if (strength) return { error: strength };

  await saveUserPassword(user.id, await hashPassword(newPassword));
  return { ok: true };
}
