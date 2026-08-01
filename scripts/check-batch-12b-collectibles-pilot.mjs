/**
 * Batch 12B — Collectibles merge pilot regression checks.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  extractHrefs,
  loadRedirects,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
  distDir,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PILOT_MAP = path.join(ROOT, 'docs/batch-12b-collectibles-merge-pilot/pilot-url-map.csv');
const EXPECTED_SITEMAP = 1175;
const TARGET = '/บริการ/รับซื้อของสะสม';

const APPROVED_PILOT = [
  '/รับซื้อ/รับซื้อของสะสม-กาฬสินธุ์',
  '/รับซื้อ/รับซื้อของสะสม-ขอนแก่น',
  '/รับซื้อ/รับซื้อของสะสม-ชัยภูมิ',
  '/รับซื้อ/รับซื้อของสะสม-นครพนม',
  '/รับซื้อ/รับซื้อของสะสม-นครราชสีมา',
  '/รับซื้อ/รับซื้อของสะสม-บึงกาฬ',
  '/รับซื้อ/รับซื้อของสะสม-บุรีรัมย์',
  '/รับซื้อ/รับซื้อของสะสม-มหาสารคาม',
  '/รับซื้อ/รับซื้อของสะสม-มุกดาหาร',
  '/รับซื้อ/รับซื้อของสะสม-ยโสธร',
];

const PROTECTED_FAMILY = [
  '/รับซื้อ/รับซื้อของสะสม-ร้อยเอ็ด',
  '/รับซื้อ/รับซื้อของสะสม-เลย',
  '/รับซื้อ/รับซื้อของสะสม-ศรีสะเกษ',
  '/รับซื้อ/รับซื้อของสะสม-สกลนคร',
  '/รับซื้อ/รับซื้อของสะสม-สุรินทร์',
  '/รับซื้อ/รับซื้อของสะสม-หนองคาย',
  '/รับซื้อ/รับซื้อของสะสม-หนองบัวลำภู',
  '/รับซื้อ/รับซื้อของสะสม-อำนาจเจริญ',
  '/รับซื้อ/รับซื้อของสะสม-อุดรธานี',
];

const issues = [];
const notes = [];

function encodePath(pathname) {
  return pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : ''))
    .join('/');
}

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

if (!fs.existsSync(PILOT_MAP)) issues.push('missing pilot-url-map.csv');
const mapRows = fs.existsSync(PILOT_MAP) ? parseCSV(readText(PILOT_MAP)) : [];
const mh = mapRows[0] ? Object.fromEntries(mapRows[0].map((h, i) => [h, i])) : {};
const pilotFromCsv = mapRows.slice(1).map((r) => r[mh.source_url]).filter(Boolean);

if (pilotFromCsv.length !== 10) issues.push(`pilot-url-map must have exactly 10 sources, got ${pilotFromCsv.length}`);
if (APPROVED_PILOT.length !== 10) issues.push('approved pilot paths != 10');

const expectedSet = new Set(APPROVED_PILOT);
for (const u of pilotFromCsv) {
  if (!expectedSet.has(u)) issues.push(`pilot map URL not in approved set: ${u}`);
  const row = mapRows.find((r) => r[mh.source_url] === u);
  if (row && row[mh.target_url] !== TARGET) issues.push(`${u} target != ${TARGET}`);
  if (row && row[mh.classification] !== 'MERGE') issues.push(`${u} classification != MERGE`);
}
for (const u of APPROVED_PILOT) {
  if (!pilotFromCsv.includes(u)) issues.push(`approved pilot URL missing from CSV: ${u}`);
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
const redirects = loadRedirects();

if (!built.has(TARGET)) issues.push(`target missing from build: ${TARGET}`);
else {
  const html = readText(built.get(TARGET));
  const canMatch =
    html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i) ||
    html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const can = canMatch ? canMatch[1] : '';
  if (can) {
    try {
      const p = decodeURIComponent(new URL(can).pathname.replace(/\/$/, '') || '/');
      if (p !== TARGET) issues.push(`target not self-canonical: ${can}`);
    } catch {
      issues.push(`target canonical parse fail: ${can}`);
    }
  }
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) issues.push('target is noindex');
}

for (const source of APPROVED_PILOT) {
  if (built.has(source)) issues.push(`retired source still built as HTML: ${source}`);
  for (const variant of [source, encodePath(source)]) {
    const chain = resolveRedirectChain(variant, redirects);
    if (chain.chain.length !== 1) {
      issues.push(`redirect hops for ${variant}: ${chain.chain.length} (want 1)`);
    } else if (chain.finalPath !== TARGET) {
      issues.push(`redirect ${variant} -> ${chain.finalPath} (want ${TARGET})`);
    } else if (!chain.chain[0].permanent) {
      issues.push(`redirect not permanent: ${variant}`);
    }
  }
}

for (const u of PROTECTED_FAMILY) {
  if (!built.has(u)) issues.push(`protected family URL missing from build: ${u}`);
  const chain = resolveRedirectChain(u, redirects);
  if (chain.chain.length > 0) issues.push(`protected family unexpectedly redirects: ${u}`);
}

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
if (!sitemapSet.has(TARGET)) issues.push('target missing from sitemap');
for (const source of APPROVED_PILOT) {
  if (sitemapSet.has(source)) issues.push(`retired source still in sitemap: ${source}`);
}
for (const u of PROTECTED_FAMILY) {
  if (!sitemapSet.has(u)) issues.push(`protected family missing from sitemap: ${u}`);
}

let linksToRetired = 0;
for (const [pathname, filePath] of built) {
  if (pathname.includes('404')) continue;
  const html = readText(filePath);
  for (const href of extractHrefs(html)) {
    const dest = normalizePathname(href);
    if (!dest) continue;
    if (expectedSet.has(dest)) {
      linksToRetired += 1;
      if (linksToRetired <= 8) issues.push(`internal link to retired source ${pathname} -> ${dest}`);
    }
  }
}
notes.push(`links_to_retired=${linksToRetired}`);
if (linksToRetired > 0) issues.push(`internal links to retired sources: ${linksToRetired}`);

const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-12b-collectibles']) issues.push('missing qa:batch-12b-collectibles script');

console.log('Batch 12B collectibles pilot QA');
for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error(`FAIL (${issues.length})`);
  for (const i of issues.slice(0, 50)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
