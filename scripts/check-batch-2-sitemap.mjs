/**
 * Batch 2 regression: sitemap inclusion filter for F-02 / F-03.
 * Validates shared filter logic against built pages; also validates
 * dist sitemap XML when present (may be missing locally due to F-08).
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  loadRedirects,
  normalizePathname,
  readText,
  resolveRedirectChain,
  walkFiles,
} from './lib/site-audit.mjs';
import {
  SITEMAP_BLOCKED_PREFIXES,
  SITEMAP_EXACT_EXCLUSIONS,
  SITEMAP_REQUIRED_INCLUSIONS,
  shouldIncludeInSitemap,
} from './lib/sitemap-inclusion.mjs';

const SITE = 'https://amphon.co.th';
const issues = [];
const notes = [];

const builtPages = collectBuiltPages();
const redirects = loadRedirects();

function robotsMeta(html) {
  return (html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) || [])[1] ?? '';
}

// --- Unit: required inclusions ---
for (const pathname of SITEMAP_REQUIRED_INCLUSIONS) {
  if (!shouldIncludeInSitemap(pathname) || !shouldIncludeInSitemap(`${SITE}${pathname}`)) {
    issues.push(`required inclusion rejected by filter: ${pathname}`);
  }
  if (!builtPages.has(pathname)) {
    issues.push(`required inclusion missing from build output: ${pathname}`);
  } else {
    const html = readText(builtPages.get(pathname));
    const robots = robotsMeta(html);
    const canonical = normalizePathname(extractCanonical(html));
    if (robots.includes('noindex')) issues.push(`required page is noindex: ${pathname}`);
    if (canonical !== pathname) issues.push(`required page not self-canonical: ${pathname} -> ${canonical}`);
  }
}

// --- Unit: exact exclusions stay out ---
for (const pathname of SITEMAP_EXACT_EXCLUSIONS) {
  if (shouldIncludeInSitemap(pathname)) {
    issues.push(`exact exclusion incorrectly included: ${pathname}`);
  }
}

// --- Unit: F-02 regression — sibling must not be clipped by hub exclusion ---
if (!shouldIncludeInSitemap('/บริการ/รับซื้อสินค้าไอทีบริษัท')) {
  issues.push('F-02 regression: /บริการ/รับซื้อสินค้าไอทีบริษัท filtered out');
}
if (shouldIncludeInSitemap('/บริการ/รับซื้อสินค้าไอที')) {
  issues.push('legacy hub /บริการ/รับซื้อสินค้าไอที must stay excluded');
}

// --- Unit: F-03 must not be exact-excluded ---
if (SITEMAP_EXACT_EXCLUSIONS.has('/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี')) {
  issues.push('F-03 regression: URL still in exact exclusion set');
}
if (!shouldIncludeInSitemap('/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี')) {
  issues.push('F-03 regression: filter excludes /รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี');
}

// --- Unit: legacy province prefixes ---
for (const prefix of SITEMAP_BLOCKED_PREFIXES) {
  const sample = `${prefix}ขอนแก่น`;
  if (shouldIncludeInSitemap(sample)) {
    issues.push(`blocked prefix sample incorrectly included: ${sample}`);
  }
}

// --- Simulated sitemap from built pages ---
const simulated = [];
for (const pathname of builtPages.keys()) {
  if (pathname === '/404') continue;
  if (!shouldIncludeInSitemap(pathname)) continue;

  const html = readText(builtPages.get(pathname));
  const robots = robotsMeta(html);
  if (robots.includes('noindex')) {
    issues.push(`simulated sitemap would include noindex page: ${pathname}`);
    continue;
  }

  const canonical = normalizePathname(extractCanonical(html));
  if (canonical && canonical !== pathname) {
    issues.push(`simulated sitemap would include canonical-to-other: ${pathname} -> ${canonical}`);
    continue;
  }

  const redirect = resolveRedirectChain(pathname, redirects);
  if (redirect.chain.length > 0) {
    issues.push(`simulated sitemap would include redirect source: ${pathname} -> ${redirect.finalPath}`);
    continue;
  }

  simulated.push(pathname);
}

for (const pathname of SITEMAP_REQUIRED_INCLUSIONS) {
  if (!simulated.includes(pathname)) {
    issues.push(`required URL missing from simulated sitemap: ${pathname}`);
  }
}

const uniqueSim = new Set(simulated);
if (uniqueSim.size !== simulated.length) {
  issues.push('simulated sitemap has duplicate pathnames');
}

// Unexpected: exact exclusions / blocked prefixes must not appear
for (const pathname of simulated) {
  if (SITEMAP_EXACT_EXCLUSIONS.has(pathname)) {
    issues.push(`simulated sitemap contains exact exclusion: ${pathname}`);
  }
  if (SITEMAP_BLOCKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    issues.push(`simulated sitemap contains blocked prefix path: ${pathname}`);
  }
}

notes.push(`simulated_sitemap_count=${simulated.length}`);
notes.push(`built_pages=${builtPages.size}`);

// --- Dist sitemap XML when available ---
const sitemapFiles = walkFiles(distDir).filter(
  (filePath) => path.basename(filePath).startsWith('sitemap') && filePath.endsWith('.xml'),
);

let distSitemapStatus = 'MISSING';
if (sitemapFiles.length === 0) {
  notes.push('LOCAL_SITEMAP_XML=BLOCKED_BY_F08_OR_MISSING');
  distSitemapStatus = 'BLOCKED_BY_F08_OR_MISSING';
} else {
  distSitemapStatus = 'PRESENT';
  const locs = [];
  for (const file of sitemapFiles) {
    const xml = readText(file);
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/giu)) {
      locs.push(normalizePathname(match[1]));
    }
  }
  notes.push(`dist_sitemap_url_count=${locs.length}`);

  for (const pathname of SITEMAP_REQUIRED_INCLUSIONS) {
    if (!locs.includes(pathname)) {
      issues.push(`required URL missing from dist sitemap XML: ${pathname}`);
    }
  }
  for (const pathname of SITEMAP_EXACT_EXCLUSIONS) {
    if (locs.includes(pathname)) {
      issues.push(`exact exclusion found in dist sitemap XML: ${pathname}`);
    }
  }
  if (new Set(locs).size !== locs.length) {
    issues.push('dist sitemap has duplicate URLs');
  }
  for (const loc of locs) {
    if (!loc || !loc.startsWith('/')) continue;
    if (loc.includes('?') || loc.includes('#')) issues.push(`query/fragment in sitemap: ${loc}`);
    if (loc.includes('localhost') || loc.includes('staging')) issues.push(`bad host path: ${loc}`);
  }
}

const outDir = path.join(process.cwd(), 'docs/batch-2-sitemap-inclusion');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'regression-results.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      issues,
      notes,
      distSitemapStatus,
      simulatedCount: simulated.length,
      requiredInclusions: SITEMAP_REQUIRED_INCLUSIONS,
      exactExclusions: [...SITEMAP_EXACT_EXCLUSIONS],
    },
    null,
    2,
  ),
);

if (issues.length === 0) {
  console.log(
    `PASS batch-2 sitemap: required inclusions OK, exclusions OK, simulated=${simulated.length}, dist=${distSitemapStatus}`,
  );
  for (const note of notes) console.log(`- ${note}`);
  process.exit(0);
}

console.error(`FAIL batch-2 sitemap: ${issues.length} issue(s)`);
for (const issue of issues) console.error(`- ${issue}`);
for (const note of notes) console.error(`- note: ${note}`);
process.exit(1);
