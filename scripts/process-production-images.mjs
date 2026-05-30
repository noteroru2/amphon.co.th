/**
 * Convert user-provided PNG assets to optimized WebP files.
 * Run once after adding new source images to assets/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultAssetsDir = path.join(root, 'assets');
const assetsDir = process.env.ASSETS_DIR ?? defaultAssetsDir;
const publicDir = path.join(root, 'public', 'images');
const publicRoot = path.join(root, 'public');

/** @type {{ id: string; outputs: { path: string; width?: number; height?: number; og?: boolean; png?: boolean; rootDir?: boolean }[] }[]} */
const MAP = [
  // ── Hero images ────────────────────────────────────────────────────────────
  {
    id: 'a7ca68ff-2444-4a64-bd16-b1c8c2d1e21f',
    outputs: [
      { path: 'hero/hero-amphon-trading-rub-sue-it-isan.webp', width: 1400 },
      { path: 'og/og-home.webp', og: true },
      { path: 'og/og-service-it.webp', og: true },
    ],
  },
  {
    // NEW: showroom hero (uploaded 30 May 2026 17:12)
    id: 'dcc3414c-163f-44e5-956e-5e2fb6b98c19',
    outputs: [
      { path: 'hero/hero-amphon-showroom-rub-sue-it-isan.webp', width: 1400 },
    ],
  },
  {
    id: 'a1a59539-7491-459d-ade7-7f8e1925f738',
    outputs: [{ path: 'hero/hero-amphon-storefront-ubon-banner.webp', width: 1400 }],
  },
  {
    id: 'a9b36a0a-7357-4465-8b99-4ff9feff9c73',
    outputs: [{ path: 'hero/hero-amphon-trading-map-isan.webp', width: 1400 }],
  },

  // ── Service images ──────────────────────────────────────────────────────────
  {
    id: 'a0d566d9-04ac-4993-9142-a6ec9bbdf45e',
    outputs: [
      { path: 'services/rub-sue-iphone-amphon-trading-banner.webp', width: 1200 },
      { path: 'og/og-service-iphone.webp', og: true },
    ],
  },
  {
    id: '19c395d0-a6ff-480c-bffc-99cf6f1f9469',
    outputs: [{ path: 'services/rub-sue-iphone-tur-ruen-rap-raka-sung.webp', width: 1200 }],
  },
  {
    id: '09d33812-7a8b-4ab9-9d73-23f3e5126496',
    outputs: [
      { path: 'services/rub-sue-macbook-amphon-trading-banner.webp', width: 1200 },
      { path: 'og/og-service-macbook.webp', og: true },
    ],
  },
  {
    id: '65420f71-895e-446e-b6f1-79435352e603',
    outputs: [
      { path: 'services/rub-sue-notebook-amphon-trading-banner.webp', width: 1200 },
      { path: 'og/og-service-notebook.webp', og: true },
    ],
  },
  {
    id: '60a3510f-d87a-4578-a838-1ba78a36dfbe',
    outputs: [{ path: 'services/rub-sue-notebook-laptops-acer-asus.webp', width: 1200 }],
  },
  {
    id: '244b7a5b-8230-4a9a-b2f9-ca39ea732611',
    outputs: [{ path: 'services/rub-sue-ipad-amphon-trading.webp', width: 1200 }],
  },
  {
    // NEW: Gaming PC image (uploaded 30 May 2026 14:38) — replaces old iPhone-lineup file
    id: '8022c3b1-c1e5-4b62-b3dd-26fe7c3a47df',
    outputs: [{ path: 'services/rub-sue-komputer-gaming-pc-amphon.webp', width: 1200 }],
  },
  {
    // NEW: Fujifilm X-A2 camera image (uploaded 30 May 2026 15:20) — replaces old storefront file
    id: '729a4ba0-d367-4f80-ac62-358c1d8b7be8',
    outputs: [{ path: 'services/rub-sue-khong-fujifilm-x-a2-amphon.webp', width: 1200 }],
  },

  // ── About / shop images ─────────────────────────────────────────────────────
  {
    id: 'd00f3174-02bb-4380-be01-c6e8c714358e',
    outputs: [
      { path: 'about/amphon-trading-storefront-ubon.webp', width: 1200 },
      { path: 'og/og-area-ubon.webp', og: true },
    ],
  },
  {
    id: '7d1a6d34-3804-4668-9da9-4d17d13fd65e',
    outputs: [{ path: 'about/amphon-trading-shop-showroom.webp', width: 1200 }],
  },
  {
    id: '29280164-7715-4bc2-bdbe-fd8e4320dd34',
    outputs: [{ path: 'about/amphon-trading-shop-interior-evaluation.webp', width: 1200 }],
  },
  {
    id: '23da100f-0b2b-47ab-b586-126e2bfb9f62',
    outputs: [{ path: 'about/amphon-trading-shop-transaction.webp', width: 1200 }],
  },

  // ── Blog images ─────────────────────────────────────────────────────────────
  {
    id: 'e2219174-7c99-42b3-9e4a-56a271b6d0e3',
    outputs: [
      { path: 'blog/khai-macbook-musong-rap-raka-dee-amphon.webp', width: 1200 },
      { path: 'og/blog/khai-macbook-musong-rap-raka-dee.webp', og: true },
    ],
  },
  {
    id: 'b33f39ba-f34e-414d-b3f4-90e8c6d00342',
    outputs: [
      { path: 'blog/khai-iphone-musong-teiyam-ari-bang-amphon.webp', width: 1200 },
      { path: 'og/blog/khai-iphone-musong-teiyam-ari-bang.webp', og: true },
    ],
  },

  // ── Brand / logo ────────────────────────────────────────────────────────────
  {
    // NEW: Horizontal AMPHON TRADING logo (uploaded 30 May 2026 17:31)
    // Replaces old df588bab logo that was wrongly sized/mapped
    id: '4426ecc2-97f5-4ffc-b8d0-d27354411abe',
    outputs: [
      { path: 'brand/amphon-trading-logo.webp', width: 280 },
      { path: 'brand/amphon-trading-logo-footer.webp', width: 220 },
    ],
  },
  {
    // NEW: Square AMPHON icon (uploaded 30 May 2026 17:32) — for favicons / PWA
    id: '3477f04c-4975-449f-a740-cfb05a0829c7',
    outputs: [
      { path: 'brand/amphon-icon.webp', width: 256, height: 256 },
    ],
  },
];

