/**
 * Page taxonomy for GA4 CTA measurement (R9B).
 * Derived from pathname only — never visitor GPS / PII.
 */

export type PageType =
  | 'home'
  | 'service_national'
  | 'service_brand'
  | 'service_specialist'
  | 'service_condition'
  | 'service_local'
  | 'area_hub'
  | 'city_hub'
  | 'corporate_parent'
  | 'corporate_child'
  | 'bulk_service'
  | 'blog'
  | 'guide'
  | 'model_series'
  | 'services_index'
  | 'other';

export type ServiceCategory =
  | 'multi_service'
  | 'phone'
  | 'iphone'
  | 'tablet'
  | 'ipad'
  | 'notebook'
  | 'macbook'
  | 'computer'
  | 'gaming_pc'
  | 'custom_pc'
  | 'ram'
  | 'gpu'
  | 'cpu'
  | 'monitor'
  | 'component'
  | 'camera'
  | 'corporate_it'
  | 'company_computer'
  | 'office_computer'
  | 'bulk_computer'
  | 'company_notebook'
  | 'bulk_notebook'
  | 'office_it'
  | 'server_network'
  | 'other';

export type LeadType = 'consumer' | 'corporate' | 'bulk' | 'infrastructure';

export type AnalyticsPageContext = {
  page_type: PageType;
  service_category: ServiceCategory;
  province: string;
  lead_type?: LeadType;
};

/** City hubs that must map analytics province to the parent province. */
const CITY_HUB_PROVINCE: Record<string, string> = {
  หาดใหญ่: 'สงขลา',
};

/** Known area/province tokens used when parsing local service slugs. */
export const KNOWN_PROVINCES = [
  'อุบลราชธานี',
  'ขอนแก่น',
  'นครราชสีมา',
  'อุดรธานี',
  'บุรีรัมย์',
  'สุรินทร์',
  'ศรีสะเกษ',
  'ยโสธร',
  'อำนาจเจริญ',
  'มหาสารคาม',
  'ร้อยเอ็ด',
  'กาฬสินธุ์',
  'สกลนคร',
  'นครพนม',
  'มุกดาหาร',
  'ชัยภูมิ',
  'เลย',
  'หนองบัวลำภู',
  'หนองคาย',
  'บึงกาฬ',
  'ภูเก็ต',
  'สงขลา',
  'กรุงเทพ',
  'เชียงใหม่',
  'ชลบุรี',
] as const;

type ServiceRule = {
  page_type: PageType;
  service_category: ServiceCategory;
  lead_type?: LeadType;
};

