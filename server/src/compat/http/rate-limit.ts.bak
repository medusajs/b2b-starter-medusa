import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { err } from "./response"

type Entry = { resetAt: number; count: number }
const buckets = new Map<string, Entry>()

export function rateLimit(
  req: MedusaRequest,
  res: MedusaResponse,
  key: string,
  limit = 60,
  windowSeconds = 60
): boolean {
  const now = Date.now()
  const entry = buckets.get(key)
  const windowMs = windowSeconds * 1000
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { resetAt: now + windowMs, count: 1 })
    setHeaders(res, limit, limit - 1, Math.ceil(windowSeconds))
    return true
  }
  if (entry.count < limit) {
    entry.count += 1
    setHeaders(res, limit, limit - entry.count, Math.ceil((entry.resetAt - now) / 1000))
    return true
  }
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
  setHeaders(res, limit, 0, retryAfter)
  res.setHeader("Retry-After", String(retryAfter))
  err(req, res, 429, "RATE_LIMITED", "Too Many Requests", undefined, { stale: false })
  return false
}

function setHeaders(res: MedusaResponse, limit: number, remaining: number, resetSec: number) {
  res.setHeader("X-RateLimit-Limit", String(limit))
  res.setHeader("X-RateLimit-Remaining", String(Math.max(remaining, 0)))
  res.setHeader("X-RateLimit-Reset", String(resetSec))
}

