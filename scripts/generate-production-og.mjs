/**
 * Generate production OG images (1200×630 WebP).
 * Run: node scripts/generate-production-og.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'images', 'og');

const BRAND = 'Amphon.co.th · อำพล เทรดดิ้ง';

const images = [
  {
    file: 'og-home.webp',
    accent: '#f97316',
    title: 'รับซื้อสินค้าไอที',
    subtitle: 'ภาคอีสาน · ประเมินฟรี จ่ายทันที',
    tag: 'หน้าแรก',
  },
  {
    file: 'og-service-it.webp',
    accent: '#2563eb',
    title: 'รับซื้อสินค้าไอที',
    subtitle: 'โน๊ตบุ๊ค · มือถือ · คอม · กล้อง',
    tag: 'บริการ',
  },
  {
    file: 'og-service-notebook.webp',
    accent: '#7c3aed',
    title: 'รับซื้อโน๊ตบุ๊ค',
    subtitle: 'ทุกยี่ห้อ ทุกสภาพ ราคาดี',
    tag: 'บริการ',
  },
  {
    file: 'og-service-iphone.webp',
    accent: '#059669',
    title: 'รับซื้อ iPhone',
    subtitle: 'ทุกรุ่น ประเมินฟรี จ่ายสด',
    tag: 'บริการ',
  },
  {
    file: 'og-service-macbook.webp',
    accent: '#64748b',
    title: 'รับซื้อ MacBook',
    subtitle: 'Air · Pro · ทุกชิป Apple',
    tag: 'บริการ',
  },
  {
    file: 'og-area-ubon.webp',
    accent: '#ea580c',
    title: 'รับซื้อสินค้าไอที',
    subtitle: 'อุบลราชธานี · นัดรับถึงที่',
    tag: 'พื้นที่ให้บริการ',
  },
  {
    file: 'og-area-khonkaen.webp',
    accent: '#0d9488',
    title: 'รับซื้อสินค้าไอที',
    subtitle: 'ขอนแก่น · นัดรับถึงที่',
    tag: 'พื้นที่ให้บริการ',
  },
  {
    file: 'og-blog-default.webp',
    accent: '#9333ea',
    title: 'บทความ Amphon',
    subtitle: 'เคล็ดลับขายสินค้าไอทีมือสอง',
    tag: 'บทความ',
  },
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createSvg({ accent, title, subtitle, tag }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="8" fill="${accent}"/>
  <rect x="0" y="522" width="1200" height="108" fill="${accent}"/>
  <text x="600" y="72" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="26" font-weight="600">${escapeXml(tag)}</text>
  <text x="600" y="280" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="64" font-weight="700">${escapeXml(title)}</text>
  <text x="600" y="360" text-anchor="middle" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="34">${escapeXml(subtitle)}</text>
  <text x="600" y="582" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="22" font-weight="600">${escapeXml(BRAND)}</text>
</svg>`;
}

/** Real photo OG images — managed by scripts/process-production-images.mjs */
const REAL_PHOTO_OG = new Set([
  'og-home.webp',
  'og-service-it.webp',
  'og-service-notebook.webp',
  'og-service-iphone.webp',
  'og-service-macbook.webp',
  'og-area-ubon.webp',
  'og-area-khonkaen.webp',
  'og-blog-default.webp',
]);

fs.mkdirSync(outDir, { recursive: true });

let generated = 0;
for (const img of images) {
  if (REAL_PHOTO_OG.has(img.file)) {
    console.log(`⊘ ${img.file} — keep real photo OG`);
    continue;
  }
  const outPath = path.join(outDir, img.file);
  await sharp(Buffer.from(createSvg(img)))
    .resize(1200, 630)
    .webp({ quality: 88 })
    .toFile(outPath);
  console.log(`✓ ${img.file}`);
  generated++;
}

console.log(`\nGenerated ${generated} SVG OG images (${REAL_PHOTO_OG.size} real-photo OG skipped).`);
