/**
 * Batch 12E — Remaining IMPROVE candidates QA.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  extractHrefs,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs/batch-12e-complete-improve-candidates');
const URL_MAP = path.join(DOCS, 'url-map.csv');
const EXPECTED_SITEMAP = 1166;
const BASELINE_ORPHANS = new Set(['/บริการ/รับซื้อ-storage-nas', '/บริการ/รับซื้อเลนส์']);

const BATCH_12D = [
  '/รับซื้อ/รับซื้อของสะสม-อุบลราชธานี',
  '/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-อุบลราชธานี',
  '/รับซื้อ/รับซื้อโดรน-อุบลราชธานี',
  '/รับซื้อ/รับซื้อทีวี-อุบลราชธานี',
  '/รับซื้อ/รับซื้อเฟอร์นิเจอร์-อุบลราชธานี',
  '/รับซื้อ/รับซื้ออุปกรณ์-network-อุบลราชธานี',
];

const REQUIRED = {
  '/รับซื้อ/รับซื้อ-server-อุบลราชธานี': ['สเปกและรูปที่ควรส่งตอนประเมิน Server', '740/8', 'Secure Erase'],
  '/รับซื้อ/รับซื้อ-ups-อุบลราชธานี': ['ข้อมูลที่ช่วยประเมิน UPS', '740/8', 'ขนาด VA'],
  '/blog/ขาย-iphone-มือสอง-ต้องเตรียมอะไรบ้าง': ['ลำดับเตรียมเครื่องที่ควรทำก่อนส่งรูป', 'Find My', 'tel:+66642579353'],
  '/blog/คอมบริษัทเก่า-ขายยังไง': ['เตรียมข้อมูลล็อตก่อนติดต่อร้าน', 'Secure Erase', '740/8'],
  '/blog/โน๊ตบุ๊คเสีย-ขายได้ไหม': ['อาการที่มักยังส่งประเมินได้', 'ประเมินตามสภาพจริง', 'ไม่ได้รับประกันว่ารับทุกอาการ'],
  '/blog/รับซื้อสินค้าไอทีถึงที่-ปลอดภัยไหม': ['ลำดับที่ปลอดภัยสำหรับผู้ขาย', 'ยอมรับราคาสุดท้าย', '740/8'],
  '/blog/วิธีเช็กราคาก่อนขายโน๊ตบุ๊คมือสอง': ['ปัจจัยที่มีผลต่อราคาจริง', 'ราคาเบื้องต้น', 'tel:+66642579353'],
  '/blog/วิธีเตรียมเครื่องก่อนขายสินค้าไอที': ['เช็กลิสต์ร่วมที่ใช้ได้หลายประเภท', 'จุดต่างตามประเภทเครื่อง', '740/8'],
};

const FORBIDDEN = [
  /ทีมงานประจำจังหวัด/,
  /มีสาขาใน(?!อุบล)/,
  /(?<!ไม่)จ่ายทันที(?!.*หลัง)/,
  /ราคาสูงที่สุด/,
  /(?<!ไม่)รับประกันเข้ารับทุก/,
  /รับซื้อทุกสภาพ/,
  /รับทุกเครื่อง/,
];

const issues = [];
const notes = [];

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inQ) {
      if (c === '"' && n === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && n === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length && !(r.length === 1 && r[0] === ''));
}

function meta(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}

function canonicalPath(html) {
  const m =
    html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i) ||
    html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!m) return '';
  try {
    return decodeURIComponent(new URL(m[1]).pathname.replace(/\/$/, '') || '/');
  } catch {
    return m[1];
  }
}

if (!fs.existsSync(URL_MAP)) issues.push('missing url-map.csv');
const mapRows = fs.existsSync(URL_MAP) ? parseCSV(readText(URL_MAP)) : [];
const mh = mapRows[0] ? Object.fromEntries(mapRows[0].map((x, i) => [x, i])) : {};
const urls = mapRows.slice(1).map((r) => r[mh.url]).filter(Boolean);
const setHash = crypto.createHash('sha256').update(urls.join('\n')).digest('hex').slice(0, 16);
notes.push(`url_count=${urls.length}`);
notes.push(`url_set_hash=${setHash}`);

if (urls.length !== 8) issues.push(`url-map must have 8 URLs, got ${urls.length}`);
for (const u of urls) {
  if (BATCH_12D.includes(u)) issues.push(`Batch 12D URL in 12E set: ${u}`);
  if (String(mapRows.find((r) => r[mh.url] === u)?.[mh.approved]).toLowerCase() !== 'yes') {
    issues.push(`${u} not approved`);
  }
}

const matrix = parseCSV(
  readText(path.join(ROOT, 'docs/batch-12a-thin-content-decisions/decision-matrix.csv')),
);
const mxh = Object.fromEntries(matrix[0].map((x, i) => [x, i]));
const improve = matrix.slice(1).filter((r) => r[mxh.classification] === 'IMPROVE').map((r) => r[mxh.url]);
if (improve.length !== 14) issues.push(`IMPROVE inventory ${improve.length} != 14`);
for (const u of urls) {
  if (!improve.includes(u)) issues.push(`not in IMPROVE-14: ${u}`);
}
for (const u of BATCH_12D) {
  if (!improve.includes(u)) issues.push(`12D url missing from IMPROVE inventory: ${u}`);
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);

let sitemapUrls = 0;
const sitemapSet = new Set();
for (const f of walkFiles(distDir).filter((x) => /sitemap.*\.xml$/i.test(x))) {
  const xml = readText(f);
  if (/<sitemapindex/i.test(xml)) continue;
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      const p = decodeURIComponent(new URL(m[1]).pathname.replace(/\/$/, '') || '/');
      sitemapSet.add(p);
      sitemapUrls += 1;
    } catch {
      /* skip */
    }
  }
}
notes.push(`sitemap_url_count=${sitemapUrls}`);
if (sitemapUrls !== EXPECTED_SITEMAP) issues.push(`sitemap ${sitemapUrls} != ${EXPECTED_SITEMAP}`);

