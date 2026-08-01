/**
 * Sharp-backed dimension cache builder + async fallback reader.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  CACHE_PATH,
  PUBLIC_DIR,
  getCachedDimensions,
  loadDimensionCache,
  setDimensionCache,
  toPublicPath,
} from './local-image-dimensions-cache.mjs';

function orientationSwap(meta) {
  const o = meta.orientation;
  if (o && o >= 5 && o <= 8) {
    return { width: meta.height, height: meta.width };
  }
  return { width: meta.width, height: meta.height };
}

export async function readAssetDimensions(src) {
  const key = toPublicPath(src);
  if (!key) return null;
  const map = loadDimensionCache();
  if (map.has(key)) return map.get(key);

  const abs = path.join(PUBLIC_DIR, key.replace(/^\//, ''));
  if (!fs.existsSync(abs)) return null;

  const meta = await sharp(abs).metadata();
  if (!meta.width || !meta.height) return null;
  const sized = orientationSwap(meta);
  const entry = {
    width: sized.width,
    height: sized.height,
    format: meta.format,
    orientation: meta.orientation ?? null,
    hasAlpha: Boolean(meta.hasAlpha),
    animated: Boolean(meta.pages && meta.pages > 1),
    filesize: fs.statSync(abs).size,
  };
  map.set(key, entry);
  return entry;
}

export async function buildDimensionCache(globs = ['images']) {
  const map = {};
  const roots = globs.map((g) => path.join(PUBLIC_DIR, g));

  async function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (!/\.(png|jpe?g|webp|gif|avif)$/i.test(entry.name)) continue;
      const rel = `/${path.relative(PUBLIC_DIR, abs).split(path.sep).join('/')}`;
      try {
        const meta = await sharp(abs).metadata();
        if (!meta.width || !meta.height) continue;
        const sized = orientationSwap(meta);
        map[rel] = {
          width: sized.width,
          height: sized.height,
          format: meta.format,
          orientation: meta.orientation ?? null,
          hasAlpha: Boolean(meta.hasAlpha),
          animated: Boolean(meta.pages && meta.pages > 1),
          filesize: fs.statSync(abs).size,
        };
      } catch {
        // skip unreadable
      }
    }
  }

  for (const root of roots) await walk(root);
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(map, null, 2)}\n`);
  setDimensionCache(map);
  return map;
}

export { CACHE_PATH, PUBLIC_DIR, getCachedDimensions, loadDimensionCache, toPublicPath };
