/**
 * Batch 11 — internal link architecture regression checks.
 */
import fs from 'node:fs';
import path from 'node:path';
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
const APPROVED = path.join(ROOT, 'docs/batch-11-internal-link-architecture/approved-links.json');
const MAP_TS = path.join(ROOT, 'src/config/internal-link-map.ts');
const EXPECTED_SITEMAP = 1166;

const issues = [];
const notes = [];

function meta(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}

if (!fs.existsSync(MAP_TS)) issues.push('missing src/config/internal-link-map.ts');
if (!fs.existsSync(APPROVED)) {
  issues.push('missing docs/batch-11-internal-link-architecture/approved-links.json');
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
if (built.size === 0) issues.push('no built HTML — run npm run build first');

const approved = fs.existsSync(APPROVED) ? JSON.parse(readText(APPROVED)) : [];
notes.push(`approved_links=${approved.length}`);

const noindexPages = new Set();
for (const [pathname, filePath] of built) {
  const robots = meta(readText(filePath), 'robots');
  if (/noindex/i.test(robots)) noindexPages.add(pathname);
}
notes.push(`noindex_pages=${noindexPages.size}`);

const sampleSources = [
  '/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี',
  '/รับซื้อ/รับซื้อ-macbook-ขอนแก่น',
  '/บริการ/รับซื้อ-macbook',
  '/บริการ/รับซื้อโน๊ตบุ๊ค',
  '/บริการ/รับซื้อ-iphone',
];

for (const source of sampleSources) {
  if (!built.has(source)) {
    issues.push(`sample source missing: ${source}`);
    continue;
  }
  const html = readText(built.get(source));
  const expected = approved.filter((a) => a.source_url === source);
  for (const link of expected) {
    if (!html.includes(link.destination_url)) {
      issues.push(`approved link missing on ${source} -> ${link.destination_url}`);
    }
  }
}

let broken = 0;
let redirecting = 0;
let toNoindex = 0;
let toHttpWww = 0;
const inbound = new Map([...built.keys()].map((u) => [u, new Set()]));

for (const [pathname, filePath] of built) {
  if (pathname.includes('404')) continue;
  const html = readText(filePath);
  for (const href of extractHrefs(html)) {
    if (/^https?:\/\//i.test(href) && /amphon\.co\.th/i.test(href)) {
      if (/^http:\/\//i.test(href) || /\/\/www\.amphon\.co\.th/i.test(href)) toHttpWww += 1;
    }
    const dest = normalizePathname(href);
    if (!dest) continue;
    if (dest.startsWith('/images/') || dest.startsWith('/favicon') || dest.startsWith('/icon-')) continue;
    if (!built.has(dest)) {
      const redirectResult = resolveRedirectChain(dest);
      if (redirectResult.chain.length > 0 && built.has(redirectResult.finalPath)) {
        redirecting += 1;
      } else {
        broken += 1;
        if (broken <= 10) issues.push(`broken ${pathname} -> ${dest}`);
      }
      continue;
    }
    inbound.get(dest)?.add(pathname);
    if (noindexPages.has(dest)) {
      toNoindex += 1;
      if (toNoindex <= 5) issues.push(`link to noindex ${pathname} -> ${dest}`);
    }
  }
}

const orphans = [...inbound.entries()].filter(([u, s]) => s.size === 0 && !u.includes('404'));
notes.push(`orphan_pages=${orphans.length}`);
notes.push(`broken=${broken}`);
notes.push(`redirecting=${redirecting}`);
notes.push(`to_noindex=${toNoindex}`);
notes.push(`http_www_internal=${toHttpWww}`);

if (broken > 0) issues.push(`broken internal links: ${broken}`);
if (redirecting > 0) issues.push(`redirecting internal links: ${redirecting}`);
if (toNoindex > 0) issues.push(`links to noindex: ${toNoindex}`);
if (toHttpWww > 0) issues.push(`http/www internal links: ${toHttpWww}`);

const deferredDest = approved.filter((a) =>
  /\/รับซื้อ\/รับซื้อ-server-|\/รับซื้อ\/รับซื้อ-ups-|\/รับซื้อ\/รับซื้อของสะสม-|\/รับซื้อ\/รับซื้อทีวี-|\/รับซื้อ\/รับซื้ออุปกรณ์-network-/.test(
    a.destination_url,
  ),
);
if (deferredDest.length) issues.push(`approved links target deferred thin destinations: ${deferredDest.length}`);

let sitemapUrls = 0;
for (const f of walkFiles(distDir).filter((x) => /sitemap.*\.xml$/i.test(x))) {
  const xml = readText(f);
  if (/<sitemapindex/i.test(xml)) continue;
  sitemapUrls += (xml.match(/<loc>/g) || []).length;
}
notes.push(`sitemap_url_count=${sitemapUrls}`);
if (sitemapUrls !== EXPECTED_SITEMAP) issues.push(`sitemap count ${sitemapUrls} != ${EXPECTED_SITEMAP}`);

const pkg = JSON.parse(readText(path.join(ROOT, 'package.json')));
if (!pkg.scripts?.['qa:batch-11-internal-links']) issues.push('missing qa:batch-11-internal-links');

for (const hub of ['/บริการ/รับซื้อ-macbook', '/บริการ/รับซื้อโน๊ตบุ๊ค', '/บริการ/รับซื้อ-iphone']) {
  if (!built.has(hub)) continue;
  const html = readText(built.get(hub));
  if (!html.includes('อ่านก่อนตัดสินใจขาย')) {
    issues.push(`${hub} missing supporting articles sidebar`);
  }
}

// Province sidebar present on sample service-area
for (const sa of ['/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี', '/รับซื้อ/รับซื้อ-macbook-ขอนแก่น']) {
  if (!built.has(sa)) continue;
  const html = readText(built.get(sa));
  if (!html.includes('บริการอื่นใน')) {
    issues.push(`${sa} missing same-province related sidebar`);
  }
}

console.log('Batch 11 internal links QA');
for (const n of notes) console.log(`  note: ${n}`);
if (orphans.length > 5) {
  notes.push(`orphan_sample=${orphans.slice(0, 5).map(([u]) => u).join(',')}`);
}
if (issues.length) {
  console.error(`FAIL (${issues.length})`);
  for (const i of issues.slice(0, 40)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS');
