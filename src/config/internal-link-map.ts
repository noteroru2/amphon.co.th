/**
 * Batch 11 — selective internal link maps (deterministic, no keyword auto-linking).
 */
import type { CollectionEntry } from 'astro:content';
import { getServiceCluster, type ServiceCluster } from './service-clusters';
import { isIndexableServiceArea } from './seo-policy';

type ServiceEntry = CollectionEntry<'services'>;
type ServiceAreaEntry = CollectionEntry<'serviceAreas'>;

/** Service slugs whose province pages are thin templates — do not strengthen as destinations. */
export const DEFERRED_SERVICE_AREA_SERVICE_SLUGS = new Set([
  'รับซื้อ-server',
  'รับซื้อ-ups',
  'รับซื้อของสะสม',
  'รับซื้อทีวี',
  'รับซื้ออุปกรณ์-network',
  'รับซื้อเฟอร์นิเจอร์',
  'รับซื้อเครื่องใช้ไฟฟ้า',
  'รับซื้อหูฟัง',
  'รับซื้อลำโพงบลูทูธ',
  'รับซื้อโดรน',
]);

export type SupportingArticleLink = {
  path: string;
  anchor: string;
};

/** Curated non-thin supporting articles for core service hubs only. */
export const SERVICE_SUPPORTING_ARTICLES: Record<string, SupportingArticleLink[]> = {
  'รับซื้อ-macbook': [
    {
      path: '/blog/วิธีล้างเครื่อง-macbook-ก่อนขาย',
      anchor: 'วิธีล้างข้อมูล MacBook ก่อนขาย',
    },
    {
      path: '/blog/ราคา-macbook-มือสอง-2026',
      anchor: 'ปัจจัยที่มีผลต่อราคา MacBook มือสอง',
    },
    {
      path: '/blog/macbook-battery-cycle-มีผลต่อราคาขายแค่ไหน',
      anchor: 'Battery Cycle มีผลต่อราคาขายอย่างไร',
    },
  ],
  'รับซื้อ-iphone': [
    {
      path: '/blog/ราคา-iphone-มือสอง-2026',
      anchor: 'แนวโน้มราคา iPhone มือสอง',
    },
    {
      path: '/blog/วิธีเช็ก-battery-health-iphone-ก่อนขาย',
      anchor: 'วิธีเช็ก Battery Health ก่อนขาย iPhone',
    },
    {
      path: '/blog/iphone-แบตเสื่อม-face-id-เสีย-จอแตก-ขายได้ไหม',
      anchor: 'iPhone มีตำหนิแล้วยังประเมินได้ไหม',
    },
  ],
  'รับซื้อโน๊ตบุ๊ค': [
    {
      path: '/blog/ขายโน๊ตบุ๊คเก่าให้ได้ราคาดี-ต้องเช็กอะไรบ้าง',
      anchor: 'เช็กอะไรบ้างก่อนขายโน๊ตบุ๊ค',
    },
    {
      path: '/blog/โน๊ตบุ๊คเปิดไม่ติด-ขายได้ไหม',
      anchor: 'โน๊ตบุ๊คเปิดไม่ติดยังประเมินได้ไหม',
    },
    {
      path: '/blog/วิธีเช็กสเปกคอมก่อนขาย',
      anchor: 'วิธีเช็กสเปกก่อนส่งประเมิน',
    },
  ],
  'รับซื้อคอมพิวเตอร์': [
    {
      path: '/blog/วิธีเช็กสเปกคอมก่อนขาย',
      anchor: 'วิธีเช็กสเปกคอมก่อนขาย',
    },
    {
      path: '/blog/การ์ดจอมีผลต่อราคาคอมมือสองแค่ไหน',
      anchor: 'การ์ดจอมีผลต่อราคาคอมมือสองแค่ไหน',
    },
  ],
  'รับซื้อ-ipad': [
    {
      path: '/blog/วิธีเช็กรุ่น-ipad-ว่าเป็น-gen-ไหน',
      anchor: 'วิธีเช็กรุ่น iPad ก่อนขาย',
    },
    {
      path: '/blog/ราคา-ipad-มือสอง-2026',
      anchor: 'แนวโน้มราคา iPad มือสอง',
    },
  ],
  'รับซื้อกล้อง': [
    {
      path: '/blog/กล้อง-shutter-count-สูง-ขายได้ไหม',
      anchor: 'Shutter Count สูงมีผลต่อราคาอย่างไร',
    },
    {
      path: '/blog/ขายกล้อง-sony-มือสอง-ต้องเช็กอะไรบ้าง',
      anchor: 'จุดที่ควรเช็กก่อนขายกล้อง Sony',
    },
  ],
  'รับซื้อคอมบริษัท': [
    {
      path: '/blog/คอมบริษัทเก่า-ขายแบบไหนให้เคลียร์ง่าย',
      anchor: 'ขายคอมบริษัทเก่ายังไงให้เคลียร์ง่าย',
    },
  ],
};

