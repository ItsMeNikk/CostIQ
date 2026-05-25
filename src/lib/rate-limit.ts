/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Production note: single-process only. For multi-instance deployments
 * swap the backing store for Upstash/Redis — the API stays the same.
 */

type Bucket = number[];

const buckets = new Map<string, Bucket>();

// Cheap janitor: prune empty entries every ~5 min so the map can't grow unbounded.
const PRUNE_INTERVAL_MS = 5 * 60_000;
let lastPrune = 0;

function prune(now: number) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, arr] of buckets) {
    if (arr.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  scope: string,
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucketKey = `${scope}:${key}`;
  const cutoff = now - windowMs;
  const existing = buckets.get(bucketKey) ?? [];
  const recent = existing.filter((t) => t > cutoff);

  if (recent.length >= max) {
    buckets.set(bucketKey, recent);
    const retryAfterMs = recent[0] + windowMs - now;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  buckets.set(bucketKey, recent);
  return { ok: true, remaining: max - recent.length, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}
