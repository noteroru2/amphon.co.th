import { loadRedirects, resolveRedirectChain } from './lib/site-audit.mjs';

const redirects = loadRedirects();
const samplePaths = [
  '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด/',
  '/บริการ/รับซื้อ-gopro',
  '/บริการ/รับซื้อเลนส์',
  '/บริการ/รับซื้อ-hdd',
  '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
  '/รับซื้อ/รับซื้อ-hdd-อุบลราชธานี',
  '/รับซื้อ/รับซื้อ-gopro-อุบลราชธานี',
  '/รับซื้อ/รับซื้อเลนส์-อุบลราชธานี',
  '/รับซื้อ/รับซื้อ-storage-nas-อุบลราชธานี',
];

const issues = [];

for (const samplePath of samplePaths) {
  const result = resolveRedirectChain(samplePath, redirects);

  if (result.loop) {
    issues.push(`loop detected for ${samplePath}`);
    continue;
  }

  if (result.chain.length > 1) {
    issues.push(`redirect chain ${samplePath} -> ${result.chain.map((step) => step.destination).join(' -> ')}`);
  }

  if (result.finalPath.length > 1 && result.finalPath.endsWith('/')) {
    issues.push(`non-canonical trailing slash destination for ${samplePath}: ${result.finalPath}`);
  }
}

if (issues.length === 0) {
  console.log(`PASS redirects: checked ${samplePaths.length} sample path(s), no loops or chains found`);
  process.exit(0);
}

console.error(`FAIL redirects: ${issues.length} issue(s) found`);
for (const issue of issues) {
  console.error(`- ${issue}`);
}
process.exit(1);
