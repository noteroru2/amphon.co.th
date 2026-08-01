/**
 * Batch 10 — F-09 metadata quality regression checks.
 * Length thresholds are warnings only; failures are semantic/duplicate/empty/expected mismatches.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  normalizePathname,
  readText,
  walkFiles,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIFF_CSV = path.join(ROOT, 'docs/batch-10-metadata-quality/metadata-diff.csv');
const EXPECTED_SITEMAP = 1166;

const issues = [];
const warnings = [];
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
  return rows;
}

function meta(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}

function prop(html, property) {
  const re = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}

function titleText(html) {
  return ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
}

function h1Texts(html) {
  return [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  );
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
if (built.size === 0) issues.push('no built HTML — run npm run build first');

// Expected changes from diff
const diffRows = parseCSV(readText(DIFF_CSV).replace(/^\uFEFF/, ''));
const dh = Object.fromEntries(diffRows[0].map((h, i) => [h, i]));
const expectedByUrl = new Map();
for (const r of diffRows.slice(1)) {
  const url = r[dh.url];
  if (!expectedByUrl.has(url)) expectedByUrl.set(url, {});
  expectedByUrl.get(url)[r[dh.field]] = r[dh.after];
}
notes.push(`diff_urls=${expectedByUrl.size}`);

for (const [url, fields] of expectedByUrl) {
  if (!built.has(url)) {
    issues.push(`changed URL missing from build: ${url}`);
    continue;
  }
  const html = readText(built.get(url));
  const titles = [...html.matchAll(/<title\b[^>]*>/gi)];
  const descs = [...html.matchAll(/<meta[^>]*name=["']description["']/gi)];
  if (titles.length !== 1) issues.push(`${url}: title tag count ${titles.length}`);
  if (descs.length !== 1) issues.push(`${url}: description meta count ${descs.length}`);

  const renderedTitle = decodeHtml(titleText(html));
  const renderedDesc = decodeHtml(meta(html, 'description'));

  if (fields.title) {
    const expectedTitle = `${fields.title} | Amphon.co.th`;
    if (renderedTitle !== expectedTitle) {
      issues.push(`${url}: title mismatch\n  expected: ${expectedTitle}\n  got: ${renderedTitle}`);
    }
    if (/Amphon\.co\.th.*Amphon\.co\.th/.test(renderedTitle) || /อำพล เทรดดิ้ง.*Amphon\.co\.th/.test(renderedTitle)) {
      issues.push(`${url}: duplicated brand in title`);
    }
  }
  if (fields.description) {
    if (renderedDesc !== fields.description) {
      issues.push(`${url}: description mismatch\n  expected: ${fields.description}\n  got: ${renderedDesc}`);
    }
  }

  const ogTitle = decodeHtml(prop(html, 'og:title'));
  const ogDesc = decodeHtml(prop(html, 'og:description'));
  if (fields.title && ogTitle !== `${fields.title} | Amphon.co.th`) {
    issues.push(`${url}: og:title mismatch`);
  }
  if (fields.description && ogDesc !== fields.description) {
    issues.push(`${url}: og:description mismatch`);
  }

  // Forbidden claims
  const blob = `${renderedTitle}\n${renderedDesc}`;
  if (/ราคาสูงที่สุด|ดีที่สุด|รับซื้อทุกเครื่อง|มีสาขา|ทีมงานประจำจังหวัด/.test(blob)) {
    issues.push(`${url}: unsupported claim in metadata`);
  }
  if (/จ่ายทันที/.test(blob) && !/หลัง/.test(blob)) {
    issues.push(`${url}: unqualified จ่ายทันที in metadata`);
  }
}

// Global empty / multi / duplicate checks on all indexable pages
const titleMap = new Map();
const descMap = new Map();
let emptyTitle = 0;
let emptyDesc = 0;
let multiTitle = 0;
let multiDesc = 0;

for (const [pathname, filePath] of built) {
  if (pathname === '/404' || pathname.endsWith('/404')) continue;
  const html = readText(filePath);
  const robots = meta(html, 'robots');
  if (/noindex/i.test(robots)) continue;

  const tCount = [...html.matchAll(/<title\b/gi)].length;
  const dCount = [...html.matchAll(/name=["']description["']/gi)].length;
  if (tCount !== 1) multiTitle += 1;
  if (dCount !== 1) multiDesc += 1;

  const t = decodeHtml(titleText(html));
  const d = decodeHtml(meta(html, 'description'));
  if (!t) emptyTitle += 1;
  if (!d) emptyDesc += 1;

  if (!titleMap.has(t)) titleMap.set(t, []);
  titleMap.get(t).push(pathname);
  if (!descMap.has(d)) descMap.set(d, []);
  descMap.get(d).push(pathname);

  if (t.length > 70) warnings.push(`long_title_signal ${pathname} len=${t.length}`);
  if (d.length > 170) warnings.push(`long_desc_signal ${pathname} len=${d.length}`);
}

const dupTitles = [...titleMap.entries()].filter(([t, urls]) => t && urls.length > 1);
const dupDescs = [...descMap.entries()].filter(([d, urls]) => d && urls.length > 1);
notes.push(`duplicate_title_groups=${dupTitles.length}`);
notes.push(`duplicate_description_groups=${dupDescs.length}`);
notes.push(`empty_title=${emptyTitle}`);
notes.push(`empty_description=${emptyDesc}`);
notes.push(`multi_title=${multiTitle}`);
notes.push(`multi_description=${multiDesc}`);
notes.push(`long_title_warnings=${warnings.filter((w) => w.startsWith('long_title')).length}`);
notes.push(`long_desc_warnings=${warnings.filter((w) => w.startsWith('long_desc')).length}`);

if (emptyTitle) issues.push(`empty titles: ${emptyTitle}`);
if (emptyDesc) issues.push(`empty descriptions: ${emptyDesc}`);
if (multiTitle) issues.push(`pages with !=1 title: ${multiTitle}`);
if (multiDesc) issues.push(`pages with !=1 description: ${multiDesc}`);
if (dupTitles.length) {
  issues.push(
    `duplicate title groups: ${dupTitles.length} sample=${dupTitles
      .slice(0, 3)
      .map(([t, u]) => `${t} => ${u.join('|')}`)
      .join(' ; ')}`,
  );
}
if (dupDescs.length) {
  issues.push(
    `duplicate description groups: ${dupDescs.length} sample=${dupDescs
      .slice(0, 3)
      .map(([d, u]) => `${d.slice(0, 40)} => ${u.join('|')}`)
      .join(' ; ')}`,
  );
}

// Sitemap
let sitemapUrls = 0;
for (const f of walkFiles(distDir).filter((x) => /sitemap.*\.xml$/i.test(x))) {
  const xml = readText(f);
  if (/<sitemapindex/i.test(xml)) continue;
  sitemapUrls += (xml.match(/<loc>/g) || []).length;
}
notes.push(`sitemap_url_count=${sitemapUrls}`);
if (sitemapUrls !== EXPECTED_SITEMAP) {
  issues.push(`sitemap count ${sitemapUrls} != ${EXPECTED_SITEMAP}`);
}

// package script
const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-10-metadata']) issues.push('missing qa:batch-10-metadata script');

console.log('Batch 10 metadata QA');
for (const n of notes) console.log(`  note: ${n}`);
if (warnings.length <= 20) {
  for (const w of warnings) console.log(`  warn: ${w}`);
} else {
  console.log(`  warn: ${warnings.length} length signals (not failures)`);
}
if (issues.length) {
  console.error(`FAIL (${issues.length})`);
  for (const i of issues) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
