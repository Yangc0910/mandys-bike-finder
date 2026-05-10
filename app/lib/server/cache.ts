type CacheItem<T> = {
  value: T;
  createdAt: number;
};

const cache = new Map<string, CacheItem<unknown>>();

export function getCached<T>(key: string, ttlHours: number): T | null {
  const item = cache.get(key) as CacheItem<T> | undefined;
  if (!item) return null;
  if (Date.now() - item.createdAt > ttlHours * 60 * 60 * 1000) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export function setCached<T>(key: string, value: T) {
  cache.set(key, { value, createdAt: Date.now() });
}
