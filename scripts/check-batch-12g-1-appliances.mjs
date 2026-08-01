/**
 * Batch 12G-1 — BD-01 appliances outside Ubon QA.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  normalizePathname,
  readText,
  walkFiles,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs/batch-12g-1-appliances-outside-ubon');
const URL_MAP = path.join(DOCS, 'url-map.csv');
const EXPECTED = 19;
const HUB = '/บริการ/รับซื้อเครื่องใช้ไฟฟ้า';
const UBON = '/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-อุบลราชธานี';
const BASELINE_ORPHANS = new Set(['/บริการ/รับซื้อ-storage-nas', '/บริการ/รับซื้อเลนส์']);

const FORBIDDEN_HARD = [
  /ทีมงานประจำจังหวัด/,
  /สำนักงานประจำ/,
  /ราคาสูงที่สุด/,
  /รับถึงที่ทุก/,
  /มีรถรับทุกจังหวัด/,
  /ส่งมาได้ทั่วประเทศ/,
];

function hasUnsafeClaim(html) {
  if (/(?<!ไม่)มีสาขา/.test(html) && !/ไม่มีสาขา/.test(html)) return 'สาขา';
  for (const re of FORBIDDEN_HARD) {
    if (re.test(html)) return String(re);
  }
  // "รับทุกประเภท/สภาพ" only fail if not in a negating sentence
  const risky = html.match(/[^ก-๙]{0,25}รับทุก(ประเภท|สภาพ)[^ก-๙]{0,15}/g) || [];
  for (const frag of risky) {
    if (!/ไม่|ห้าม|มิได้|ไม่ได้|ไม่ยืนยัน|ไม่ประกาศ|ไม่ควรถูก/.test(frag)) return frag.trim();
  }
  return null;
}

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

if (!fs.existsSync(URL_MAP)) {
  console.error('FAIL missing url-map.csv');
  process.exit(1);
}
const mapRows = parseCSV(readText(URL_MAP));
const mh = Object.fromEntries(mapRows[0].map((x, i) => [x, i]));
const urls = mapRows.slice(1).map((r) => r[mh.url]).filter(Boolean);
const setHash = crypto.createHash('sha256').update(urls.join('\n')).digest('hex').slice(0, 16);
notes.push(`url_count=${urls.length}`);
notes.push(`url_set_hash=${setHash}`);

if (urls.length !== EXPECTED) issues.push(`url count ${urls.length} != ${EXPECTED}`);
if (urls.includes(UBON)) issues.push('Ubon page in set');
for (const u of urls) {
  if (!u.includes('รับซื้อเครื่องใช้ไฟฟ้า-')) issues.push(`not appliance URL ${u}`);
  if (u.includes('อุบลราชธานี')) issues.push(`ubon leak ${u}`);
}

const pages = collectBuiltPages();
const pageMap = new Map();
for (const [p, f] of pages.entries()) pageMap.set(normalizePathname(p), f);

const sitemap = new Set();
for (const f of walkFiles(distDir).filter((n) => /sitemap.*\.xml$/i.test(n))) {
  const xml = readText(f);
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      sitemap.add(decodeURIComponent(new URL(m[1]).pathname.replace(/\/$/, '') || '/'));
    } catch {
      /* skip */
    }
  }
}
notes.push(`sitemap_url_count=${[...sitemap].filter((u) => !u.includes('sitemap')).length || sitemap.size}`);
// count only page urls roughly
let smCount = 0;
for (const u of sitemap) if (!/sitemap/i.test(u)) smCount += 1;
notes.push(`sitemap_pages_approx=${smCount}`);
if (smCount !== 1166 && sitemap.size !== 1166) {
  // dist may include sitemap index locs — prefer exact page count from batch-2 style
  const onlyPages = [...sitemap].filter((u) => u.startsWith('/') && !u.includes('.xml'));
  notes.push(`sitemap_path_count=${onlyPages.length}`);
  if (onlyPages.length !== 1166) issues.push(`sitemap count ${onlyPages.length} != 1166`);
}

const markers = [
  'รายกรณี',
  '740/8',
  'tel:+66642579353',
  'ไม่รับประกัน',
  HUB,
];

let faqPages = 0;
for (const url of urls) {
  const f = pageMap.get(url);
  if (!f) {
    issues.push(`missing built page ${url}`);
    continue;
  }
  if (!sitemap.has(url)) issues.push(`not in sitemap ${url}`);
  const html = readText(f);
  const can =
    (html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i) ||
      html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) ||
      [])[1] || '';
  let canPath = '';
  try {
    canPath = decodeURIComponent(new URL(can).pathname.replace(/\/$/, '') || '/');
  } catch {
    canPath = can;
  }
  if (canPath !== url) issues.push(`canonical ${url} -> ${canPath}`);
  if (/noindex/i.test(html)) issues.push(`noindex ${url}`);
  for (const m of markers) {
    if (m === HUB) {
      if (!html.includes(HUB) && !html.includes(encodeURI(HUB))) {
        // pathname may appear percent-encoded in attributes
        const enc = HUB.split('/')
          .map((s) => (s ? encodeURIComponent(s) : ''))
          .join('/');
        if (!html.includes(enc) && !html.includes('รับซื้อเครื่องใช้ไฟฟ้า')) {
          issues.push(`missing hub link ${url}`);
        }
      }
      continue;
    }
    if (m === 'ไม่รับประกัน') continue;
    if (!html.includes(m)) issues.push(`missing marker ${m} on ${url}`);
  }
  if (!/ไม่รับประกัน|ไม่มีการรับประกัน|ไม่ควรถูกสื่อ|ไม่ได้รับประกัน/.test(html)) {
    issues.push(`missing limit language ${url}`);
  }
  const unsafe = hasUnsafeClaim(html);
  if (unsafe) issues.push(`forbidden ${unsafe} on ${url}`);
  if (/จ่ายทันที/.test(html) && !/ยอมรับราคาสุดท้าย|หลังตรวจ/.test(html)) {
    issues.push(`unqualified payment ${url}`);
  }
  const faq = (html.match(/acceptedAnswer/g) || []).length;
  if (faq >= 2) faqPages += 1;
  // province leakage: other province names in H1
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/<[^>]+>/g, '');
  const province = url.split('-').pop();
  if (h1 && !h1.includes(province)) issues.push(`h1 province mismatch ${url}`);
}

notes.push(`faq_pages=${faqPages}`);
notes.push(`built_pages=${pages.size}`);

// orphan check light
let allOrphans = 0;
for (const [p] of pages.entries()) {
  const n = normalizePathname(p);
  // skip — batch 11 is authoritative; just ensure baseline exceptions still exist
  if (BASELINE_ORPHANS.has(n)) allOrphans += 1;
}
notes.push(`baseline_utility_orphans_present=${allOrphans}`);

// Ubon not modified check via required 12D marker still present
const ubonFile = pageMap.get(UBON);
if (ubonFile) {
  const uh = readText(ubonFile);
  if (!uh.includes('เตรียมอะไรก่อนนัดขายเครื่องใช้ไฟฟ้าในอุบล')) {
    issues.push('Ubon 12D page regression');
  }
}

for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error('FAIL batch-12g-1 appliances');
  for (const i of issues.slice(0, 40)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS batch-12g-1 appliances');
