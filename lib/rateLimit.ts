import "server-only";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 5000;

type Hit = { count: number; resetAt: number };
const memory = new Map<string, Hit>();

function memoryHit(key: string, now: number): Hit {
  const found = memory.get(key);
  if (found && found.resetAt > now) {
    found.count += 1;
    return found;
  }
  if (memory.size >= MAX_ENTRIES) {
    // Drop expired entries first, then the oldest, so memory stays bounded.
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    if (memory.size >= MAX_ENTRIES) memory.delete(memory.keys().next().value as string);
  }
  const fresh = { count: 1, resetAt: now + WINDOW_MS };
  memory.set(key, fresh);
  return fresh;
}

async function upstashHit(key: string): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, WINDOW_MS / 1000, "NX"]]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const out = (await res.json()) as { result: number }[];
    return out[0]?.result ?? null;
  } catch {
    return null;
  }
}

/** 5 booking requests per IP per hour. Uses Upstash when configured, otherwise in-memory. */
export async function allowBooking(ip: string, limit = 5): Promise<{ ok: boolean; retryAfterSeconds: number }> {
  const key = `s1:book:${ip}`;
  const shared = await upstashHit(key);
  if (shared !== null) return { ok: shared <= limit, retryAfterSeconds: WINDOW_MS / 1000 };
  const hit = memoryHit(key, Date.now());
  return { ok: hit.count <= limit, retryAfterSeconds: Math.max(1, Math.ceil((hit.resetAt - Date.now()) / 1000)) };
}
