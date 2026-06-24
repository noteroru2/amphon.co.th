import type { CollectionEntry } from 'astro:content';

export const SERVICE_CLUSTERS = {
  COM_OFFICE: 'COM_OFFICE',
  NOTEBOOK: 'NOTEBOOK',
  APPLE: 'APPLE',
  SERVER_NETWORK: 'SERVER_NETWORK',
  CAMERA: 'CAMERA',
  GAMING: 'GAMING',
  DESKTOP: 'DESKTOP',
  WORKSTATION: 'WORKSTATION',
  GENERAL_IT: 'GENERAL_IT',
} as const;

export type ServiceCluster = (typeof SERVICE_CLUSTERS)[keyof typeof SERVICE_CLUSTERS];

type ServiceEntry = CollectionEntry<'services'>;

const SLUG_CLUSTER_OVERRIDES: Record<string, ServiceCluster> = {
  'รับซื้อคอมพิวเตอร์': SERVICE_CLUSTERS.COM_OFFICE,
  'รับซื้อคอมบริษัท': SERVICE_CLUSTERS.COM_OFFICE,
  'รับซื้อ-iphone': SERVICE_CLUSTERS.APPLE,
  'รับซื้อ-ipad': SERVICE_CLUSTERS.APPLE,
  'รับซื้อ-macbook': SERVICE_CLUSTERS.APPLE,
  'รับซื้อกล้อง': SERVICE_CLUSTERS.CAMERA,
  'รับซื้อโน๊ตบุ๊ค': SERVICE_CLUSTERS.NOTEBOOK,
  'รับซื้อ-dell-inspiron': SERVICE_CLUSTERS.NOTEBOOK,
  'รับซื้อ-hp-pavilion': SERVICE_CLUSTERS.NOTEBOOK,
  'รับซื้อ-lenovo-ideapad': SERVICE_CLUSTERS.NOTEBOOK,
  'รับซื้อ-asus-vivobook': SERVICE_CLUSTERS.NOTEBOOK,
  'รับซื้อ-acer-aspire': SERVICE_CLUSTERS.NOTEBOOK,
  'รับซื้อโน๊ตบุ๊คเกมมิ่ง': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-gaming-pc': SERVICE_CLUSTERS.GAMING,
  'รับซื้อคอมเกมมิ่ง': SERVICE_CLUSTERS.GAMING,
  'รับซื้อคอมร้านเกม': SERVICE_CLUSTERS.GAMING,
  'รับซื้อคอมสตรีมเกม': SERVICE_CLUSTERS.GAMING,
  'รับซื้อคอมเล่นเกมสเปกแรง': SERVICE_CLUSTERS.GAMING,
  'รับซื้อคอมพิวเตอร์ตั้งโต๊ะ': SERVICE_CLUSTERS.DESKTOP,
  'รับซื้อ-desktop-pc': SERVICE_CLUSTERS.DESKTOP,
  'รับซื้อ-pc-มือสอง': SERVICE_CLUSTERS.DESKTOP,
  'รับซื้อคอมประกอบ': SERVICE_CLUSTERS.DESKTOP,
  'รับซื้อคอมสเปกสูง': SERVICE_CLUSTERS.DESKTOP,
  'รับซื้อ-workstation': SERVICE_CLUSTERS.WORKSTATION,
  'รับซื้อคอมทำงานกราฟิก': SERVICE_CLUSTERS.WORKSTATION,
  'รับซื้อคอมตัดต่อวิดีโอ': SERVICE_CLUSTERS.WORKSTATION,
  'รับซื้อคอม-3d-render': SERVICE_CLUSTERS.WORKSTATION,
  'รับซื้อคอม-cad-engineer': SERVICE_CLUSTERS.WORKSTATION,
  'รับซื้อคอม-ai-deep-learning': SERVICE_CLUSTERS.WORKSTATION,
  'รับซื้อ-msi-notebook': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-katana': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-cyborg': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-thin': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-raider': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-vector': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-stealth': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-pulse-crosshair': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-titan': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-msi-sword': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-rog-gaming-notebook': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-rog-strix': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-rog-zephyrus': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-asus-tuf-gaming': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-lenovo-legion': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-lenovo-loq': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-gigabyte-gaming-notebook': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-gigabyte-aorus': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-gigabyte-g5-g6-g7': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-acer-nitro': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-acer-predator': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-hp-victus': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-hp-omen': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-dell-alienware': SERVICE_CLUSTERS.GAMING,
  'รับซื้อ-dell-g-series': SERVICE_CLUSTERS.GAMING,
  'รับซื้อเฟอร์นิเจอร์': SERVICE_CLUSTERS.GENERAL_IT,
  'รับซื้อเครื่องใช้ไฟฟ้า': SERVICE_CLUSTERS.GENERAL_IT,
  'รับซื้อหูฟัง': SERVICE_CLUSTERS.GENERAL_IT,
  'รับซื้อลำโพงบลูทูธ': SERVICE_CLUSTERS.GENERAL_IT,
  'รับซื้อทีวี': SERVICE_CLUSTERS.GENERAL_IT,
  'รับซื้อของสะสม': SERVICE_CLUSTERS.GENERAL_IT,
};

