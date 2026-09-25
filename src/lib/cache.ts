/**
 * Simple in-memory cache with Time-To-Live (TTL) and mutation invalidation.
 * Default TTL: 5 minutes (300,000 ms).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const CacheKeys = {
  PROFILE: 'cache:profile',
  PROJECTS: 'cache:projects',
  BLOGS: 'cache:blogs',
  SKILLS: 'cache:skills',
  EXPERIENCES: 'cache:experiences',
  CERTIFICATIONS: 'cache:certifications',
  EDUCATION: 'cache:education',
  SITE_SETTINGS: 'cache:site_settings',
  SOCIAL_LINKS: 'cache:social_links',
  projectDetail: (slug: string) => `cache:project:${slug}`,
  blogDetail: (slug: string) => `cache:blog:${slug}`,
};

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCache(keyPrefixOrPattern?: string): void {
  if (!keyPrefixOrPattern) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefixOrPattern)) {
      memoryCache.delete(key);
    }
  }
}
