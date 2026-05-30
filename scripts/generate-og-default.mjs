/**
 * Generate default OG image (1200×630 WebP) for pages without custom ogImage.
 * Run: node scripts/generate-og-default.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'public', 'images', 'og-default.webp');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Amphon.co.th">
  <rect width="1200" height="630" fill="#111827"/>
  <rect x="0" y="520" width="1200" height="110" fill="#f97316"/>
  <text x="600" y="260" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="72" font-weight="700">Amphon.co.th</text>
  <text x="600" y="340" text-anchor="middle" fill="#e5e7eb" font-family="system-ui,sans-serif" font-size="36">รับซื้อสินค้าไอที ภาคอีสาน</text>
  <text x="600" y="580" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="24" font-weight="600">โน๊ตบุ๊ค · iPhone · MacBook · คอมพิวเตอร์</text>
</svg>`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .webp({ quality: 85 })
  .toFile(outPath);

console.log(`✓ Generated ${outPath} (1200×630 WebP)`);
