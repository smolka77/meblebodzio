import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import type { SessionRecord } from "@/lib/typy";

const FILE = "sessions.json";
const SESSION_TTL_MS = 5 * 60 * 1000;

export async function getSessions(): Promise<SessionRecord[]> {
  await ensureStoreSeeded();
  return readStore<SessionRecord[]>(FILE, []);
}

async function pruneSessions(sessions: SessionRecord[]): Promise<SessionRecord[]> {
  const cutoff = Date.now() - SESSION_TTL_MS * 2;
  return sessions.filter((s) => new Date(s.lastSeen).getTime() > cutoff);
}

export interface PingInput {
  sessionId: string;
  path: string;
  cartCount: number;
  cartTotal: number;
}

export async function pingSession(input: PingInput): Promise<void> {
  let sessions = await pruneSessions(await getSessions());
  const now = new Date().toISOString();
  const existing = sessions.findIndex((s) => s.id === input.sessionId);
  const record: SessionRecord = {
    id: input.sessionId,
    path: input.path,
    cartCount: input.cartCount,
    cartTotal: input.cartTotal,
    lastSeen: now,
    startedAt:
      existing >= 0 ? sessions[existing].startedAt : now,
  };
  if (existing >= 0) {
    sessions[existing] = record;
  } else {
    sessions.push(record);
  }
  sessions = await pruneSessions(sessions);
  await writeStore(FILE, sessions);
}

export async function getLiveStats() {
  const sessions = await getSessions();
  const now = Date.now();
  const active = sessions.filter(
    (s) => now - new Date(s.lastSeen).getTime() < SESSION_TTL_MS
  );
  const withCart = active.filter((s) => s.cartCount > 0);
  const pageViews = sessions.length;
  return {
    activeSessions: active.length,
    activeCarts: withCart.length,
    cartValue: withCart.reduce((sum, s) => sum + s.cartTotal, 0),
    totalTrackedSessions: pageViews,
    sessions: active,
  };
}