/** Preferred order within each cluster (hub pages first). */
const CLUSTER_PRIORITY_SLUGS: Record<ServiceCluster, string[]> = {
  [SERVICE_CLUSTERS.COM_OFFICE]: [
    'รับซื้อคอมพิวเตอร์',
    'รับซื้อคอมสำนักงาน',
    'รับซื้อคอมบริษัท',
    'รับซื้อคอมยกล็อต',
    'รับซื้อคอมประกอบ',
    'รับซื้อคอมบริษัทปิดกิจการ',
    'รับซื้อคอมเสีย',
    'รับซื้อคอมร้านเกม',
    'รับซื้อโน๊ตบุ๊คบริษัท',
    'รับซื้อสินค้าไอทีบริษัท',
    'รับซื้ออุปกรณ์สำนักงานมือสอง',
    'รับซื้อจอคอม',
    'รับเคลียร์อุปกรณ์ไอทีสำนักงาน',
    'รับเหมาประมูลอุปกรณ์ไอที',
    'รับประมูลคอมพิวเตอร์มือสอง',
    'รับซื้ออุปกรณ์คอมพิวเตอร์',
  ],
  [SERVICE_CLUSTERS.NOTEBOOK]: [
    'รับซื้อโน๊ตบุ๊ค',
    'รับซื้อโน๊ตบุ๊คเกมมิ่ง',
    'รับซื้อโน๊ตบุ๊คเสีย',
    'รับซื้อโน๊ตบุ๊คจอแตก',
    'รับซื้อโน๊ตบุ๊คเปิดไม่ติด',
    'รับซื้อ-notebook-asus',
    'รับซื้อ-notebook-acer',
    'รับซื้อ-notebook-hp',
    'รับซื้อ-notebook-dell',
    'รับซื้อ-notebook-lenovo',
    'รับซื้อ-dell-latitude',
    'รับซื้อ-hp-elitebook',
    'รับซื้อ-lenovo-thinkpad',
    'รับซื้อ-asus-expertbook',
    'รับซื้อ-dell-inspiron',
    'รับซื้อ-hp-pavilion',
    'รับซื้อ-lenovo-ideapad',
    'รับซื้อ-asus-vivobook',
    'รับซื้อ-acer-aspire',
    'รับซื้อ-surface',
    'รับซื้อแท็บเล็ต',
  ],
  [SERVICE_CLUSTERS.APPLE]: [
    'รับซื้อ-iphone',
    'รับซื้อ-ipad',
    'รับซื้อ-macbook',
    'รับซื้อ-imac',
    'รับซื้อ-mac-mini',
    'รับซื้อ-imac-mac-mini',
    'รับซื้อ-apple',
    'รับซื้อ-macbook-air',
    'รับซื้อ-macbook-pro',
    'รับซื้อ-macbook-m1',
    'รับซื้อ-macbook-m2',
    'รับซื้อ-macbook-m3-m4',
    'รับซื้อ-macbook-intel',
    'รับซื้อ-macbook-เสีย',
    'รับซื้อ-macbook-จอแตก',
    'รับซื้อ-ipad-pro',
    'รับซื้อ-ipad-air',
    'รับซื้อ-ipad-mini',
    'รับซื้อ-ipad-gen',
    'รับซื้อ-ipad-เสีย',
    'รับซื้อ-ipad-จอแตก',
    'รับซื้อ-iphone-pro-max',
    'รับซื้อ-iphone-17',
    'รับซื้อ-iphone-16',
    'รับซื้อ-iphone-15',
    'รับซื้อ-iphone-14',
    'รับซื้อ-iphone-13',
    'รับซื้อ-iphone-จอแตก',
    'รับซื้อ-iphone-face-id-เสีย',
    'รับซื้อ-iphone-ติด-icloud',
    'รับซื้อ-iphone-เครื่องนอก',
    'รับซื้อ-airpods',
    'รับซื้อ-apple-watch',
    'รับซื้อ-apple-pencil',
    'รับซื้อ-magic-keyboard-ipad',
  ],
  [SERVICE_CLUSTERS.SERVER_NETWORK]: [
    'รับซื้อ-server',
    'รับซื้อ-server-network',
    'รับซื้อ-storage-nas',
    'รับซื้ออุปกรณ์-network',
    'รับซื้อ-ups',
    'รับซื้อจอคอม',
  ],
  [SERVICE_CLUSTERS.CAMERA]: [
    'รับซื้อกล้อง',
    'รับซื้อเลนส์กล้อง',
    'รับซื้อกล้อง-canon',
    'รับซื้อกล้อง-sony',
    'รับซื้อกล้อง-nikon',
    'รับซื้อกล้อง-fujifilm',
    'รับซื้อกล้อง-mirrorless',
    'รับซื้อกล้องฟิล์ม',
    'รับซื้อกล้องเสีย',
    'รับซื้อ-gopro-action-camera',
    'รับซื้อโดรน',
  ],
  [SERVICE_CLUSTERS.GAMING]: [
    'รับซื้อ-gaming-pc',
    'รับซื้อคอมเกมมิ่ง',
    'รับซื้อคอมร้านเกม',
    'รับซื้อคอมสตรีมเกม',
    'รับซื้อคอมเล่นเกมสเปกแรง',
    'รับซื้อคอมสเปกสูง',
    'รับซื้อคอมประกอบ',
    'รับซื้อ-workstation',
    'รับซื้อการ์ดจอ',
    'รับซื้อ-cpu',
    'รับซื้อซีพียู',
    'รับซื้อแรม',
    'รับซื้อ-ssd',
    'รับซื้อ-ram-ssd',
    'รับซื้อเมนบอร์ด',
    'รับซื้อจอเกมมิ่ง',
    'รับซื้อโน๊ตบุ๊คเกมมิ่ง',
    'รับซื้อ-msi-notebook',
    'รับซื้อ-rog-gaming-notebook',
    'รับซื้อ-rog-strix',
    'รับซื้อ-rog-zephyrus',
    'รับซื้อ-asus-tuf-gaming',
    'รับซื้อ-lenovo-legion',
    'รับซื้อ-lenovo-loq',
    'รับซื้อ-gigabyte-gaming-notebook',
    'รับซื้อ-gigabyte-aorus',
    'รับซื้อ-gigabyte-g5-g6-g7',
    'รับซื้อ-acer-nitro',
    'รับซื้อ-acer-predator',
    'รับซื้อ-hp-victus',
    'รับซื้อ-hp-omen',
    'รับซื้อ-dell-alienware',
    'รับซื้อ-dell-g-series',
    'รับซื้อ-msi-katana',
    'รับซื้อ-msi-cyborg',
    'รับซื้อ-msi-thin',
    'รับซื้อ-msi-raider',
    'รับซื้อ-msi-vector',
    'รับซื้อ-msi-stealth',
    'รับซื้อ-msi-pulse-crosshair',
    'รับซื้อ-msi-titan',
    'รับซื้อ-msi-sword',
    'รับซื้อ-playstation',
    'รับซื้อ-nintendo-switch',
    'รับซื้อเครื่องเกม',
  ],
  [SERVICE_CLUSTERS.DESKTOP]: [
    'รับซื้อคอมพิวเตอร์ตั้งโต๊ะ',
    'รับซื้อ-desktop-pc',
    'รับซื้อ-pc-มือสอง',
    'รับซื้อคอมประกอบ',
    'รับซื้อคอมสเปกสูง',
    'รับซื้อ-gaming-pc',
    'รับซื้อคอมเกมมิ่ง',
    'รับซื้อ-workstation',
    'รับซื้อคอมบริษัท',
    'รับซื้อคอมสำนักงาน',
    'รับซื้อคอมยกล็อต',
    'รับซื้อสินค้าไอทีบริษัท',
    'รับซื้ออุปกรณ์คอมพิวเตอร์',
    'รับซื้อจอคอม',
  ],
  [SERVICE_CLUSTERS.WORKSTATION]: [
    'รับซื้อ-workstation',
    'รับซื้อคอมทำงานกราฟิก',
    'รับซื้อคอมตัดต่อวิดีโอ',
    'รับซื้อคอม-3d-render',
    'รับซื้อคอม-cad-engineer',
    'รับซื้อคอม-ai-deep-learning',
    'รับซื้อคอมสเปกสูง',
    'รับซื้อคอมประกอบ',
    'รับซื้อ-gaming-pc',
    'รับซื้อคอมเกมมิ่ง',
    'รับซื้อคอมบริษัท',
    'รับซื้อคอมยกล็อต',
    'รับซื้อสินค้าไอทีบริษัท',
  ],
  [SERVICE_CLUSTERS.GENERAL_IT]: [
    'รับซื้อสินค้าไอที',
    'รับซื้ออุปกรณ์ไอที',
    'รับซื้อมือถือ',
    'รับซื้อของไอทีเสีย',
    'รับซื้อหูฟัง',
    'รับซื้อลำโพงบลูทูธ',
    'รับซื้อ-jbl',
    'รับซื้อ-marshall',
    'รับซื้อทีวี',
  ],
};

