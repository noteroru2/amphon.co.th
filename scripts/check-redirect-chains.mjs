import { loadRedirects, resolveRedirectChain } from './lib/site-audit.mjs';

const redirects = loadRedirects();
const samplePaths = [
  {
    source: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด/',
    expectedFinal: '/บริการ/รับซื้อโน๊ตบุ๊คเปิดไม่ติด',
  },
  {
    source: '/บริการ/รับซื้อ-gopro',
    expectedFinal: '/บริการ/รับซื้อ-gopro-action-camera',
  },
  {
    source: '/บริการ/รับซื้อเลนส์',
    expectedFinal: '/บริการ/รับซื้อเลนส์กล้อง',
  },
  {
    source: '/บริการ/รับซื้อ-hdd',
    expectedFinal: '/บริการ/รับซื้อ-ssd',
  },
  {
    source: '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
    expectedFinal: '/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
  },
  {
    source: '/บริการ/รับซื้อ-storage-nas',
    expectedFinal: '/บริการ/รับซื้อ-nas',
  },
  {
    source: '/รับซื้อ/รับซื้อ-hdd-อุบลราชธานี',
    expectedFinal: '/รับซื้อ/รับซื้อ-ssd-อุบลราชธานี',
  },
  {
    source: '/รับซื้อ/รับซื้อ-gopro-อุบลราชธานี',
    expectedFinal: '/บริการ/รับซื้อ-gopro-action-camera',
  },
  {
    source: '/รับซื้อ/รับซื้อเลนส์-อุบลราชธานี',
    expectedFinal: '/บริการ/รับซื้อเลนส์กล้อง',
  },
  {
    source: '/รับซื้อ/รับซื้อ-storage-nas-อุบลราชธานี',
    expectedFinal: '/บริการ/รับซื้อ-nas',
  },
];

const issues = [];

for (const sample of samplePaths) {
  const result = resolveRedirectChain(sample.source, redirects);

  if (result.loop) {
    issues.push(`loop detected for ${sample.source}`);
    continue;
  }

  if (result.chain.length > 1) {
    issues.push(`redirect chain ${sample.source} -> ${result.chain.map((step) => step.destination).join(' -> ')}`);
  }

  if (result.finalPath.length > 1 && result.finalPath.endsWith('/')) {
    issues.push(`non-canonical trailing slash destination for ${sample.source}: ${result.finalPath}`);
  }

  if (result.finalPath !== sample.expectedFinal) {
    issues.push(`wrong final destination for ${sample.source}: ${result.finalPath} != ${sample.expectedFinal}`);
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
