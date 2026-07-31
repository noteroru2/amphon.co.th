/**
 * Batch 1 helper: rebuild vercel.json redirects for F-01 Thai legacy URLs.
 * Adds percent-encoded pairs and expands :province patterns to explicit rules.
 * Run: node scripts/generate-batch-1-redirects.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const vercelPath = path.join(repoRoot, 'vercel.json');
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

const encodePath = (pathname) =>
  pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : ''))
    .join('/');

const permanent = (source, destination) => ({ source, destination, permanent: true });

const provinces = fs
  .readdirSync(path.join(repoRoot, 'src/content/serviceAreas'))
  .filter((file) => file.startsWith('รับซื้อ-ssd-') && file.endsWith('.md'))
  .map((file) => file.replace(/^รับซื้อ-ssd-/, '').replace(/\.md$/, ''))
  .sort((a, b) => a.localeCompare(b, 'th'));

if (provinces.length !== 20) {
  throw new Error(`Expected 20 SSD province pages, found ${provinces.length}`);
}

for (const province of provinces) {
  if (!fs.existsSync(path.join(repoRoot, 'src/content/serviceAreas', `รับซื้อ-ssd-${province}.md`))) {
    throw new Error(`Missing destination serviceArea for province: ${province}`);
  }
}

const destinationChecks = [
  'src/content/services/รับซื้อ-ssd.md',
  'src/content/services/รับซื้อ-gopro-action-camera.md',
  'src/content/services/รับซื้อเลนส์กล้อง.md',
  'src/content/services/รับซื้อ-nas.md',
  'src/pages/รับซื้อสินค้าไอที.astro',
];

for (const file of destinationChecks) {
  if (!fs.existsSync(path.join(repoRoot, file))) {
    throw new Error(`Missing destination file: ${file}`);
  }
}

/** Working rules already verified on production (keep unchanged). */
const keepWorking = [
  permanent('/บริการ/รับซื้อ-gopro', '/บริการ/รับซื้อ-gopro-action-camera'),
  permanent(encodePath('/บริการ/รับซื้อ-gopro'), '/บริการ/รับซื้อ-gopro-action-camera'),
  permanent('/blog/how-to-reset-playstation', '/blog'),
  permanent('/blog/check-nintendo-joycon', '/blog'),
  permanent('/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด/', '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด'),
  permanent('/บริการ/รับซื้อเลนส์', '/บริการ/รับซื้อเลนส์กล้อง'),
  permanent(encodePath('/บริการ/รับซื้อเลนส์'), '/บริการ/รับซื้อเลนส์กล้อง'),
  permanent('/บริการ/รับซื้อ-hdd', '/บริการ/รับซื้อ-ssd'),
  permanent(encodePath('/บริการ/รับซื้อ-hdd'), '/บริการ/รับซื้อ-ssd'),
  permanent('/บริการ/รับซื้อ-storage-nas', '/บริการ/รับซื้อ-nas'),
  permanent(encodePath('/บริการ/รับซื้อ-storage-nas'), '/บริการ/รับซื้อ-nas'),
];

/** F-01 exact rules that lacked percent-encoded pairs. */
const f01Exact = [
  permanent('/รับซื้อ/รับซื้อ-hdd', '/บริการ/รับซื้อ-ssd'),
  permanent(encodePath('/รับซื้อ/รับซื้อ-hdd'), '/บริการ/รับซื้อ-ssd'),
  permanent('/รับซื้อ/รับซื้อ-gopro', '/บริการ/รับซื้อ-gopro-action-camera'),
  permanent(encodePath('/รับซื้อ/รับซื้อ-gopro'), '/บริการ/รับซื้อ-gopro-action-camera'),
  permanent('/รับซื้อ/รับซื้อเลนส์', '/บริการ/รับซื้อเลนส์กล้อง'),
  permanent(encodePath('/รับซื้อ/รับซื้อเลนส์'), '/บริการ/รับซื้อเลนส์กล้อง'),
  permanent('/รับซื้อ/รับซื้อ-storage-nas', '/บริการ/รับซื้อ-nas'),
  permanent(encodePath('/รับซื้อ/รับซื้อ-storage-nas'), '/บริการ/รับซื้อ-nas'),
  permanent('/รับซื้อ', '/รับซื้อสินค้าไอที'),
  permanent(encodePath('/รับซื้อ'), '/รับซื้อสินค้าไอที'),
  permanent('/บริการ/รับซื้อสินค้าไอที', '/รับซื้อสินค้าไอที'),
  permanent(encodePath('/บริการ/รับซื้อสินค้าไอที'), '/รับซื้อสินค้าไอที'),
];

/** Expand :province patterns into explicit unicode + encoded rules. */
const f01Province = [];
for (const province of provinces) {
  const unicodeHdd = `/รับซื้อ/รับซื้อ-hdd-${province}`;
  const unicodeGopro = `/รับซื้อ/รับซื้อ-gopro-${province}`;
  const unicodeLens = `/รับซื้อ/รับซื้อเลนส์-${province}`;
  const unicodeNas = `/รับซื้อ/รับซื้อ-storage-nas-${province}`;

  f01Province.push(
    permanent(unicodeHdd, `/รับซื้อ/รับซื้อ-ssd-${province}`),
    permanent(encodePath(unicodeHdd), `/รับซื้อ/รับซื้อ-ssd-${province}`),
    permanent(unicodeGopro, '/บริการ/รับซื้อ-gopro-action-camera'),
    permanent(encodePath(unicodeGopro), '/บริการ/รับซื้อ-gopro-action-camera'),
    permanent(unicodeLens, '/บริการ/รับซื้อเลนส์กล้อง'),
    permanent(encodePath(unicodeLens), '/บริการ/รับซื้อเลนส์กล้อง'),
    permanent(unicodeNas, '/บริการ/รับซื้อ-nas'),
    permanent(encodePath(unicodeNas), '/บริการ/รับซื้อ-nas'),
  );
}

const trailingSlash = permanent('/:path+/', '/:path+');

const redirects = [...keepWorking, ...f01Exact, ...f01Province, trailingSlash];

const sources = redirects.map((rule) => rule.source);
const duplicateSources = sources.filter((source, index) => sources.indexOf(source) !== index);
if (duplicateSources.length) {
  throw new Error(`Duplicate redirect sources: ${[...new Set(duplicateSources)].join(', ')}`);
}

vercel.redirects = redirects;
fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');

console.log(
  JSON.stringify(
    {
      provinces: provinces.length,
      totalRedirectRules: redirects.length,
      keepWorking: keepWorking.length,
      f01Exact: f01Exact.length,
      f01Province: f01Province.length,
      trailingSlash: 1,
    },
    null,
    2,
  ),
);