const GENERAL_IT_HUB_SLUGS = [
  'รับซื้อสินค้าไอที',
  'รับซื้อคอมพิวเตอร์',
  'รับซื้อโน๊ตบุ๊ค',
  'รับซื้อ-iphone',
  'รับซื้อ-macbook',
  'รับซื้อ-ipad',
  'รับซื้อกล้อง',
  'รับซื้ออุปกรณ์ไอที',
];

const CLUSTER_FILL_HUB_SLUGS: Partial<Record<ServiceCluster, string[]>> = {
  [SERVICE_CLUSTERS.COM_OFFICE]: [
    'รับซื้อสินค้าไอที',
    'รับซื้อคอมพิวเตอร์',
    'รับซื้ออุปกรณ์ไอที',
  ],
  [SERVICE_CLUSTERS.NOTEBOOK]: ['รับซื้อโน๊ตบุ๊ค', 'รับซื้อสินค้าไอที'],
  [SERVICE_CLUSTERS.APPLE]: ['รับซื้อ-iphone', 'รับซื้อ-macbook', 'รับซื้อ-ipad'],
  [SERVICE_CLUSTERS.SERVER_NETWORK]: ['รับซื้อ-server', 'รับซื้อสินค้าไอที'],
  [SERVICE_CLUSTERS.CAMERA]: ['รับซื้อกล้อง', 'รับซื้อสินค้าไอที'],
  [SERVICE_CLUSTERS.GAMING]: ['รับซื้อ-gaming-pc', 'รับซื้อคอมเกมมิ่ง', 'รับซื้อคอมสเปกสูง', 'รับซื้อคอมประกอบ'],
  [SERVICE_CLUSTERS.DESKTOP]: ['รับซื้อคอมพิวเตอร์ตั้งโต๊ะ', 'รับซื้อคอมพิวเตอร์', 'รับซื้อคอมบริษัท'],
  [SERVICE_CLUSTERS.WORKSTATION]: ['รับซื้อ-workstation', 'รับซื้อคอมสเปกสูง', 'รับซื้อคอมบริษัท'],
};