/** Exact slug overrides for national /บริการ pages. */
const SERVICE_SLUG_RULES: Record<string, ServiceRule> = {
  'รับซื้อสินค้าไอทีบริษัท': {
    page_type: 'corporate_parent',
    service_category: 'corporate_it',
    lead_type: 'corporate',
  },
  'รับซื้ออุปกรณ์ไอทีบริษัท': {
    page_type: 'corporate_child',
    service_category: 'corporate_it',
    lead_type: 'corporate',
  },
  'รับซื้อคอมบริษัท': {
    page_type: 'corporate_child',
    service_category: 'company_computer',
    lead_type: 'corporate',
  },
  'รับซื้อคอมบริษัทปิดกิจการ': {
    page_type: 'corporate_child',
    service_category: 'company_computer',
    lead_type: 'corporate',
  },
  'รับซื้อโน๊ตบุ๊คบริษัท': {
    page_type: 'corporate_child',
    service_category: 'company_notebook',
    lead_type: 'corporate',
  },
  'รับซื้อคอมสำนักงาน': {
    page_type: 'corporate_child',
    service_category: 'office_computer',
    lead_type: 'corporate',
  },
  'รับเคลียร์อุปกรณ์ไอทีสำนักงาน': {
    page_type: 'corporate_child',
    service_category: 'office_it',
    lead_type: 'corporate',
  },
  'รับซื้อคอมยกล็อต': {
    page_type: 'bulk_service',
    service_category: 'bulk_computer',
    lead_type: 'bulk',
  },
  'รับซื้อโน๊ตบุ๊คยกล็อต': {
    page_type: 'bulk_service',
    service_category: 'bulk_notebook',
    lead_type: 'bulk',
  },
  'รับซื้อ-server-network': {
    page_type: 'service_specialist',
    service_category: 'server_network',
    lead_type: 'infrastructure',
  },
  'รับซื้อ-server': {
    page_type: 'service_specialist',
    service_category: 'server_network',
    lead_type: 'infrastructure',
  },
  'รับซื้อ-storage-nas': {
    page_type: 'service_specialist',
    service_category: 'server_network',
    lead_type: 'infrastructure',
  },
  'รับซื้อ-gaming-pc': {
    page_type: 'service_specialist',
    service_category: 'gaming_pc',
    lead_type: 'consumer',
  },
  'รับซื้อคอมประกอบ': {
    page_type: 'service_specialist',
    service_category: 'custom_pc',
    lead_type: 'consumer',
  },
  'รับซื้อแรม': {
    page_type: 'service_specialist',
    service_category: 'ram',
    lead_type: 'consumer',
  },
  'รับซื้อการ์ดจอ': {
    page_type: 'service_specialist',
    service_category: 'gpu',
    lead_type: 'consumer',
  },
  'รับซื้อซีพียู': {
    page_type: 'service_specialist',
    service_category: 'cpu',
    lead_type: 'consumer',
  },
  'รับซื้อจอคอมพิวเตอร์': {
    page_type: 'service_specialist',
    service_category: 'monitor',
    lead_type: 'consumer',
  },
  'รับซื้ออุปกรณ์คอมพิวเตอร์': {
    page_type: 'service_specialist',
    service_category: 'component',
    lead_type: 'consumer',
  },
  'รับซื้อโทรศัพท์มือสอง': {
    page_type: 'service_national',
    service_category: 'phone',
    lead_type: 'consumer',
  },
  'รับซื้อแท็บเล็ต': {
    page_type: 'service_national',
    service_category: 'tablet',
    lead_type: 'consumer',
  },
  'รับซื้อโน๊ตบุ๊ค': {
    page_type: 'service_national',
    service_category: 'notebook',
    lead_type: 'consumer',
  },
  'รับซื้อคอมพิวเตอร์': {
    page_type: 'service_national',
    service_category: 'computer',
    lead_type: 'consumer',
  },
  'รับซื้อคอมพิวเตอร์ตั้งโต๊ะ': {
    page_type: 'service_national',
    service_category: 'computer',
    lead_type: 'consumer',
  },
  'รับซื้อ-iphone': {
    page_type: 'service_brand',
    service_category: 'iphone',
    lead_type: 'consumer',
  },
  'รับซื้อ-ipad': {
    page_type: 'service_brand',
    service_category: 'ipad',
    lead_type: 'consumer',
  },
  'รับซื้อ-macbook': {
    page_type: 'service_brand',
    service_category: 'macbook',
    lead_type: 'consumer',
  },
  'รับซื้อกล้อง': {
    page_type: 'service_national',
    service_category: 'camera',
    lead_type: 'consumer',
  },
};

const CONDITION_MARKERS = [
  'เสีย',
  'จอแตก',
  'เปิดไม่ติด',
  'ไม่มี-adapter',
  'ไม่มีadapter',
  'face-id',
  'ไม่มี-icloud',
  'แบตเสื่อม',
];

function normalizePath(pathname: string): string {
  let path = pathname || '/';
  try {
    path = decodeURIComponent(path);
  } catch {
    // keep raw
  }
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
}

