/**
 * Batch 12B — Collectibles merge pilot (explicit 10 URLs only).
 * Do not expand without a new approved pilot map.
 */
export const COLLECTIBLES_MERGE_PILOT_TARGET = '/บริการ/รับซื้อของสะสม';

/** Exact serviceArea slugs retired in Pilot A (non-Ubon ของสะสม). */
export const COLLECTIBLES_MERGE_PILOT_SLUGS = [
  'รับซื้อของสะสม-กาฬสินธุ์',
  'รับซื้อของสะสม-ขอนแก่น',
  'รับซื้อของสะสม-ชัยภูมิ',
  'รับซื้อของสะสม-นครพนม',
  'รับซื้อของสะสม-นครราชสีมา',
  'รับซื้อของสะสม-บึงกาฬ',
  'รับซื้อของสะสม-บุรีรัมย์',
  'รับซื้อของสะสม-มหาสารคาม',
  'รับซื้อของสะสม-มุกดาหาร',
  'รับซื้อของสะสม-ยโสธร',
] as const;

export const COLLECTIBLES_MERGE_PILOT_SLUG_SET = new Set<string>(COLLECTIBLES_MERGE_PILOT_SLUGS);

export const COLLECTIBLES_MERGE_PILOT_PATHS = COLLECTIBLES_MERGE_PILOT_SLUGS.map(
  (slug) => `/รับซื้อ/${slug}`,
);

/** Remaining ของสะสม × province pages that must stay live (exclude Ubon IMPROVE + pilot). */
export const COLLECTIBLES_FAMILY_PROTECTED_SLUGS = [
  'รับซื้อของสะสม-ร้อยเอ็ด',
  'รับซื้อของสะสม-เลย',
  'รับซื้อของสะสม-ศรีสะเกษ',
  'รับซื้อของสะสม-สกลนคร',
  'รับซื้อของสะสม-สุรินทร์',
  'รับซื้อของสะสม-หนองคาย',
  'รับซื้อของสะสม-หนองบัวลำภู',
  'รับซื้อของสะสม-อำนาจเจริญ',
  'รับซื้อของสะสม-อุดรธานี',
] as const;

export function isCollectiblesMergePilotSlug(slug: string): boolean {
  return COLLECTIBLES_MERGE_PILOT_SLUG_SET.has(slug);
}