const COM_OFFICE_SIDEBAR_BLOCKED = [
  'เฟอร์นิเจอร์',
  'ลำโพง',
  'หูฟัง',
  'airpods',
  'apple-watch',
  'apple-pencil',
  'เครื่องใช้ไฟฟ้า',
  'โดรน',
  'กล้อง',
  'gopro',
  'nintendo',
  'playstation',
  'ของสะสม',
  'ทีวี',
];

function isNonItGeneralCategory(text: string, slug: string): boolean {
  const nonIt = ['เฟอร์นิเจอร์', 'โซฟา', 'เครื่องใช้ไฟฟ้า', 'ลำโพง', 'หูฟัง', 'ทีวี', 'ของสะสม'];
  return (
    includesAny(slug, nonIt) ||
    (includesAny(text, nonIt) &&
      !includesAny(text, ['คอม', 'คอมพิวเตอร์', 'pc', 'printer', 'ups', 'ไอที']))
  );
}

function isRelevantForSidebar(cluster: ServiceCluster, entry: ServiceEntry): boolean {
  const slug = entry.data.slug.toLowerCase();
  const text = getClusterText(entry);

  if (cluster === SERVICE_CLUSTERS.COM_OFFICE) {
    if (COM_OFFICE_SIDEBAR_BLOCKED.some((term) => slug.includes(term.toLowerCase()))) return false;
    if (matchesApple(text, slug) || matchesCamera(text, slug)) return false;
    if (matchesGaming(text, slug) && !includesAny(slug, ['คอม'])) return false;
    if (slug === 'รับซื้อมือถือ') return false;
  }

  if (cluster === SERVICE_CLUSTERS.GAMING) {
    if (matchesApple(text, slug) || matchesCamera(text, slug)) return false;
    if (COM_OFFICE_SIDEBAR_BLOCKED.some((term) => slug.includes(term.toLowerCase()))) return false;
    if (slug === 'รับซื้อ-server' || slug.includes('server')) return false;
  }

  if (cluster === SERVICE_CLUSTERS.DESKTOP) {
    if (COM_OFFICE_SIDEBAR_BLOCKED.some((term) => slug.includes(term.toLowerCase()))) return false;
    if (matchesApple(text, slug) || matchesCamera(text, slug) || matchesServerNetwork(text, slug)) return false;
    if (matchesNotebook(text, slug)) return false;
    if (slug === 'รับซื้อมือถือ') return false;
  }

  if (cluster === SERVICE_CLUSTERS.WORKSTATION) {
    if (COM_OFFICE_SIDEBAR_BLOCKED.some((term) => slug.includes(term.toLowerCase()))) return false;
    if (matchesApple(text, slug) || matchesCamera(text, slug) || matchesServerNetwork(text, slug)) return false;
    if (matchesNotebook(text, slug)) return false;
    if (slug === 'รับซื้อมือถือ') return false;
  }

  return true;
}

