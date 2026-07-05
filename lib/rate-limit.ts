// Lightweight in-memory rate limiter for auth endpoints.
//
// This is best-effort: serverless instances don't share memory, so a
// determined attacker across many cold starts isn't fully stopped. It DOES
// defeat naive credential-stuffing / rapid brute force against a warm instance,
// which is the realistic threat for a low-traffic single-admin site. For a
// hardened setup, back this with Upstash/Redis.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

/**
 * @param key      unique key (e.g. `admin-login:<ip>` or `member-login:<email>`)
 * @param limit    max attempts within the window
 * @param windowMs window length in ms
 */
export function rateLimit(key: string, limit = 8, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (b.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000) };
  }

  b.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
