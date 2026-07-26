import path from 'node:path';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  extractHrefs,
  extractXmlLocs,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
} from './lib/site-audit.mjs';

const targetPaths = [
  '/บริการ/รับซื้อ-macbook',
  '/บริการ/รับซื้อ-macbook-air',
  '/บริการ/รับซื้อ-macbook-pro',
  '/บริการ/รับซื้อ-macbook-intel',
  '/บริการ/รับซื้อ-macbook-m1',
  '/บริการ/รับซื้อ-macbook-m2',
  '/บริการ/รับซื้อ-macbook-m3-m4',
  '/บริการ/รับซื้อ-macbook-เสีย',
  '/บริการ/รับซื้อ-macbook-จอแตก',
  '/blog/ขาย-macbook-มือสอง-อย่างไรให้ได้ราคาดี',
  '/blog/ราคา-macbook-มือสอง-2026',
  '/blog/macbook-battery-cycle-มีผลต่อราคาขายแค่ไหน',
  '/blog/macbook-ติด-apple-id-find-my-ก่อนขาย',
  '/blog/วิธีล้างเครื่อง-macbook-ก่อนขาย',
];

const builtPages = collectBuiltPages();
const sitemapFiles = walkFiles(distDir).filter(
  (filePath) => path.basename(filePath).startsWith('sitemap') && filePath.endsWith('.xml'),
);
const sitemapPaths = new Set(
  sitemapFiles.flatMap((filePath) =>
    extractXmlLocs(readText(filePath))
      .filter((loc) => !loc.endsWith('.xml'))
      .map(normalizePathname)
      .filter(Boolean),
  ),
);

const results = [];
const errors = [];

for (const pathname of targetPaths) {
  const htmlPath = builtPages.get(pathname);
  const row = {
    url: `https://amphon.co.th${pathname}`,
    routeExists: Boolean(htmlPath),
    inSitemap: sitemapPaths.has(pathname),
    indexable: false,
    canonical: '',
    h1Count: 0,
    jsonLdValid: false,
    brokenLinks: 0,
  };

  if (!htmlPath) {
    errors.push(`${pathname}: built route missing`);
    results.push(row);
    continue;
  }

  const html = readText(htmlPath);
  row.canonical = extractCanonical(html);
  row.h1Count = (html.match(/<h1[\s>]/giu) ?? []).length;
  row.indexable = !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/iu.test(html);

  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)];
  row.jsonLdValid =
    jsonLdBlocks.length === 1 &&
    (() => {
      try {
        const parsed = JSON.parse(jsonLdBlocks[0][1]);
        return Array.isArray(parsed['@graph']);
      } catch {
        return false;
      }
    })();

  for (const href of extractHrefs(html)) {
    const linkedPath = normalizePathname(href);
    if (
      !linkedPath ||
      linkedPath.startsWith('/images/') ||
      linkedPath.startsWith('/favicon') ||
      linkedPath.startsWith('/icon-') ||
      linkedPath.startsWith('/api/')
    ) {
      continue;
    }

    if (builtPages.has(linkedPath)) continue;
    const redirect = resolveRedirectChain(linkedPath);
    if (redirect.chain.length > 0 && builtPages.has(redirect.finalPath)) continue;
    row.brokenLinks += 1;
  }

  if (!row.inSitemap) errors.push(`${pathname}: missing from sitemap`);
  if (!row.indexable) errors.push(`${pathname}: noindex`);
  if (row.canonical !== row.url) errors.push(`${pathname}: canonical mismatch (${row.canonical || 'missing'})`);
  if (row.h1Count !== 1) errors.push(`${pathname}: expected one H1, found ${row.h1Count}`);
  if (!row.jsonLdValid) errors.push(`${pathname}: invalid JSON-LD graph`);
  if (row.brokenLinks > 0) errors.push(`${pathname}: ${row.brokenLinks} broken internal link(s)`);
  results.push(row);
}

console.log(`Batch 2.1 routes checked: ${results.length}`);
console.log(`Sitemap files found: ${sitemapFiles.length}`);
console.log(`Sitemap URLs parsed: ${sitemapPaths.size}`);
console.log(`MacBook URLs missing from sitemap: ${results.filter((row) => !row.inSitemap).length}`);
console.log(`MacBook broken internal links: ${results.reduce((sum, row) => sum + row.brokenLinks, 0)}`);
console.log(`Canonical errors: ${results.filter((row) => row.canonical !== row.url).length}`);
console.log(`H1 errors: ${results.filter((row) => row.h1Count !== 1).length}`);
console.log(`JSON-LD errors: ${results.filter((row) => !row.jsonLdValid).length}`);

if (errors.length > 0) {
  console.error(`FAIL Batch 2.1 regression: ${errors.length} issue(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('PASS Batch 2.1 regression: routes, sitemap, indexability, canonicals, H1, JSON-LD and internal links');