function getClusterText(entry: ServiceEntry): string {
  const { slug, title, h1, mainKeyword, relatedKeywords, icon } = entry.data;
  return [slug, title, h1, mainKeyword, ...(relatedKeywords ?? []), icon]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function matchesApple(text: string, slug: string): boolean {
  const appleSlugPrefixes = [
    'รับซื้อ-iphone',
    'รับซื้อ-ipad',
    'รับซื้อ-macbook',
    'รับซื้อ-mac',
    'รับซื้อ-imac',
    'รับซื้อ-apple',
    'รับซื้อ-airpods',
    'magic-keyboard-ipad',
    'apple-pencil',
    'apple-watch',
  ];
  if (appleSlugPrefixes.some((prefix) => slug.startsWith(prefix))) return true;
  return includesAny(text, [
    'iphone',
    'ipad',
    'macbook',
    'imac',
    'mac mini',
    'mac-mini',
    'airpods',
    'apple watch',
    'apple pencil',
    'magic keyboard',
  ]);
}

function matchesCamera(text: string, slug: string): boolean {
  if (slug.includes('กล้อง') || slug.includes('เลนส์') || slug.includes('gopro') || slug.includes('โดรน')) {
    return true;
  }
  if (includesAny(text, ['mirrorless', 'gopro', 'action camera', 'action cam'])) return true;
  if (includesAny(slug, ['canon', 'nikon', 'fujifilm', 'sony']) && slug.includes('กล้อง')) return true;
  return includesAny(text, ['กล้อง', 'เลนส์', 'เลนส์กล้อง', 'โดรน']) &&
    !includesAny(text, ['หูฟัง', 'ลำโพง', 'speaker', 'headphone']);
}

function matchesGaming(text: string, slug: string): boolean {
  const gamingSlugHints = [
    'gaming',
    'เกมมิ่ง',
    'เกม',
    'rog',
    'legion',
    'loq',
    'msi',
    'katana',
    'cyborg',
    'raider',
    'vector',
    'stealth',
    'titan',
    'sword',
    'aorus',
    'gigabyte',
    'nitro',
    'predator',
    'victus',
    'omen',
    'alienware',
    'zephyrus',
    'strix',
    'tuf',
    'การ์ดจอ',
    'playstation',
    'nintendo',
    'ps5',
    'จอเกม',
    'คอมเกม',
    'ร้านเกม',
    'เครื่องเกม',
    'ซีพียู',
    'cpu',
    'แรม',
    'ssd',
    'เมนบอร์ด',
    'ram-ssd',
  ];
  if (gamingSlugHints.some((hint) => slug.includes(hint))) return true;
  return includesAny(text, [
    'gaming',
    'เกมมิ่ง',
    'เกมมิ่ง',
    'การ์ดจอ',
    'gpu',
    'playstation',
    'nintendo',
    'ps5',
    'เครื่องเกม',
    'จอเกม',
  ]);
}

function matchesServerNetwork(text: string, slug: string): boolean {
  if (includesAny(slug, ['server', 'nas', 'network', 'ups', 'printer', 'storage-nas'])) return true;
  return includesAny(text, [
    'server',
    'nas',
    'network',
    'router',
    'switch',
    'ups',
    'printer',
    'ปริ้น',
    'เซิร์ฟเวอร์',
    'เน็ตเวิร์ค',
    'สตอเรจ',
  ]);
}

function matchesComOffice(text: string, slug: string): boolean {
  if (isNonItGeneralCategory(text, slug)) return false;

  if (
    includesAny(slug, [
      'คอมสำนักงาน',
      'คอมบริษัท',
      'คอมยกล็อต',
      'คอมประกอบ',
      'คอมเสีย',
      'เคลียร์อุปกรณ์',
      'ประมูล',
      'โน๊ตบุ๊คบริษัท',
      'สินค้าไอทีบริษัท',
      'อุปกรณ์สำนักงาน',
    ])
  ) {
    return true;
  }

  if (
    includesAny(text, [
      'คอมสำนักงาน',
      'คอมออฟฟิศ',
      'คอมบริษัท',
      'คอมยกล็อต',
      'เคลียร์อุปกรณ์ไอที',
      'ประมูลคอม',
      'อุปกรณ์สำนักงาน',
      'อุปกรณ์ไอทีสำนักงาน',
    ])
  ) {
    return true;
  }

  return (
    includesAny(text, ['ออฟฟิศ', 'สำนักงาน', 'ปิดกิจการ']) &&
    includesAny(text, ['คอม', 'คอมพิวเตอร์', 'pc', 'ไอที', 'computer', 'printer', 'ups', 'network'])
  );
}

function matchesNotebook(text: string, slug: string): boolean {
  if (matchesApple(text, slug)) return false;
  if (includesAny(slug, ['โน๊ตบุ๊ค', 'notebook', 'surface', 'laptop'])) return true;
  return includesAny(text, ['โน๊ตบุ๊ค', 'notebook', 'surface', 'laptop']);
}

export function getServiceCluster(entry: ServiceEntry): ServiceCluster {
  const slug = entry.data.slug;
  if (SLUG_CLUSTER_OVERRIDES[slug]) return SLUG_CLUSTER_OVERRIDES[slug];

  const text = getClusterText(entry);
  const slugLower = slug.toLowerCase();

  if (isNonItGeneralCategory(text, slugLower)) return SERVICE_CLUSTERS.GENERAL_IT;
  if (matchesApple(text, slugLower)) return SERVICE_CLUSTERS.APPLE;
  if (matchesCamera(text, slugLower)) return SERVICE_CLUSTERS.CAMERA;
  if (matchesGaming(text, slugLower)) return SERVICE_CLUSTERS.GAMING;
  if (matchesServerNetwork(text, slugLower)) return SERVICE_CLUSTERS.SERVER_NETWORK;
  if (matchesComOffice(text, slugLower)) return SERVICE_CLUSTERS.COM_OFFICE;
  if (matchesNotebook(text, slugLower)) return SERVICE_CLUSTERS.NOTEBOOK;
  return SERVICE_CLUSTERS.GENERAL_IT;
}

function sortByClusterPriority(
  entries: ServiceEntry[],
  cluster: ServiceCluster,
): ServiceEntry[] {
  const priority = CLUSTER_PRIORITY_SLUGS[cluster];
  const rank = new Map(priority.map((slug, index) => [slug, index]));

  return [...entries].sort((a, b) => {
    const rankA = rank.get(a.data.slug) ?? 999;
    const rankB = rank.get(b.data.slug) ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return (a.data.order ?? 999) - (b.data.order ?? 999);
  });
}

export function sanitizeServiceDisplayText(text: string): string {
  return text
    .replace(/ให้ราคาสูงที่สุด/gi, 'ประเมินตามสภาพจริง')
    .replace(/ให้ราคาสูงสุด/gi, 'ประเมินตามสภาพจริง')
    .replace(/ราคาสูงสุด/gi, 'ประเมินตามสภาพจริง')
    .replace(/ให้ราคาสูง/gi, 'ประเมินฟรี')
    .replace(/ราคาสูง(?!\s*สุด)/gi, 'ประเมินตามสภาพจริง')
    .replace(/ดีที่สุด/gi, 'เหมาะ')
    .replace(/อันดับ\s*1/gi, '')
    .replace(/รับทุกรุ่นทุกสภาพ/gi, 'รับพิจารณาหลายรุ่น')
    .replace(/รับซื้อทุกชนิด/gi, 'รับซื้อหลายประเภท')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function getRelatedServicesForEntry(
  currentEntry: ServiceEntry,
  allServices: ServiceEntry[],
  limit = 12,
): ServiceEntry[] {
  const currentSlug = currentEntry.data.slug;
  const cluster = getServiceCluster(currentEntry);
  const available = allServices.filter((s) => s.data.slug !== currentSlug);

  const picked: ServiceEntry[] = [];
  const seen = new Set<string>();

  const addEntry = (entry: ServiceEntry) => {
    if (picked.length >= limit) return;
    if (seen.has(entry.data.slug)) return;
    if (!isRelevantForSidebar(cluster, entry)) return;
    seen.add(entry.data.slug);
    picked.push(entry);
  };

  const sameCluster = sortByClusterPriority(
    available.filter((s) => getServiceCluster(s) === cluster),
    cluster,
  );
  for (const entry of sameCluster) addEntry(entry);

  for (const slug of CLUSTER_PRIORITY_SLUGS[cluster]) {
    const entry = available.find((s) => s.data.slug === slug);
    if (entry) addEntry(entry);
  }

  if (picked.length < limit && cluster !== SERVICE_CLUSTERS.GENERAL_IT) {
    const fillSlugs = CLUSTER_FILL_HUB_SLUGS[cluster] ?? GENERAL_IT_HUB_SLUGS;
    for (const slug of fillSlugs) {
      const hub = available.find((s) => s.data.slug === slug);
      if (hub) addEntry(hub);
    }
  }

  if (picked.length < limit && cluster === SERVICE_CLUSTERS.GENERAL_IT) {
    const generalFill = sortByClusterPriority(
      available.filter((s) => getServiceCluster(s) === SERVICE_CLUSTERS.GENERAL_IT),
      SERVICE_CLUSTERS.GENERAL_IT,
    );
    for (const entry of generalFill) addEntry(entry);
  }

  return picked.slice(0, limit);
}
