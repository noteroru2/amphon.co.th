/**
 * Batch 5 regression: oversized service image PNG→WebP swaps (F-07).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  readText,
  walkFiles,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAP_PATH = path.join(ROOT, 'docs/batch-5-image-optimization/asset-map.json');

const issues = [];
const notes = [];

if (!fs.existsSync(MAP_PATH)) {
  console.error('FAIL: missing docs/batch-5-image-optimization/asset-map.json');
  process.exit(1);
}

const assetMap = JSON.parse(readText(MAP_PATH));
notes.push(`assets_in_map=${assetMap.length}`);

function walkSrc(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkSrc(p, acc);
    else if (/\.(md|mdx|astro|ts)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const srcFiles = walkSrc(path.join(ROOT, 'src'));

for (const row of assetMap) {
  const pngAbs = path.join(ROOT, 'public', row.before_asset.replace(/^\//, ''));
  const webpAbs = path.join(ROOT, 'public', row.after_asset.replace(/^\//, ''));
  if (!fs.existsSync(webpAbs)) issues.push(`missing candidate: ${row.after_asset}`);
  if (!fs.existsSync(pngAbs)) issues.push(`missing retained png: ${row.before_asset}`);
  if (fs.existsSync(webpAbs) && fs.existsSync(pngAbs)) {
    const before = fs.statSync(pngAbs).size;
    const after = fs.statSync(webpAbs).size;
    if (after >= before) issues.push(`candidate not smaller: ${row.after_asset} (${after} >= ${before})`);
    const buf = fs.readFileSync(webpAbs);
    const magicOk = buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';
    if (!magicOk) issues.push(`candidate is not real webp: ${row.after_asset}`);
  }

  // Source must not still reference the png path for page/content usage
  for (const file of srcFiles) {
    const text = readText(file);
    if (text.includes(row.before_asset)) {
      issues.push(`source still references png: ${path.relative(ROOT, file)} -> ${row.before_asset}`);
    }
  }
}

// Built HTML for impacted URLs
const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
for (const row of assetMap) {
  for (const pathname of row.urls || []) {
    if (!built.has(pathname)) {
      issues.push(`missing built page: ${pathname}`);
      continue;
    }
    const html = readText(built.get(pathname));
    if (html.includes(row.before_asset)) {
      issues.push(`built HTML still references png: ${pathname} -> ${row.before_asset}`);
    }
    if (!html.includes(row.after_asset)) {
      // page may reference asset only via OG or not embed body image; require hero or body presence when listed
      if (row.require_in_html !== false) {
        issues.push(`built HTML missing webp: ${pathname} -> ${row.after_asset}`);
      }
    }
    // Hero loading check: only the page-header figure for this asset must not be lazy
    if (row.image_role === 'hero' || row.image_role === 'hero+content') {
      const figureRe = new RegExp(
        `<figure class=["']page-header__figure["'][\\s\\S]*?src=["']${row.after_asset.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}["'][\\s\\S]*?>`,
        'i',
      );
      const figure = html.match(figureRe)?.[0] || '';
      if (figure && /loading=["']lazy["']/i.test(figure)) {
        issues.push(`hero webp is lazy: ${pathname}`);
      }
      if (figure && !/loading=["']eager["']/i.test(figure)) {
        issues.push(`hero webp missing eager loading: ${pathname}`);
      }
    }
  }
}

const sitemap0 = path.join(distDir, 'sitemap-0.xml');
if (fs.existsSync(sitemap0)) {
  const count = [...readText(sitemap0).matchAll(/<loc>/g)].length;
  notes.push(`sitemap_count=${count}`);
  if (count !== 1166) issues.push(`sitemap count ${count} !== 1166`);
} else {
  notes.push('sitemap_absent');
}

console.log('Batch 5 image optimization validation');
for (const note of notes) console.log(`  note: ${note}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log('PASS');
