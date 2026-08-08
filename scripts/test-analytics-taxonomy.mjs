/**
 * Extra analytics validation for R9B (taxonomy + no generate_lead in source).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAnalyticsContext } from '../src/lib/analytics-context.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const cases = [
  ['/', 'home', 'multi_service', 'national'],
  ['/บริการ/รับซื้อโทรศัพท์มือสอง', 'service_national', 'phone', 'national'],
  ['/บริการ/รับซื้อ-iphone', 'service_brand', 'iphone', 'national'],
  ['/บริการ/รับซื้อแท็บเล็ต', 'service_national', 'tablet', 'national'],
  ['/บริการ/รับซื้อ-ipad', 'service_brand', 'ipad', 'national'],
  ['/บริการ/รับซื้อโน๊ตบุ๊ค', 'service_national', 'notebook', 'national'],
  ['/บริการ/รับซื้อ-macbook', 'service_brand', 'macbook', 'national'],
  ['/บริการ/รับซื้อคอมพิวเตอร์', 'service_national', 'computer', 'national'],
  ['/บริการ/รับซื้อ-gaming-pc', 'service_specialist', 'gaming_pc', 'national'],
  ['/บริการ/รับซื้อแรม', 'service_specialist', 'ram', 'national'],
  ['/บริการ/รับซื้อสินค้าไอทีบริษัท', 'corporate_parent', 'corporate_it', 'national'],
  ['/บริการ/รับซื้อคอมยกล็อต', 'bulk_service', 'bulk_computer', 'national'],
  ['/บริการ/รับซื้อ-server-network', 'service_specialist', 'server_network', 'national'],
  ['/พื้นที่ให้บริการ/ภูเก็ต', 'area_hub', 'multi_service', 'ภูเก็ต'],
  ['/พื้นที่ให้บริการ/หาดใหญ่', 'city_hub', 'multi_service', 'สงขลา'],
  ['/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น', 'service_local', 'notebook', 'ขอนแก่น'],
];

let failed = 0;
for (const [pathname, pageType, serviceCategory, province] of cases) {
  const ctx = resolveAnalyticsContext(pathname);
  const ok =
    ctx.page_type === pageType &&
    ctx.service_category === serviceCategory &&
    ctx.province === province;
  if (!ok) {
    failed += 1;
    console.error('FAIL', pathname, ctx, 'expected', { pageType, serviceCategory, province });
  } else {
    console.log('OK', pathname);
  }
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
      walk(p, acc);
    } else if (/\.(ts|astro|js|mjs)$/.test(name)) acc.push(p);
  }
  return acc;
}

const srcFiles = walk(path.join(ROOT, 'src'));
let generateLeadHits = 0;
for (const file of srcFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (/generate_lead|lead_details_completed|deal_agreed|closed_sale/.test(text)) {
    // allow mentions in comments/docs strings inside tests denying the event
    if (file.includes('analytics-context.test.ts') || file.includes('test-analytics')) continue;
    if (/isAllowedAnalyticsEvent\('generate_lead'\)/.test(text)) continue;
    generateLeadHits += 1;
    console.error('Forbidden event mention:', path.relative(ROOT, file));
  }
}

if (failed || generateLeadHits) {
  console.error(`FAILED taxonomy=${failed} forbidden=${generateLeadHits}`);
  process.exit(1);
}
console.log('analytics validation PASS');
