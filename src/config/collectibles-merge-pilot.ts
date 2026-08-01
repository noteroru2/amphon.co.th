/**
 * Collectibles family consolidation (Batch 12B pilot + Batch 12C completion).
 * Non-Ubon ของสะสม × province only — Ubon remains IMPROVE (F-04).
 */
export const COLLECTIBLES_MERGE_PILOT_TARGET = '/บริการ/รับซื้อของสะสม';

/** Exact serviceArea slugs retired in Pilot A (Batch 12B). */
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

/** Remaining family slugs retired in Batch 12C (were protected in 12B). */
export const COLLECTIBLES_FAMILY_COMPLETION_SLUGS = [
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

/** @deprecated use COLLECTIBLES_FAMILY_COMPLETION_SLUGS — kept for docs/compat naming */
export const COLLECTIBLES_FAMILY_PROTECTED_SLUGS = COLLECTIBLES_FAMILY_COMPLETION_SLUGS;

export const COLLECTIBLES_FAMILY_RETIRED_SLUGS = [
  ...COLLECTIBLES_MERGE_PILOT_SLUGS,
  ...COLLECTIBLES_FAMILY_COMPLETION_SLUGS,
] as const;

export const COLLECTIBLES_FAMILY_RETIRED_SLUG_SET = new Set<string>(COLLECTIBLES_FAMILY_RETIRED_SLUGS);

export const COLLECTIBLES_MERGE_PILOT_SLUG_SET = new Set<string>(COLLECTIBLES_MERGE_PILOT_SLUGS);

export const COLLECTIBLES_MERGE_PILOT_PATHS = COLLECTIBLES_MERGE_PILOT_SLUGS.map(
  (slug) => `/รับซื้อ/${slug}`,
);

export const COLLECTIBLES_FAMILY_COMPLETION_PATHS = COLLECTIBLES_FAMILY_COMPLETION_SLUGS.map(
  (slug) => `/รับซื้อ/${slug}`,
);

export const COLLECTIBLES_FAMILY_RETIRED_PATHS = COLLECTIBLES_FAMILY_RETIRED_SLUGS.map(
  (slug) => `/รับซื้อ/${slug}`,
);

export function isCollectiblesMergePilotSlug(slug: string): boolean {
  return COLLECTIBLES_FAMILY_RETIRED_SLUG_SET.has(slug);
}

export function isCollectiblesFamilyRetiredSlug(slug: string): boolean {
  return COLLECTIBLES_FAMILY_RETIRED_SLUG_SET.has(slug);
}
