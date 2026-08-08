/**
 * R9B.1 Preview HTML checks via `vercel curl` (bypasses Deployment Protection).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveAnalyticsContext } from '../src/lib/analytics-context.ts';

const DEPLOYMENT = 'amphon-co-r5j4gw9hq-amphons-projects-bb1ec3bf.vercel.app';
const SCOPE = 'amphons-projects-bb1ec3bf';

const pages = [
  '/',
  '/privacy-policy',
  '/บริการ/รับซื้อโทรศัพท์มือสอง',
  '/บริการ/รับซื้อ-iphone',
  '/บริการ/รับซื้อโน๊ตบุ๊ค',
  '/บริการ/รับซื้อคอมพิวเตอร์',
  '/บริการ/รับซื้อ-gaming-pc',
  '/บริการ/รับซื้อแรม',
  '/บริการ/รับซื้อสินค้าไอทีบริษัท',
  '/บริการ/รับซื้อคอมยกล็อต',
  '/บริการ/รับซื้อ-server-network',
  '/พื้นที่ให้บริการ/ภูเก็ต',
  '/พื้นที่ให้บริการ/หาดใหญ่',
  '/รับซื้อ/รับซื้อโน๊ตบุ๊ค-ขอนแก่น',
];

function vercelCurl(pathname) {
  const out = path.join(os.tmpdir(), `r9b1-${Buffer.from(pathname).toString('hex').slice(0, 24)}.html`);
  const r = spawnSync(
    'npx',
    ['--yes', 'vercel@latest', 'curl', pathname, '--deployment', DEPLOYMENT, '--scope', SCOPE, '-o', out],
    { encoding: 'utf8', shell: true },
  );
  if (r.status !== 0) {
    throw new Error(`vercel curl failed for ${pathname}: ${r.stderr || r.stdout}`);
  }
  return fs.readFileSync(out, 'utf8');
}

let failed = 0;
for (const pathname of pages) {
  const html = vercelCurl(pathname);
  const expected = resolveAnalyticsContext(pathname);
  const pageType = html.match(/data-page-type="([^"]+)"/)?.[1];
  const service = html.match(/data-service-category="([^"]+)"/)?.[1];
  const province = html.match(/data-province="([^"]+)"/)?.[1];
  const consent = /id="analytics-consent"/.test(html);
  const revisit = /data-consent-revisit/.test(html);
  const gaScript = /googletagmanager\.com\/gtag\/js|gtag\/js\?id=G-/.test(html);
  const measurementInBoot = /"measurementId":\s*"G-[^"]+"/.test(html) || /measurementId:\s*"G-/.test(html);
  const auth = /Authentication Required|Vercel Authentication/.test(html);

  const checks = [];
  if (auth) checks.push('AUTH_WALL');
  if (!consent) checks.push('MISSING_CONSENT_UI');
  if (!revisit && pathname !== '/privacy-policy') {
    // footer should exist on BaseLayout pages
    if (!/ตั้งค่าคุกกี้/.test(html)) checks.push('MISSING_COOKIE_SETTINGS');
  }
  if (gaScript) checks.push('GA_SCRIPT_PRESENT_WITHOUT_CONSENT_RUNTIME');
  if (measurementInBoot) checks.push('MEASUREMENT_ID_BAKED_IN_HTML');
  if (pageType !== expected.page_type) checks.push(`page_type=${pageType}!=${expected.page_type}`);
  if (service !== expected.service_category) checks.push(`service=${service}!=${expected.service_category}`);
  if (province !== expected.province) checks.push(`province=${province}!=${expected.province}`);
  if (pathname === '/privacy-policy' && !/การวิเคราะห์การใช้งานเว็บไซต์/.test(html)) {
    checks.push('PRIVACY_ANALYTICS_SECTION_MISSING');
  }
  if (pathname === '/privacy-policy' && /PDPA compliant|รับรองความสอดคล้องกับกฎหมายครบถ้วน/.test(html)) {
    checks.push('OVERCLAIMING_COMPLIANCE');
  }

  // Markdown CTA presence on notebook national (prose LINE links exist in content)
  if (pathname === '/บริการ/รับซื้อโน๊ตบุ๊ค') {
    if (!/line\.me\/ti\/p\/~@webuy/.test(html)) checks.push('MISSING_MARKDOWN_LINE');
    if (!/tel:\+66642579353/.test(html)) checks.push('MISSING_MARKDOWN_TEL');
  }

  if (checks.length) {
    failed += 1;
    console.error('FAIL', pathname, checks.join(', '));
  } else {
    console.log('OK', pathname, pageType, service, province);
  }
}

if (failed) {
  console.error(`FAILED ${failed}`);
  process.exit(1);
}
console.log('PREVIEW_HTML_CHECKS_PASS');
