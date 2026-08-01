/**
 * Batch 9 — F-10 tel: href consistency regression checks.
 *
 * Expected: all tel: hrefs use E.164 tel:+66642579353
 * Forbidden: tel:0642579353 (local national format in href)
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
const EXPECTED_TEL = 'tel:+66642579353';
const FORBIDDEN_TEL = 'tel:0642579353';
const EXPECTED_SITEMAP = 1166;

const issues = [];
const notes = [];

function countInText(text, needle) {
  if (!text.includes(needle)) return 0;
  return text.split(needle).length - 1;
}

function walkSrc(dir, acc = []) {
  for (const entr of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entr.name);
    if (entr.isDirectory()) walkSrc(p, acc);
    else if (/\.(md|mdx|astro|ts|tsx|js|mjs)$/.test(entr.name)) acc.push(p);
  }
  return acc;
}

// --- Source checks ---
let srcForbidden = 0;
let srcExpected = 0;
const srcForbiddenFiles = [];
for (const file of walkSrc(path.join(ROOT, 'src'))) {
  const text = readText(file);
  const bad = countInText(text, FORBIDDEN_TEL);
  const good = countInText(text, EXPECTED_TEL);
  srcForbidden += bad;
  srcExpected += good;
  if (bad > 0) srcForbiddenFiles.push(path.relative(ROOT, file).replace(/\\/g, '/'));
}
notes.push(`source_forbidden_tel_occ=${srcForbidden}`);
notes.push(`source_expected_tel_occ=${srcExpected}`);
if (srcForbidden > 0) {
  issues.push(`source still has ${srcForbidden} ${FORBIDDEN_TEL} in ${srcForbiddenFiles.length} files (sample: ${srcForbiddenFiles.slice(0, 5).join(', ')})`);
}
if (srcExpected === 0) {
  issues.push(`source missing ${EXPECTED_TEL}`);
}

const siteTs = readText(path.join(ROOT, 'src/config/site.ts'));
if (!siteTs.includes("phoneTel: '+66642579353'")) {
  issues.push("site.phoneTel is not '+66642579353'");
}

// --- Build artifact checks ---
const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
if (built.size === 0) {
  issues.push('no built HTML — run npm run build first');
}

let distForbiddenPages = 0;
let distForbiddenOcc = 0;
let distExpectedPages = 0;
let distPagesWithTel = 0;
const sampleForbidden = [];

for (const [pathname, filePath] of built) {
  const html = readText(filePath);
  const bad = countInText(html, FORBIDDEN_TEL);
  const good = [...html.matchAll(/href=["']tel:\+66642579353["']/gi)].length;
  if (bad > 0) {
    distForbiddenPages += 1;
    distForbiddenOcc += bad;
    if (sampleForbidden.length < 10) sampleForbidden.push(pathname);
  }
  if (good > 0) {
    distExpectedPages += 1;
    distPagesWithTel += 1;
  }
}

notes.push(`dist_forbidden_pages=${distForbiddenPages}`);
notes.push(`dist_forbidden_occ=${distForbiddenOcc}`);
notes.push(`dist_pages_with_e164=${distExpectedPages}`);

if (distForbiddenPages > 0) {
  issues.push(
    `dist has ${FORBIDDEN_TEL} on ${distForbiddenPages} pages (${distForbiddenOcc} occ); sample: ${sampleForbidden.join(', ')}`,
  );
}
if (built.size > 0 && distExpectedPages === 0) {
  issues.push(`dist missing ${EXPECTED_TEL} hrefs`);
}

// Spot-check known mixed pages from audit reproduction
const spotChecks = [
  '/บริการ/รับซื้อโน๊ตบุ๊คเกมมิ่ง',
  '/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี',
  '/contact',
  '/',
];
for (const pathname of spotChecks) {
  if (!built.has(pathname)) {
    issues.push(`spot-check page missing from build: ${pathname}`);
    continue;
  }
  const html = readText(built.get(pathname));
  if (html.includes(FORBIDDEN_TEL)) {
    issues.push(`spot-check still has forbidden tel on ${pathname}`);
  }
  if (!html.includes(EXPECTED_TEL)) {
    issues.push(`spot-check missing expected tel on ${pathname}`);
  }
  const canonical = extractCanonical(html);
  const canonPath = normalizePathname(canonical);
  if (canonPath && canonPath !== pathname) {
    // allow trailing differences already normalized
    notes.push(`canonical_note=${pathname}->${canonPath}`);
  }
}

// --- Sitemap count ---
const sitemapFiles = walkFiles(distDir).filter((f) => /sitemap.*\.xml$/i.test(f));
let sitemapUrls = 0;
for (const f of sitemapFiles) {
  const xml = readText(f);
  if (/<sitemapindex/i.test(xml)) continue;
  sitemapUrls += (xml.match(/<loc>/g) || []).length;
}
notes.push(`sitemap_url_count=${sitemapUrls}`);
if (sitemapUrls !== EXPECTED_SITEMAP && sitemapUrls > 0) {
  // Allow documented drift but flag
  notes.push(`sitemap_count_diff_from_expected=${sitemapUrls - EXPECTED_SITEMAP}`);
  if (Math.abs(sitemapUrls - EXPECTED_SITEMAP) > 0) {
    // Not an automatic fail if equal to built pages and intentional; still note
    if (sitemapUrls !== built.size) {
      issues.push(`sitemap count ${sitemapUrls} != built pages ${built.size} and != expected ${EXPECTED_SITEMAP}`);
    }
  }
}

// --- Regression: noindex / unexpected ---
let noindexCount = 0;
for (const [, filePath] of built) {
  const html = readText(filePath);
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) || /content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html)) {
    noindexCount += 1;
  }
}
notes.push(`noindex_pages=${noindexCount}`);

// --- package.json script presence ---
const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-9-f10']) {
  issues.push('package.json missing qa:batch-9-f10 script');
}

console.log('Batch 9 F-10 QA');
for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issues)`);
  for (const i of issues) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
