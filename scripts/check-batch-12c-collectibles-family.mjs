/**
 * Batch 12C — Collectibles family completion regression checks.
 * Validates remaining 9 sources + full family 19 + target + sitemap -9.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
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
const FAMILY_MAP = path.join(ROOT, 'docs/batch-12c-collectibles-family-completion/family-url-map.csv');
const EXPECTED_SITEMAP = 1166;
const TARGET = '/บริการ/รับซื้อของสะสม';

const PILOT_A = [
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

const BATCH_12C = [
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

const FAMILY = [...PILOT_A, ...BATCH_12C];
const FAMILY_SET = new Set(FAMILY);

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

if (BATCH_12C.length !== 9) issues.push(`remaining set != 9 (got ${BATCH_12C.length})`);
if (FAMILY.length !== 19) issues.push(`family total != 19 (got ${FAMILY.length})`);

const sourceSetHash = crypto.createHash('sha256').update(BATCH_12C.join('\n')).digest('hex').slice(0, 16);
notes.push(`source_set_hash=${sourceSetHash}`);

if (!fs.existsSync(FAMILY_MAP)) issues.push('missing family-url-map.csv');
const mapRows = fs.existsSync(FAMILY_MAP) ? parseCSV(readText(FAMILY_MAP)) : [];
const mh = mapRows[0] ? Object.fromEntries(mapRows[0].map((h, i) => [h, i])) : {};
const fromCsv = mapRows.slice(1).map((r) => r[mh.source_url]).filter(Boolean);

if (fromCsv.length !== 9) issues.push(`family-url-map must have exactly 9 sources, got ${fromCsv.length}`);
const approved12c = new Set(BATCH_12C);
for (const u of fromCsv) {
  if (!approved12c.has(u)) issues.push(`family map URL not in approved 12C set: ${u}`);
  const row = mapRows.find((r) => r[mh.source_url] === u);
  if (row && row[mh.target_url] !== TARGET) issues.push(`${u} target != ${TARGET}`);
  if (row && String(row[mh.approved_for_batch12c]).toLowerCase() !== 'yes') {
    issues.push(`${u} not approved_for_batch12c`);
  }
}
for (const u of BATCH_12C) {
  if (!fromCsv.includes(u)) issues.push(`approved 12C URL missing from CSV: ${u}`);
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

function assertRetired(source) {
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

for (const source of BATCH_12C) assertRetired(source);
for (const source of PILOT_A) assertRetired(source);

// Out-of-family: Ubon ของสะสม must remain live
const UBON = '/รับซื้อ/รับซื้อของสะสม-อุบลราชธานี';
if (!built.has(UBON)) issues.push(`out-of-scope Ubon missing from build: ${UBON}`);
{
  const chain = resolveRedirectChain(UBON, redirects);
  if (chain.chain.length > 0) issues.push(`out-of-scope Ubon unexpectedly redirects: ${UBON}`);
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
if (sitemapUrls !== EXPECTED_SITEMAP) issues.push(`sitemap ${sitemapUrls} != ${EXPECTED_SITEMAP} (expected diff -9 from 1175)`);
if (!sitemapSet.has(TARGET)) issues.push('target missing from sitemap');
if (!sitemapSet.has(UBON)) issues.push('out-of-scope Ubon missing from sitemap');
for (const source of FAMILY) {
  if (sitemapSet.has(source)) issues.push(`family source still in sitemap: ${source}`);
}

let linksToRetired = 0;
for (const [pathname, filePath] of built) {
  if (pathname.includes('404')) continue;
  const html = readText(filePath);
  for (const href of extractHrefs(html)) {
    const dest = normalizePathname(href);
    if (!dest) continue;
    if (FAMILY_SET.has(dest)) {
      linksToRetired += 1;
      if (linksToRetired <= 12) issues.push(`internal link to retired source ${pathname} -> ${dest}`);
    }
  }
}
notes.push(`links_to_retired=${linksToRetired}`);
if (linksToRetired > 0) issues.push(`internal links to retired sources: ${linksToRetired}`);

const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-12c-collectibles']) issues.push('missing qa:batch-12c-collectibles script');
if (!pkg.scripts?.['qa:batch-12b-collectibles']) issues.push('missing qa:batch-12b-collectibles script');

console.log('Batch 12C collectibles family completion QA');
for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error(`FAIL (${issues.length})`);
  for (const i of issues.slice(0, 60)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
