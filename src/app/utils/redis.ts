import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import config from '../config';

// a redis outage must never take the api down, so every helper degrades to a no-op
const RETRY_COOLDOWN_MS = 60000;

let client: Redis | null = null;
let cooldownUntil = 0;

export const isCacheEnabled = () => Boolean(config.redis_url);

// ioredis reports a refused connection without a message, so the code is used instead
const describeError = (err: unknown) => {
  const error = err as { message?: string; code?: string };

  return error?.message || error?.code || 'unknown connection error';
};

const getRedisClient = () => {
  if (!client) {
    client = new Redis(config.redis_url as string, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (attempt) =>
        attempt > 3 ? null : Math.min(attempt * 500, 2000),
    });

    client.on('connect', () => console.log('[cache] redis connected'));
    client.on('error', (err) => {
      cooldownUntil = Date.now() + RETRY_COOLDOWN_MS;
      console.error('[cache] redis error:', describeError(err));
    });
  }

  return client;
};

const getReadyClient = async (): Promise<Redis | null> => {
  if (!isCacheEnabled() || Date.now() < cooldownUntil) return null;

  const redis = getRedisClient();

  // the retry strategy gave up, the next attempt starts from a clean connection
  if (redis.status === 'end') {
    client = null;
    return null;
  }

  try {
    if (redis.status === 'wait') await redis.connect();
    if (redis.status !== 'ready') return null;

    return redis;
  } catch (err) {
    cooldownUntil = Date.now() + RETRY_COOLDOWN_MS;
    console.error('[cache] connection failed:', describeError(err));
    return null;
  }
};

export const getCached = async <T>(key: string): Promise<T | null> => {
  const redis = await getReadyClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (err) {
    console.error(`[cache] failed to read ${key}:`, (err as Error).message);
    return null;
  }
};

export const setCache = async <T>(
  key: string,
  value: T,
  ttlSeconds = 300,
): Promise<boolean> => {
  const redis = await getReadyClient();
  if (!redis) return false;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.error(`[cache] failed to write ${key}:`, (err as Error).message);
    return false;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  const redis = await getReadyClient();
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error(`[cache] failed to delete ${key}:`, (err as Error).message);
    return false;
  }
};

// pattern invalidation is cursor based so a large keyspace is never blocked by KEYS
export const invalidateCache = async (pattern: string): Promise<number> => {
  const redis = await getReadyClient();
  if (!redis) return 0;

  let cursor = '0';
  let removed = 0;

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        removed += await redis.del(...keys);
      }
    } while (cursor !== '0');

    return removed;
  } catch (err) {
    console.error(
      `[cache] failed to invalidate ${pattern}:`,
      (err as Error).message,
    );
    return removed;
  }
};

export const acquireLock = async (
  key: string,
  ttlMs = 10000,
): Promise<string | null> => {
  const redis = await getReadyClient();
  if (!redis) return null;

  const token = randomUUID();

  try {
    const result = await redis.set(key, token, 'PX', ttlMs, 'NX');
    return result === 'OK' ? token : null;
  } catch (err) {
    console.error(
      `[cache] failed to acquire lock ${key}:`,
      (err as Error).message,
    );
    return null;
  }
};

// releasing is script based so a stale holder can never delete someone elses lock
export const releaseLock = async (
  key: string,
  token: string,
): Promise<boolean> => {
  const redis = await getReadyClient();
  if (!redis) return false;

  try {
    const released = await redis.eval(
      `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`,
      1,
      key,
      token,
    );

    return Number(released) === 1;
  } catch (err) {
    console.error(
      `[cache] failed to release lock ${key}:`,
      (err as Error).message,
    );
    return false;
  }
};

export const disconnectRedis = async () => {
  if (!client) return;

  try {
    await client.quit();
    console.log('[cache] redis disconnected');
  } catch (err) {
    console.error('[cache] disconnect failed:', (err as Error).message);
  } finally {
    client = null;
  }
};
