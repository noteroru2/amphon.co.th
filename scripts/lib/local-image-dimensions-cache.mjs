/**
 * Sync dimension cache reader (no sharp) — safe for Astro components.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CACHE_PATH = path.join(ROOT, 'src/data/local-image-dimensions.json');
export const PUBLIC_DIR = path.join(ROOT, 'public');

/** @type {Map<string, { width: number, height: number, format?: string }> | null} */
let cache = null;

export function toPublicPath(src) {
  if (!src || typeof src !== 'string') return null;
  if (!src.startsWith('/') || src.startsWith('//') || /^https?:/i.test(src)) return null;
  if (src.includes('..')) return null;
  return src.split('?')[0].split('#')[0];
}

export function loadDimensionCache() {
  if (cache) return cache;
  cache = new Map();
  if (fs.existsSync(CACHE_PATH)) {
    const data = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    for (const [src, dims] of Object.entries(data)) {
      cache.set(src, dims);
    }
  }
  return cache;
}

export function getCachedDimensions(src) {
  const key = toPublicPath(src);
  if (!key) return null;
  return loadDimensionCache().get(key) ?? null;
}

export function setDimensionCache(mapObject) {
  cache = new Map(Object.entries(mapObject));
}