const noindexPages = new Set();
for (const [pathname, filePath] of built) {
  if (/noindex/i.test(meta(readText(filePath), 'robots'))) noindexPages.add(pathname);
}

const inbound = new Map([...built.keys()].map((u) => [u, new Set()]));
let broken = 0;
let redirecting = 0;
for (const [pathname, filePath] of built) {
  if (pathname.includes('404')) continue;
  for (const href of extractHrefs(readText(filePath))) {
    const dest = normalizePathname(href);
    if (!dest) continue;
    if (dest.startsWith('/images/') || dest.startsWith('/favicon') || dest.startsWith('/icon-')) continue;
    if (!built.has(dest)) {
      const chain = resolveRedirectChain(dest);
      if (chain.chain.length > 0 && built.has(chain.finalPath)) redirecting += 1;
      else {
        broken += 1;
        if (broken <= 8) issues.push(`broken ${pathname} -> ${dest}`);
      }
      continue;
    }
    inbound.get(dest)?.add(pathname);
  }
}
const orphans = [...inbound.entries()].filter(([u, s]) => s.size === 0 && !u.includes('404'));
const indexableOrphans = orphans.filter(([u]) => !noindexPages.has(u));
notes.push(`all_route_orphans=${orphans.length}`);
notes.push(`indexable_orphans=${indexableOrphans.length}`);
if (orphans.length > 2) issues.push(`orphan regression: ${orphans.length}`);
for (const [u] of orphans) {
  if (!BASELINE_ORPHANS.has(u)) issues.push(`unexpected orphan: ${u}`);
}
if (indexableOrphans.length > 0) issues.push(`indexable orphans: ${indexableOrphans.map(([u]) => u).join('|')}`);
if (broken > 0) issues.push(`broken: ${broken}`);
if (redirecting > 0) issues.push(`redirecting: ${redirecting}`);

for (const url of urls) {
  if (!built.has(url)) {
    issues.push(`missing build: ${url}`);
    continue;
  }
  const html = readText(built.get(url));
  if (/noindex/i.test(meta(html, 'robots'))) issues.push(`noindex: ${url}`);
  if (canonicalPath(html) !== url) issues.push(`not self-canonical: ${url}`);
  if (!sitemapSet.has(url)) issues.push(`not in sitemap: ${url}`);
  if (resolveRedirectChain(url).chain.length > 0) issues.push(`redirects: ${url}`);
  for (const marker of REQUIRED[url] || []) {
    if (!html.includes(marker)) issues.push(`missing marker on ${url}: ${marker}`);
  }
  for (const re of FORBIDDEN) {
    if (re.test(html)) issues.push(`forbidden on ${url}: ${re}`);
  }
  if (/TODO|TBD|lorem ipsum|\[placeholder\]/i.test(html)) issues.push(`placeholder: ${url}`);
}

// Batch 12D regression: required markers still present
for (const url of BATCH_12D) {
  if (!built.has(url)) {
    issues.push(`12D regression missing: ${url}`);
    continue;
  }
  const html = readText(built.get(url));
  if (!html.includes('740/8')) issues.push(`12D regression lost store address: ${url}`);
  if (/noindex/i.test(meta(html, 'robots'))) issues.push(`12D became noindex: ${url}`);
}

const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-12e-improve']) issues.push('missing qa:batch-12e-improve');
if (!pkg.scripts?.['qa:batch-12d-thin-content']) issues.push('missing qa:batch-12d-thin-content');

console.log('Batch 12E remaining IMPROVE candidates QA');
for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error(`FAIL (${issues.length})`);
  for (const i of issues.slice(0, 60)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
