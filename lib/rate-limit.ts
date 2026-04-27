/**
 * Simple in-memory rate limiter for serverless API routes.
 * Each limiter tracks requests per IP within a sliding window.
 *
 * Note: In-memory state resets when the serverless function cold-starts,
 * so this is best-effort. For stricter enforcement, use Upstash Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000 // 1 minute
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt + windowMs) store.delete(key)
  }
}

export function rateLimit({
  windowMs = 60_000,
  max = 10,
}: {
  /** Time window in milliseconds (default: 60s) */
  windowMs?: number
  /** Max requests per window (default: 10) */
  max?: number
} = {}) {
  return {
    check(ip: string): { allowed: boolean; remaining: number } {
      cleanup(windowMs)
      const now = Date.now()
      const key = ip
      const entry = store.get(key)

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: max - 1 }
      }

      entry.count++
      const allowed = entry.count <= max
      return { allowed, remaining: Math.max(0, max - entry.count) }
    },
  }
}