function classifyServiceSlug(slug: string): ServiceRule {
  const exact = SERVICE_SLUG_RULES[slug];
  if (exact) return exact;

  if (slug.startsWith('รับซื้อ-iphone')) {
    return { page_type: 'service_brand', service_category: 'iphone', lead_type: 'consumer' };
  }
  if (slug.startsWith('รับซื้อ-ipad') || slug.includes('magic-keyboard-ipad')) {
    return { page_type: 'service_brand', service_category: 'ipad', lead_type: 'consumer' };
  }
  if (slug.startsWith('รับซื้อ-macbook') || slug.includes('mac-mini') || slug.includes('imac')) {
    return { page_type: 'service_brand', service_category: 'macbook', lead_type: 'consumer' };
  }

  if (CONDITION_MARKERS.some((m) => slug.includes(m))) {
    const base = classifyServiceSlugLoose(slug);
    return { page_type: 'service_condition', service_category: base, lead_type: 'consumer' };
  }

  if (slug.includes('ยกล็อต')) {
    const cat: ServiceCategory = slug.includes('โน๊ตบุ๊ค') ? 'bulk_notebook' : 'bulk_computer';
    return { page_type: 'bulk_service', service_category: cat, lead_type: 'bulk' };
  }

  if (slug.includes('บริษัท') || slug.includes('ประมูล') || slug.includes('เคลียร์')) {
    return {
      page_type: 'corporate_child',
      service_category: slug.includes('โน๊ตบุ๊ค') ? 'company_notebook' : 'corporate_it',
      lead_type: 'corporate',
    };
  }

  if (slug.includes('server') || slug.includes('network') || slug.includes('nas') || slug.includes('ups')) {
    return {
      page_type: 'service_specialist',
      service_category: 'server_network',
      lead_type: 'infrastructure',
    };
  }

  if (slug.includes('gaming') || slug.includes('เกมมิ่ง')) {
    return { page_type: 'service_specialist', service_category: 'gaming_pc', lead_type: 'consumer' };
  }

  if (slug.includes('แรม')) {
    return { page_type: 'service_specialist', service_category: 'ram', lead_type: 'consumer' };
  }
  if (slug.includes('การ์ดจอ') || slug.includes('gpu')) {
    return { page_type: 'service_specialist', service_category: 'gpu', lead_type: 'consumer' };
  }
  if (slug.includes('ซีพียู') || slug.includes('cpu')) {
    return { page_type: 'service_specialist', service_category: 'cpu', lead_type: 'consumer' };
  }

  if (slug.includes('iphone') || slug.includes('โทรศัพท์') || slug.includes('มือถือ')) {
    return {
      page_type: slug.includes('iphone') ? 'service_brand' : 'service_national',
      service_category: slug.includes('iphone') ? 'iphone' : 'phone',
      lead_type: 'consumer',
    };
  }
  if (slug.includes('ipad') || slug.includes('แท็บเล็ต') || slug.includes('surface')) {
    return {
      page_type: slug.includes('ipad') ? 'service_brand' : 'service_national',
      service_category: slug.includes('ipad') ? 'ipad' : 'tablet',
      lead_type: 'consumer',
    };
  }
  if (slug.includes('macbook') || slug.includes('mac-')) {
    return { page_type: 'service_brand', service_category: 'macbook', lead_type: 'consumer' };
  }
  if (slug.includes('โน๊ตบุ๊ค') || slug.includes('notebook')) {
    return { page_type: 'service_national', service_category: 'notebook', lead_type: 'consumer' };
  }
  if (slug.includes('กล้อง') || slug.includes('เลนส์') || slug.includes('โดรน') || slug.includes('gopro')) {
    return { page_type: 'service_national', service_category: 'camera', lead_type: 'consumer' };
  }
  if (slug.includes('คอมพิวเตอร์') || slug.includes('คอม')) {
    return { page_type: 'service_national', service_category: 'computer', lead_type: 'consumer' };
  }

  return { page_type: 'service_national', service_category: 'other', lead_type: 'consumer' };
}

