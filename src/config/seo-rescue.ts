import type { CollectionEntry } from 'astro:content';
import { SERVICE_CLUSTERS, getServiceCluster } from './service-clusters';

type ServiceEntry = CollectionEntry<'services'>;

const NON_CORE_SERVICE_SLUGS = new Set([
  'รับซื้อของสะสม',
  'รับซื้อทีวี',
  'รับซื้อเครื่องใช้ไฟฟ้า',
  'รับซื้อเฟอร์นิเจอร์',
  'รับซื้อโดรน',
]);

const RESCUE_GROUPS = [
  {
    cluster: SERVICE_CLUSTERS.NOTEBOOK,
    title: 'โน๊ตบุ๊คและ Laptop',
    description: 'หน้าหลักและหน้ารุ่นย่อยที่มี intent ซื้อขายชัดเจน',
  },
  {
    cluster: SERVICE_CLUSTERS.APPLE,
    title: 'Apple Devices',
    description: 'กลุ่ม iPhone, iPad, MacBook และอุปกรณ์ Apple ที่มี volume จริง',
  },
  {
    cluster: SERVICE_CLUSTERS.DESKTOP,
    title: 'คอมพิวเตอร์และ Desktop',
    description: 'คอมตั้งโต๊ะ คอมประกอบ และอุปกรณ์คอมที่ยังควรเก็บเป็น landing pages',
  },
  {
    cluster: SERVICE_CLUSTERS.GAMING,
    title: 'Gaming และ Workstation',
    description: 'หน้าที่ intent เฉพาะ เช่น gaming, workstation และอะไหล่คอมสเปกสูง',
  },
  {
    cluster: SERVICE_CLUSTERS.CAMERA,
    title: 'กล้องและอุปกรณ์ถ่ายภาพ',
    description: 'หน้ากล้อง เลนส์ และ action camera ที่ยังสอดคล้องกับบริการหลัก',
  },
  {
    cluster: SERVICE_CLUSTERS.SERVER_NETWORK,
    title: 'Server / Network / UPS',
    description: 'กลุ่ม B2B/IT ที่ควรมี parent hub และลิงก์รองรับชัดเจน',
  },
  {
    cluster: SERVICE_CLUSTERS.COM_OFFICE,
    title: 'B2B / Office IT',
    description: 'คอมบริษัท ยกล็อต ประมูล และเคลียร์อุปกรณ์ไอทีสำนักงาน',
  },
] as const;

function sortServices(services: ServiceEntry[]): ServiceEntry[] {
  return [...services].sort((a, b) => {
    const byOrder = (a.data.order ?? 999) - (b.data.order ?? 999);
    if (byOrder !== 0) return byOrder;
    return a.data.title.localeCompare(b.data.title, 'th');
  });
}

export function isRescueCandidate(service: ServiceEntry): boolean {
  return !NON_CORE_SERVICE_SLUGS.has(service.data.slug);
}

export function buildSeoRescueGroups(services: ServiceEntry[]) {
  return RESCUE_GROUPS.map((group) => {
    const links = sortServices(
      services.filter(
        (service) =>
          isRescueCandidate(service) && getServiceCluster(service) === group.cluster,
      ),
    );

    return {
      ...group,
      links,
    };
  }).filter((group) => group.links.length > 0);
}

export function getNonCoreServiceSlugs(): string[] {
  return [...NON_CORE_SERVICE_SLUGS];
}

