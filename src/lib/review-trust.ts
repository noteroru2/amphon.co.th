export const FULL_REVIEW_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/บริการ/รับซื้อโน๊ตบุ๊ค',
  '/บริการ/รับซื้อคอมพิวเตอร์',
  '/บริการ/รับซื้อ-macbook',
  '/บริการ/รับซื้อ-iphone',
  '/บริการ/รับซื้อกล้อง',
  '/บริการ/รับซื้ออุปกรณ์ไอที',
]);

export function reviewTrustForPath(pathname: string): 'full' | 'compact' {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // An invalid encoded path is never eligible for live reviews.
  }
  const normalized = decoded.length > 1 ? decoded.replace(/\/+$/, '') : decoded;
  return FULL_REVIEW_PATHS.has(normalized) ? 'full' : 'compact';
}
