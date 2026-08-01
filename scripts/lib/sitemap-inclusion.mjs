/**
 * Shared sitemap inclusion rules for Astro @astrojs/sitemap filter + QA.
 * Exact exclusions only — never use broad substring matches that can clip
 * sibling routes (e.g. /บริการ/รับซื้อสินค้าไอทีบริษัท).
 */

/** Exact pathnames that must never appear in the sitemap. */
export const SITEMAP_EXACT_EXCLUSIONS = new Set([
  // Legacy hub path → redirects to /รับซื้อสินค้าไอที (Batch 1)
  '/บริการ/รับซื้อสินค้าไอที',
  // Redirect / noindex fallback service slugs
  '/บริการ/รับซื้อ-gopro',
  '/บริการ/รับซื้อ-hdd',
  '/บริการ/รับซื้อเลนส์',
  '/บริการ/รับซื้อ-storage-nas',
  // Batch 12B collectibles merge pilot (explicit 10 only)
  '/รับซื้อ/รับซื้อของสะสม-กาฬสินธุ์',
  '/รับซื้อ/รับซื้อของสะสม-ขอนแก่น',
  '/รับซื้อ/รับซื้อของสะสม-ชัยภูมิ',
  '/รับซื้อ/รับซื้อของสะสม-นครพนม',
  '/รับซื้อ/รับซื้อของสะสม-นครราชสีมา',
  '/รับซื้อ/รับซื้อของสะสม-บึงกาฬ',
  '/รับซื้อ/รับซื้อของสะสม-บุรีรัมย์',
  '/รับซื้อ/รับซื้อของสะสม-มหาสารคาม',
  '/รับซื้อ/รับซื้อของสะสม-มุกดาหาร',
  '/รับซื้อ/รับซื้อของสะสม-ยโสธร',
]);

/**
 * Legacy service×province prefixes that redirect away (Batch 1).
 * Matched with startsWith so sibling routes are not clipped.
 */
export const SITEMAP_BLOCKED_PREFIXES = [
  '/รับซื้อ/รับซื้อ-gopro-',
  '/รับซื้อ/รับซื้อเลนส์-',
  '/รับซื้อ/รับซื้อ-hdd-',
  '/รับซื้อ/รับซื้อ-storage-nas-',
];

/** Target pages that must be included (F-02 / F-03). */
export const SITEMAP_REQUIRED_INCLUSIONS = [
  '/บริการ/รับซื้อสินค้าไอทีบริษัท',
  '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
];

export function normalizeSitemapPathname(pageOrPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(pageOrPath);
  } catch {
    decoded = pageOrPath;
  }

  let pathname = decoded.replace(/^https?:\/\/[^/]+/, '');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return pathname || '/';
}

/**
 * @param {string} page Full sitemap page URL or pathname
 * @returns {boolean} true = include in sitemap
 */
export function shouldIncludeInSitemap(page) {
  const pathname = normalizeSitemapPathname(page);

  if (pathname === '/404' || pathname.includes('/404')) {
    return false;
  }

  if (SITEMAP_EXACT_EXCLUSIONS.has(pathname)) {
    return false;
  }

  if (SITEMAP_BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return true;
}
