/**
 * @fileoverview In-memory rate limiter for CryptoPanel API routes.
 * - Enforces per-key request caps within a rolling window.
 * - Designed for serverless environments with documented limitations.
 */
import { getRuntimeConfig } from '@/config';

type Counter = {
  hits: number;
  resetAt: number;
};

type RateLimitResult = Readonly<{
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}>;

const windowMs = 60_000;
const counters = new Map<string, Counter>();

export const consumeRateLimit = (key: string): RateLimitResult => {
  const { rateLimitRequestsPerMinute } = getRuntimeConfig();
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    counters.set(key, { hits: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(rateLimitRequestsPerMinute - 1, 0),
      retryAfterSeconds: 0,
      resetAt
    };
  }

  const nextHits = existing.hits + 1;
  const allowed = nextHits <= rateLimitRequestsPerMinute;
  counters.set(key, { hits: nextHits, resetAt: existing.resetAt });

  return {
    allowed,
    remaining: Math.max(rateLimitRequestsPerMinute - nextHits, 0),
    retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
    resetAt: existing.resetAt
  };
};

export const toRateLimitHeaders = ({
  limit,
  remaining,
  resetAt
}: {
  limit: number;
  remaining: number;
  resetAt: number;
}) => ({
  'X-RateLimit-Limit': String(limit),
  'X-RateLimit-Remaining': String(Math.max(remaining, 0)),
  'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000))
});