export function getSupportingArticlesForService(serviceSlug: string): SupportingArticleLink[] {
  return SERVICE_SUPPORTING_ARTICLES[serviceSlug] ?? [];
}

/** Core commercial hubs preferred as same-province horizontal destinations (F-06). */
export const PROVINCE_RELATED_HUB_PRIORITY = [
  'รับซื้อโน๊ตบุ๊ค',
  'รับซื้อ-macbook',
  'รับซื้อคอมพิวเตอร์',
  'รับซื้อ-iphone',
  'รับซื้อ-ipad',
  'รับซื้อกล้อง',
  'รับซื้อคอมบริษัท',
  'รับซื้อแรม',
  'รับซื้อโทรศัพท์มือสอง',
] as const;

/**
 * Same-province related service×area links (horizontal spoke links).
 * Prefers core commercial hubs, then same cluster; never targets deferred thin templates.
 */
export function getRelatedServiceAreasInProvince(
  current: ServiceAreaEntry,
  allServiceAreas: ServiceAreaEntry[],
  allServices: ServiceEntry[],
  limit = 4,
): ServiceAreaEntry[] {
  const areaSlug = current.data.areaSlug;
  const currentServiceSlug = current.data.serviceSlug;
  const serviceBySlug = new Map(allServices.map((s) => [s.data.slug, s]));
  const currentService = serviceBySlug.get(currentServiceSlug);
  if (!currentService) return [];

  const cluster = getServiceCluster(currentService);

  const candidates = allServiceAreas.filter((sa) => {
    if (sa.data.slug === current.data.slug) return false;
    if (sa.data.areaSlug !== areaSlug) return false;
    if (sa.data.draft) return false;
    if (!isIndexableServiceArea(sa)) return false;
    if (DEFERRED_SERVICE_AREA_SERVICE_SLUGS.has(sa.data.serviceSlug)) return false;
    if (sa.data.serviceSlug === currentServiceSlug) return false;
    return true;
  });

  const scored = candidates.map((sa) => {
    const svc = serviceBySlug.get(sa.data.serviceSlug);
    const saCluster: ServiceCluster | null = svc ? getServiceCluster(svc) : null;
    const sameCluster = saCluster === cluster;
    const hubBoost = (PROVINCE_RELATED_HUB_PRIORITY as readonly string[]).indexOf(
      sa.data.serviceSlug,
    );
    return {
      sa,
      sameCluster,
      hubRank: hubBoost === -1 ? 50 : hubBoost,
    };
  });

  // Hub destinations first (strengthen P1/P2), then same-cluster fillers.
  scored.sort((a, b) => {
    if (a.hubRank !== b.hubRank) return a.hubRank - b.hubRank;
    if (a.sameCluster !== b.sameCluster) return a.sameCluster ? -1 : 1;
    return a.sa.data.slug.localeCompare(b.sa.data.slug, 'th');
  });

  return scored.slice(0, limit).map((x) => x.sa);
}

/** Short province-facing label for sidebar (avoid repeating long titles). */
export function serviceAreaSidebarLabel(entry: ServiceAreaEntry): string {
  const province = entry.data.areaSlug;
  const raw = (entry.data.mainKeyword || entry.data.serviceSlug).trim();
  const withoutProvince = raw.replace(new RegExp(`\\s*${province}\\s*$`), '').trim() || raw;
  return `${withoutProvince} ใน${province}`;
}