function findSource(id) {
  const files = fs.readdirSync(assetsDir);
  const match = files.find((f) => f.includes(id));
  if (!match) throw new Error(`Source not found for id: ${id}`);
  return path.join(assetsDir, match);
}

async function writeWebp(src, dest, { width, height, og = false }) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let pipeline = sharp(src);

  if (og) {
    pipeline = pipeline.resize(1200, 630, { fit: 'cover', position: 'centre' });
  } else if (width || height) {
    pipeline = pipeline.resize(width, height, { fit: 'inside', withoutEnlargement: false });
  }

  await pipeline.webp({ quality: 88, effort: 4 }).toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(`✓ ${path.relative(publicDir, dest)} (${meta.width}×${meta.height})`);
}

async function writePng(src, dest, size, white = true) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .resize(size, size, {
      fit: 'contain',
      background: white ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  console.log(`✓ ${path.relative(publicRoot, dest)} (${size}×${size} PNG)`);
}

if (!fs.existsSync(assetsDir)) {
  console.log(`⊘ Assets directory not found: ${assetsDir}`);
  console.log('  Skipping image processing — using committed files in public/');
  console.log('  To regenerate locally: add PNGs to assets/ and run npm run images:process');
  process.exit(0);
}

console.log(`Processing ${MAP.length} source images...\n`);

for (const item of MAP) {
  const src = findSource(item.id);
  for (const out of item.outputs) {
    const dest = path.join(publicDir, out.path);
    await writeWebp(src, dest, out);
  }
}

// og-area-khonkaen from general hero (reuse isan hero crop)
const khonkaenSrc = findSource('a7ca68ff-2444-4a64-bd16-b1c8c2d1e21f');
await writeWebp(khonkaenSrc, path.join(publicDir, 'og/og-area-khonkaen.webp'), { og: true });
console.log('✓ og/og-area-khonkaen.webp (1200×630)');

// og-blog-default from shop transaction photo
const blogDefaultSrc = findSource('23da100f-0b2b-47ab-b586-126e2bfb9f62');
await writeWebp(blogDefaultSrc, path.join(publicDir, 'og/og-blog-default.webp'), { og: true });
console.log('✓ og/og-blog-default.webp (1200×630)');

// Favicon PNGs from the new icon source
const iconSrc = findSource('3477f04c-4975-449f-a740-cfb05a0829c7');
await writePng(iconSrc, path.join(publicRoot, 'favicon-32x32.png'), 32);
await writePng(iconSrc, path.join(publicRoot, 'favicon-48x48.png'), 48);
await writePng(iconSrc, path.join(publicRoot, 'apple-touch-icon.png'), 180);
await writePng(iconSrc, path.join(publicRoot, 'icon-192.png'), 192);
await writePng(iconSrc, path.join(publicRoot, 'icon-512.png'), 512);
// Also overwrite favicon.ico with the 32x32 PNG
fs.copyFileSync(path.join(publicRoot, 'favicon-32x32.png'), path.join(publicRoot, 'favicon.ico'));
console.log('✓ favicon.ico (copied from favicon-32x32.png)');

console.log('\nDone.');
