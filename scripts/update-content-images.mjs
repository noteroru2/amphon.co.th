/**
 * Update content frontmatter heroImage/ogImage paths to production WebP assets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content');

const updates = {
  'services/รับซื้อ-iphone.md': {
    heroImage: '/images/services/rub-sue-iphone-tur-ruen-rap-raka-sung.webp',
    ogImage: '/images/og/og-service-iphone.webp',
  },
  'services/รับซื้อ-macbook.md': {
    heroImage: '/images/blog/khai-macbook-musong-rap-raka-dee-amphon.webp',
    ogImage: '/images/og/og-service-macbook.webp',
  },
  'services/รับซื้อโน๊ตบุ๊ค.md': {
    heroImage: '/images/services/rub-sue-notebook-laptops-acer-asus.webp',
    ogImage: '/images/og/og-service-notebook.webp',
  },
  'services/รับซื้อ-ipad.md': {
    heroImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
    ogImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
  },
  'services/รับซื้อคอมพิวเตอร์.md': {
    heroImage: '/images/services/rub-sue-komputer-gaming-pc-amphon.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'services/รับซื้อกล้อง.md': {
    heroImage: '/images/services/rub-sue-khong-fujifilm-x-a2-amphon.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'services/รับซื้อคอมบริษัท.md': {
    heroImage: '/images/about/amphon-trading-shop-interior-evaluation.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'services/รับซื้อสินค้าไอที.md': {
    heroImage: '/images/hero/hero-amphon-trading-rub-sue-it-isan.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'areas/อุบลราชธานี.md': {
    heroImage: '/images/about/amphon-trading-storefront-ubon.webp',
    ogImage: '/images/og/og-area-ubon.webp',
  },
  'areas/ขอนแก่น.md': {
    heroImage: '/images/hero/hero-amphon-trading-map-isan.webp',
    ogImage: '/images/og/og-area-khonkaen.webp',
  },
  'areas/นครราชสีมา.md': {
    heroImage: '/images/about/amphon-trading-shop-transaction.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'areas/อุดรธานี.md': {
    heroImage: '/images/about/amphon-trading-shop-showroom.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'areas/ศรีสะเกษ.md': {
    heroImage: '/images/about/amphon-trading-storefront-ubon.webp',
    ogImage: '/images/og/og-area-ubon.webp',
  },
  'areas/ยโสธร.md': {
    heroImage: '/images/hero/hero-amphon-trading-map-isan.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'areas/บุรีรัมย์.md': {
    heroImage: '/images/hero/hero-amphon-trading-map-isan.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'areas/ร้อยเอ็ด.md': {
    heroImage: '/images/about/amphon-trading-shop-interior-evaluation.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'blog/ขาย-iphone-มือสอง-ต้องเตรียมอะไรบ้าง.md': {
    heroImage: '/images/blog/khai-iphone-musong-teiyam-ari-bang-amphon.webp',
    ogImage: '/images/og/blog/khai-iphone-musong-teiyam-ari-bang.webp',
  },
  'blog/ขาย-macbook-มือสอง-อย่างไรให้ได้ราคาดี.md': {
    heroImage: '/images/blog/khai-macbook-musong-rap-raka-dee-amphon.webp',
    ogImage: '/images/og/blog/khai-macbook-musong-rap-raka-dee.webp',
  },
  'blog/วิธีเช็กราคาก่อนขายโน๊ตบุ๊คมือสอง.md': {
    heroImage: '/images/services/rub-sue-notebook-laptops-acer-asus.webp',
    ogImage: '/images/og/og-service-notebook.webp',
  },
  'blog/วิธีเตรียมเครื่องก่อนขายสินค้าไอที.md': {
    heroImage: '/images/about/amphon-trading-shop-interior-evaluation.webp',
    ogImage: '/images/og/og-blog-default.webp',
  },
  'blog/โน๊ตบุ๊คเสีย-ขายได้ไหม.md': {
    heroImage: '/images/services/rub-sue-notebook-laptops-acer-asus.webp',
    ogImage: '/images/og/og-service-notebook.webp',
  },
  'blog/คอมบริษัทเก่า-ขายยังไง.md': {
    heroImage: '/images/about/amphon-trading-shop-interior-evaluation.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
  'blog/ipad-ติด-icloud-ขายได้ไหม.md': {
    heroImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
    ogImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
  },
  'blog/รับซื้อสินค้าไอทีถึงที่-ปลอดภัยไหม.md': {
    heroImage: '/images/about/amphon-trading-shop-transaction.webp',
    ogImage: '/images/og/og-blog-default.webp',
  },
};

const serviceAreaDefaults = {
  iphone: {
    heroImage: '/images/services/rub-sue-iphone-tur-ruen-rap-raka-sung.webp',
    ogImage: '/images/og/og-service-iphone.webp',
  },
  macbook: {
    heroImage: '/images/blog/khai-macbook-musong-rap-raka-dee-amphon.webp',
    ogImage: '/images/og/og-service-macbook.webp',
  },
  notebook: {
    heroImage: '/images/services/rub-sue-notebook-laptops-acer-asus.webp',
    ogImage: '/images/og/og-service-notebook.webp',
  },
  ipad: {
    heroImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
    ogImage: '/images/services/rub-sue-ipad-amphon-trading.webp',
  },
  komborisat: {
    heroImage: '/images/about/amphon-trading-shop-interior-evaluation.webp',
    ogImage: '/images/og/og-service-it.webp',
  },
};

function patchFrontmatter(filePath, fields) {
  let raw = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(fields)) {
    const re = new RegExp(`^${key}:\\s*.+$`, 'm');
    if (re.test(raw)) {
      raw = raw.replace(re, `${key}: ${value}`);
    }
  }
  fs.writeFileSync(filePath, raw, 'utf8');
  console.log(`✓ ${path.relative(contentDir, filePath)}`);
}

for (const [rel, fields] of Object.entries(updates)) {
  patchFrontmatter(path.join(contentDir, rel), fields);
}

const saDir = path.join(contentDir, 'serviceAreas');
for (const file of fs.readdirSync(saDir).filter((f) => f.endsWith('.md'))) {
  let fields = serviceAreaDefaults.komborisat;
  if (file.includes('iphone')) fields = serviceAreaDefaults.iphone;
  else if (file.includes('macbook')) fields = serviceAreaDefaults.macbook;
  else if (file.includes('โน๊ตบุ๊ค')) fields = serviceAreaDefaults.notebook;
  else if (file.includes('ipad')) fields = serviceAreaDefaults.ipad;
  patchFrontmatter(path.join(saDir, file), fields);
}

console.log('\nFrontmatter updated.');
