import "server-only";

import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  bookleafRedis?: Redis;
};

function createRedisClient(url: string) {
  return new Redis(url, {
    maxRetriesPerRequest: 2,
    retryStrategy: (attempt) => Math.min(attempt * 200, 5_000),
  });
}

/** Lazily returns the shared Redis command client when Redis is configured. */
export function getRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return (
    globalForRedis.bookleafRedis ??
    (globalForRedis.bookleafRedis = createRedisClient(url))
  );
}

/** Creates a dedicated blocking client for consuming realtime Redis Streams. */
export function createRedisStreamClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  return new Redis(url, {
    maxRetriesPerRequest: null,
    retryStrategy: (attempt) => Math.min(attempt * 200, 5_000),
  });
}
