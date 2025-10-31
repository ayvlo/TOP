import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper functions for common Redis operations
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data as T | null;
}

export async function setCache<T>(
  key: string,
  value: T,
  expirationSeconds?: number
): Promise<void> {
  if (expirationSeconds) {
    await redis.setex(key, expirationSeconds, JSON.stringify(value));
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function incrementCounter(key: string, increment: number = 1): Promise<number> {
  return await redis.incrby(key, increment);
}
