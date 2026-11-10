/**
 * Compiled-output release gate for the nationwide 56-area SEO expansion.
 * Runs after npm run build; checks generated HTML and sitemap, not SEO rank.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  extractHrefs,
  normalizePathname,
  readText,
  walkFiles,
} from './lib/site-audit.mjs';

const root = process.cwd();
const newSlugs = [
  'กระบี่','กรุงเทพมหานคร','นครปฐม','นครศรีธรรมราช',
  'นนทบุรี','นราธิวาส','ปทุมธานี','ปัตตานี',
  'พระนครศรีอยุธยา','พิษณุโลก','ระยอง','สงขลา',
  'สมุทรปราการ','สุราษฎร์ธานี','เชียงราย','เชียงใหม่',
  'ตรัง','ชุมพร','สระบุรี','ฉะเชิงเทรา',
  'ปราจีนบุรี','ลำปาง','ราชบุรี','ประจวบคีรีขันธ์',
];
const allFiles = fs.readdirSync(path.join(root, 'src/content/areas')).filter((f) => f.endsWith('.md'));
const allSlugs = allFiles.map((f) => f.slice(0, -3));
const pages = collectBuiltPages();
const issues = [];
const assert = (ok, message) => { if (!ok) issues.push(message); };

assert(allSlugs.length === 56, 'Expected 56 source area hubs, got ' + allSlugs.length);
const dirPath = '/พื้นที่ให้บริการ';
const dirFile = pages.get(dirPath);
assert(Boolean(dirFile), 'Missing built /พื้นที่ให้บริการ directory');

const sitemapPaths = new Set();
const sitemapFiles = walkFiles(distDir).filter((f) => path.basename(f).startsWith('sitemap') && f.endsWith('.xml'));
for (const file of sitemapFiles) {
  const xml = readText(file);
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const route = normalizePathname(match[1].replaceAll('&amp;', '&'));
    if (route) sitemapPaths.add(route);
  }
}
assert(sitemapFiles.length > 0, 'No sitemap XML emitted by build');

let dirLinks = new Set();
if (dirFile) {
  const html = readText(dirFile);
  dirLinks = new Set(extractHrefs(html).map(normalizePathname).filter((href) => href?.startsWith('/พื้นที่ให้บริการ/')));
  assert(dirLinks.size === 56, 'Directory should link exactly 56 unique area hubs; found ' + dirLinks.size);
  assert((html.match(/<h1(?:\s|>)/gi) ?? []).length === 1, 'Directory must have exactly one H1');
  assert(normalizePathname(extractCanonical(html)) === dirPath, 'Directory canonical mismatch');
}

for (const slug of allSlugs) {
  const route = '/พื้นที่ให้บริการ/' + slug;
  assert(dirLinks.has(route), slug + ': not linked from region directory');
  assert(pages.has(route), slug + ': missing generated HTML');
  assert(sitemapPaths.has(route), slug + ': missing in generated XML sitemap');
}
for (const slug of newSlugs) {
  const route = '/พื้นที่ให้บริการ/' + slug;
  const filename = pages.get(route);
  if (!filename) continue;
  const html = readText(filename);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const descriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] ?? '';
  const h1Count = (html.match(/<h1(?:\s|>)/gi) ?? []).length;
  assert(h1Count === 1, slug + ': expected one rendered H1, found ' + h1Count);
  assert(titleMatch.includes(slug), slug + ': title missing province');
  assert(descriptionMatch.includes(slug), slug + ': description missing province');
  assert(normalizePathname(extractCanonical(html)) === route, slug + ': canonical mismatch');
  assert(!/<meta\b[^>]*name=["']robots["'][^>]*noindex/i.test(html), slug + ': noindex present');
  assert(html.includes('line.me') && html.includes('@webuy'), slug + ': no visible LINE contact');
  const links = extractHrefs(html).map(normalizePathname).filter(Boolean);
  for (const link of links.filter((v) => v.startsWith('/พื้นที่ให้บริการ/') || v.startsWith('/บริการ/'))) {
    assert(pages.has(link), slug + ': broken internal content link ' + link);
  }

  const jsonLd = [];
  for (const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(block[1]);
      jsonLd.push(...(Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed]));
    } catch (err) {
      issues.push(slug + ': invalid JSON-LD (' + err.message + ')');
    }
  }
  const kinds = jsonLd.flatMap((obj) => Array.isArray(obj?.['@type']) ? obj['@type'] : [obj?.['@type']]);
  assert(kinds.includes('BreadcrumbList'), slug + ': BreadcrumbList schema missing');
  assert(kinds.includes('Place'), slug + ': Place schema missing');
  assert(kinds.includes('FAQPage'), slug + ': FAQPage schema missing');
}
if (issues.length) {
  console.error('Nationwide rendered SEO QA FAILED (' + issues.length + '):');
  for (const issue of issues) console.error('  - ' + issue);
  process.exitCode = 1;
} else {
  console.log('Nationwide rendered SEO QA PASS: 56 area HTML routes, 56 directory links, 56 sitemap entries, 24 new page canonical/H1/metadata/CTA/JSON-LD/internal links.');
  console.log('This test does not confirm live Vercel HTTP, screenshots, Google indexing or rankings.');
}
