import type { CollectionEntry } from 'astro:content';

export const LEGACY_SERVICE_MERGES = {
  'รับซื้อ-gopro': {
    canonicalSlug: 'รับซื้อ-gopro-action-camera',
    servicePath: '/บริการ/รับซื้อ-gopro-action-camera',
    strategy: 'service-redirect',
  },
  'รับซื้อเลนส์': {
    canonicalSlug: 'รับซื้อเลนส์กล้อง',
    servicePath: '/บริการ/รับซื้อเลนส์กล้อง',
    strategy: 'service-redirect',
  },
  'รับซื้อ-hdd': {
    canonicalSlug: 'รับซื้อ-ssd',
    servicePath: '/บริการ/รับซื้อ-ssd',
    serviceAreaPrefix: 'รับซื้อ-ssd',
    strategy: 'service-area-redirect',
  },
  'รับซื้อ-storage-nas': {
    canonicalSlug: 'รับซื้อ-nas',
    servicePath: '/บริการ/รับซื้อ-nas',
    strategy: 'service-redirect',
  },
} as const;

export const LEGACY_SERVICE_AREA_SERVICE_SLUGS = new Set(
  Object.keys(LEGACY_SERVICE_MERGES),
);

export const EXACT_REDIRECTS = [
  {
    source: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด/',
    destination: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด',
  },
  {
    source: '/บริการ/รับซื้อ-gopro',
    destination: '/บริการ/รับซื้อ-gopro-action-camera',
  },
  {
    source: '/บริการ/รับซื้อเลนส์',
    destination: '/บริการ/รับซื้อเลนส์กล้อง',
  },
  {
    source: '/บริการ/รับซื้อ-hdd',
    destination: '/บริการ/รับซื้อ-ssd',
  },
  {
    source: '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
    destination: '/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
  },
] as const;

type ServiceAreaEntry = CollectionEntry<'serviceAreas'>;

export function isLegacyMergedServiceSlug(serviceSlug: string): boolean {
  return LEGACY_SERVICE_AREA_SERVICE_SLUGS.has(serviceSlug);
}

export function isIndexableServiceArea(entry: ServiceAreaEntry): boolean {
  return !isLegacyMergedServiceSlug(entry.data.serviceSlug);
}

export function filterIndexableServiceAreas<T extends ServiceAreaEntry>(entries: T[]): T[] {
  return entries.filter((entry) => isIndexableServiceArea(entry));
}

export function getCanonicalServiceHref(serviceSlug: string): string {
  if (serviceSlug === 'รับซื้อสินค้าไอที') {
    return '/รับซื้อสินค้าไอที';
  }

  const mergeRule =
    LEGACY_SERVICE_MERGES[serviceSlug as keyof typeof LEGACY_SERVICE_MERGES];

  if (mergeRule) {
    return mergeRule.servicePath;
  }

  return `/บริการ/${serviceSlug}`;
}

