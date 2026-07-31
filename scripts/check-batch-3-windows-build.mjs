/**
 * Batch 3 regression: Windows build completion + artifact integrity (F-08).
 * Expects a successful `npm run build` beforehand (marker + dist artifacts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  walkFiles,
} from './lib/site-audit.mjs';
import { SITEMAP_REQUIRED_INCLUSIONS } from './lib/sitemap-inclusion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = path.join(ROOT, '.amphon-build-complete');
const SITE = 'https://amphon.co.th';
const EXPECTED_SITEMAP_URLS = 1185;
const issues = [];
const notes = [];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

if (!fs.existsSync(MARKER)) {
  issues.push('missing .amphon-build-complete marker (build did not finish cleanly)');
} else {
  try {
    const marker = JSON.parse(readText(MARKER));
    if (!marker.completedAt) issues.push('build marker missing completedAt');
    if (!marker.mode) issues.push('build marker missing mode');
    notes.push(`build marker mode=${marker.mode}`);
  } catch (err) {
    issues.push(`build marker is not valid JSON: ${err.message}`);
  }
}

if (!fs.existsSync(distDir)) {
  issues.push('dist/ missing after build');
}

const htmlFiles = walkFiles(distDir).filter((f) => f.endsWith(`${path.sep}index.html`) || f.endsWith(`${path.sep}404.html`) || f.endsWith('index.html') || f.endsWith('404.html'));
const htmlCount = walkFiles(distDir).filter((f) => f.endsWith('.html')).length;
notes.push(`html_count=${htmlCount}`);
if (htmlCount < 1000) {
  issues.push(`unexpectedly low HTML count: ${htmlCount}`);
}

const builtPages = collectBuiltPages();
notes.push(`route_pages=${builtPages.size}`);

// distDir already resolves to dist/client when the Vercel layout is present
const sitemapIndex = path.join(distDir, 'sitemap-index.xml');
const sitemap0 = path.join(distDir, 'sitemap-0.xml');

if (!fs.existsSync(sitemapIndex)) {
  issues.push('missing dist/client/sitemap-index.xml');
}
if (!fs.existsSync(sitemap0)) {
  issues.push('missing dist/client/sitemap-0.xml');
}

function normalizeLoc(loc) {
  try {
    const url = new URL(loc);
    return `${url.origin}${decodeURIComponent(url.pathname)}`;
  } catch {
    try {
      return decodeURIComponent(loc);
    } catch {
      return loc;
    }
  }
}

let sitemapCount = 0;
const sitemapUrls = new Set();
if (fs.existsSync(sitemap0)) {
  try {
    const locs = parseSitemapLocs(readText(sitemap0));
    sitemapCount = locs.length;
    for (const loc of locs) {
      sitemapUrls.add(loc);
      sitemapUrls.add(normalizeLoc(loc));
    }
    notes.push(`sitemap_count=${sitemapCount}`);
    if (sitemapCount !== EXPECTED_SITEMAP_URLS) {
      issues.push(`sitemap URL count ${sitemapCount} !== expected ${EXPECTED_SITEMAP_URLS}`);
    }
  } catch (err) {
    issues.push(`failed to parse sitemap-0.xml: ${err.message}`);
  }
}

if (fs.existsSync(sitemapIndex)) {
  const indexXml = readText(sitemapIndex);
  if (!indexXml.includes('sitemap-0.xml')) {
    issues.push('sitemap-index.xml does not reference sitemap-0.xml');
  }
}

for (const pathname of SITEMAP_REQUIRED_INCLUSIONS) {
  const absolute = `${SITE}${pathname}`;
  if (!sitemapUrls.has(absolute)) {
    issues.push(`required sitemap URL missing: ${pathname}`);
  }
}

const legacyBlockedSamples = [
  `${SITE}/บริการ/รับซื้อสินค้าไอที`,
];
for (const url of legacyBlockedSamples) {
  if (sitemapUrls.has(url)) {
    issues.push(`excluded URL unexpectedly in sitemap: ${url}`);
  }
}

const staleTemps = [
  path.join(ROOT, 'dist', '.amphon-build-tmp'),
  path.join(ROOT, '.vercel', '.amphon-build-tmp'),
];
for (const tempPath of staleTemps) {
  if (fs.existsSync(tempPath)) {
    issues.push(`stale temp path present: ${tempPath}`);
  }
}

const lockGlobs = walkFiles(distDir).filter((f) => f.endsWith('.lock') || f.endsWith('.tmp'));
if (lockGlobs.length) {
  issues.push(`unexpected lock/temp files in dist: ${lockGlobs.slice(0, 5).join(', ')}`);
}

if (!builtPages.has('/404') && !fs.existsSync(path.join(distDir, 'client', '404.html')) && !fs.existsSync(path.join(distDir, '404.html'))) {
  // 404 may live under client depending on adapter layout
  const any404 = walkFiles(distDir).some((f) => f.replace(/\\/g, '/').endsWith('/404.html'));
  if (!any404) issues.push('404.html missing from dist');
  else notes.push('404.html present');
} else {
  notes.push('404 route/artifact present');
}

console.log('Batch 3 Windows build validation');
for (const note of notes) console.log(`  note: ${note}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log('PASS');