function classifyServiceSlugLoose(slug: string): ServiceCategory {
  if (slug.includes('iphone') || (slug.includes('โทรศัพท์') && !slug.includes('แท็บ'))) return slug.includes('iphone') ? 'iphone' : 'phone';
  if (slug.includes('ipad') || slug.includes('แท็บเล็ต')) return slug.includes('ipad') ? 'ipad' : 'tablet';
  if (slug.includes('macbook')) return 'macbook';
  if (slug.includes('โน๊ตบุ๊ค')) return 'notebook';
  if (slug.includes('gaming')) return 'gaming_pc';
  if (slug.includes('แรม')) return 'ram';
  if (slug.includes('คอมพิวเตอร์') || slug.includes('คอม')) return 'computer';
  if (slug.includes('กล้อง')) return 'camera';
  return 'other';
}

function parseLocalServiceSlug(slug: string): { servicePart: string; province: string } {
  for (const province of KNOWN_PROVINCES) {
    const suffix = `-${province}`;
    if (slug.endsWith(suffix)) {
      return { servicePart: slug.slice(0, -suffix.length), province };
    }
  }
  const dash = slug.lastIndexOf('-');
  if (dash > 0) {
    return { servicePart: slug.slice(0, dash), province: slug.slice(dash + 1) || 'national' };
  }
  return { servicePart: slug, province: 'national' };
}

/**
 * Resolve analytics page context from a URL pathname.
 */
export function resolveAnalyticsContext(pathname: string): AnalyticsPageContext {
  const path = normalizePath(pathname);

  if (path === '/') {
    return { page_type: 'home', service_category: 'multi_service', province: 'national' };
  }

  if (path === '/รับซื้อสินค้าไอที') {
    return { page_type: 'services_index', service_category: 'multi_service', province: 'national' };
  }

  if (path === '/วิธีการรับซื้อ') {
    return { page_type: 'guide', service_category: 'multi_service', province: 'national' };
  }

  if (path === '/blog' || path.startsWith('/blog/')) {
    return { page_type: 'blog', service_category: 'multi_service', province: 'national' };
  }

  if (path.startsWith('/พื้นที่ให้บริการ/')) {
    const areaSlug = path.slice('/พื้นที่ให้บริการ/'.length);
    if (!areaSlug) {
      return { page_type: 'other', service_category: 'multi_service', province: 'national' };
    }
    const cityProvince = CITY_HUB_PROVINCE[areaSlug];
    if (cityProvince) {
      return {
        page_type: 'city_hub',
        service_category: 'multi_service',
        province: cityProvince,
      };
    }
    return {
      page_type: 'area_hub',
      service_category: 'multi_service',
      province: areaSlug,
    };
  }

  if (path.startsWith('/รับซื้อ/')) {
    const slug = path.slice('/รับซื้อ/'.length);
    const { servicePart, province } = parseLocalServiceSlug(slug);
    const rule = classifyServiceSlug(servicePart);
    return {
      page_type: 'service_local',
      service_category: rule.service_category,
      province,
      lead_type: rule.lead_type,
    };
  }

  if (path.startsWith('/บริการ/')) {
    const slug = path.slice('/บริการ/'.length);
    const rule = classifyServiceSlug(slug);
    return {
      page_type: rule.page_type,
      service_category: rule.service_category,
      province: 'national',
      lead_type: rule.lead_type,
    };
  }

  return { page_type: 'other', service_category: 'multi_service', province: 'national' };
}

/** Serialize context for HTML data attributes (omit empty lead_type). */
export function analyticsContextToDataset(ctx: AnalyticsPageContext): Record<string, string> {
  const out: Record<string, string> = {
    pageType: ctx.page_type,
    serviceCategory: ctx.service_category,
    province: ctx.province,
  };
  if (ctx.lead_type) out.leadType = ctx.lead_type;
  return out;
}
