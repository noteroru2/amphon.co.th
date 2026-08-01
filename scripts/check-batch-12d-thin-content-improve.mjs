/**
 * Batch 12D — Thin content improve pilot QA.
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
const DOCS = path.join(ROOT, 'docs/batch-12d-thin-content-improve-pilot');
const PILOT_MAP = path.join(DOCS, 'pilot-url-map.csv');
const EXPECTED_SITEMAP = 1166;
const EXPECTED_ORPHANS_MAX = 2;
const BASELINE_ORPHANS = new Set(['/บริการ/รับซื้อ-storage-nas', '/บริการ/รับซื้อเลนส์']);

const FORBIDDEN = [
  /ทีมงานประจำจังหวัด/,
  /มีสาขาใน(?!อุบล)/,
  /(?<!ไม่)จ่ายทันที(?!.*หลัง)/,
  /ราคาสูงที่สุด/,
  /(?<!ไม่)รับประกันเข้ารับทุก/,
  /สำนักงานประจำ(?!.*อุบล)/,
];

const REQUIRED_MARKERS = {
  '/รับซื้อ/รับซื้อของสะสม-อุบลราชธานี': ['สิ่งที่ควรถ่ายรูปก่อนประเมินของสะสม', '740/8', 'ราคาสุดท้ายยืนยันหลังตรวจ'],
  '/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-อุบลราชธานี': ['เตรียมอะไรก่อนนัดขายเครื่องใช้ไฟฟ้า', '740/8', 'ราคาสุดท้ายยืนยันหลังตรวจ'],
  '/รับซื้อ/รับซื้อโดรน-อุบลราชธานี': ['จุดตรวจเฉพาะโดรน', '740/8', 'ราคาสุดท้ายยืนยันหลังตรวจ'],
  '/รับซื้อ/รับซื้อทีวี-อุบลราชธานี': ['ข้อมูลและรูปที่ควรส่งตอนประเมินทีวี', '740/8', 'ไม่รับซื้อทีวีจอแตก'],
  '/รับซื้อ/รับซื้อเฟอร์นิเจอร์-อุบลราชธานี': ['สิ่งที่ช่วยให้ประเมินเฟอร์นิเจอร์', '740/8', 'ราคาสุดท้ายยืนยันหลังตรวจ'],
  '/รับซื้อ/รับซื้ออุปกรณ์-network-อุบลราชธานี': ['ข้อมูลที่ควรเตรียมก่อนประเมินอุปกรณ์ Network', '740/8', 'Factory Reset'],
};

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

if (!fs.existsSync(PILOT_MAP)) issues.push('missing pilot-url-map.csv');
const mapRows = fs.existsSync(PILOT_MAP) ? parseCSV(readText(PILOT_MAP)) : [];
const mh = mapRows[0] ? Object.fromEntries(mapRows[0].map((x, i) => [x, i])) : {};
const pilots = mapRows.slice(1).map((r) => r[mh.source_url]).filter(Boolean);
const pilotHash = crypto.createHash('sha256').update(pilots.join('\n')).digest('hex').slice(0, 16);
notes.push(`pilot_count=${pilots.length}`);
notes.push(`pilot_set_hash=${pilotHash}`);

if (pilots.length < 5 || pilots.length > 7) issues.push(`pilot count ${pilots.length} not in 5-7`);
for (const u of pilots) {
  if (String(mapRows.find((r) => r[mh.source_url] === u)?.[mh.classification]) !== 'IMPROVE') {
    issues.push(`${u} classification != IMPROVE`);
  }
  if (String(mapRows.find((r) => r[mh.source_url] === u)?.[mh.approved_for_pilot]).toLowerCase() !== 'yes') {
    issues.push(`${u} not approved_for_pilot`);
  }
}

const matrix = parseCSV(
  readText(path.join(ROOT, 'docs/batch-12a-thin-content-decisions/decision-matrix.csv')),
);
const mxh = Object.fromEntries(matrix[0].map((x, i) => [x, i]));
const improveSet = new Set(
  matrix.slice(1).filter((r) => r[mxh.classification] === 'IMPROVE').map((r) => r[mxh.url]),
);
if (improveSet.size !== 14) issues.push(`decision-matrix IMPROVE count ${improveSet.size} != 14`);
for (const u of pilots) {
  if (!improveSet.has(u)) issues.push(`pilot not in IMPROVE-14: ${u}`);
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
notes.push(`intentional_utility_orphans=${[...orphans].filter(([u]) => BASELINE_ORPHANS.has(u)).length}`);
if (orphans.length > EXPECTED_ORPHANS_MAX) issues.push(`orphan regression: ${orphans.length} > ${EXPECTED_ORPHANS_MAX}`);
for (const [u] of orphans) {
  if (!BASELINE_ORPHANS.has(u) && !noindexPages.has(u)) issues.push(`unexpected orphan: ${u}`);
}
if (indexableOrphans.length > 0) issues.push(`indexable orphans present: ${indexableOrphans.map(([u]) => u).join('|')}`);
if (broken > 0) issues.push(`broken links: ${broken}`);
if (redirecting > 0) issues.push(`redirecting links: ${redirecting}`);

for (const url of pilots) {
  if (!built.has(url)) {
    issues.push(`pilot missing from build: ${url}`);
    continue;
  }
  const html = readText(built.get(url));
  if (/noindex/i.test(meta(html, 'robots'))) issues.push(`pilot noindex: ${url}`);
  const can = canonicalPath(html);
  if (can !== url) issues.push(`pilot not self-canonical: ${url} => ${can}`);
  if (!sitemapSet.has(url)) issues.push(`pilot missing sitemap: ${url}`);
  const chain = resolveRedirectChain(url);
  if (chain.chain.length > 0) issues.push(`pilot unexpectedly redirects: ${url}`);
  for (const marker of REQUIRED_MARKERS[url] || []) {
    if (!html.includes(marker)) issues.push(`missing required content on ${url}: ${marker}`);
  }
  for (const re of FORBIDDEN) {
    if (re.test(html)) issues.push(`forbidden claim on ${url}: ${re}`);
  }
  if (!/tel:\+66642579353/.test(html)) issues.push(`missing E.164 tel on ${url}`);
  if (/TODO|TBD|lorem ipsum|\[placeholder\]/i.test(html)) issues.push(`placeholder on ${url}`);
  // FAQ visible
  if (!html.includes('faq') && !html.includes('FAQ') && !html.includes('คำถาม')) {
    // FAQ component may use class names
  }
  if ((html.match(/itemprop=["']acceptedAnswer["']/g) || []).length < 2 && (html.match(/class=["'][^"']*faq/gi) || []).length === 0) {
    // soft check: at least some FAQ markup
    if (!/คำถามที่พบบ่อย|FAQ/i.test(html)) issues.push(`FAQ not visible on ${url}`);
  }
}

// Collectibles family still retired
for (const retired of [
  '/รับซื้อ/รับซื้อของสะสม-กาฬสินธุ์',
  '/รับซื้อ/รับซื้อของสะสม-ร้อยเอ็ด',
]) {
  if (built.has(retired)) issues.push(`retired collectibles returned: ${retired}`);
  if (sitemapSet.has(retired)) issues.push(`retired collectibles in sitemap: ${retired}`);
}

const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-12d-thin-content']) issues.push('missing qa:batch-12d-thin-content script');

console.log('Batch 12D thin content improve pilot QA');
for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error(`FAIL (${issues.length})`);
  for (const i of issues.slice(0, 60)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
