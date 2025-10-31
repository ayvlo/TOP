import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// API rate limiter: 100 requests per minute per key
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

// Ingest rate limiter: 1000 events per minute per org
export const ingestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:ingest',
});

// Auth rate limiter: 5 attempts per 15 minutes
export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

export async function enforceRateLimit(limiter: Ratelimit, identifier: string): Promise<void> {
  const result = await checkRateLimit(limiter, identifier);

  if (!result.success) {
    throw new Error('Rate limit exceeded');
  }
}
