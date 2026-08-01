/**
 * Batch 8 — image dimensions (F-13) regression checks.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectBuiltPages, distDir, readText } from './lib/site-audit.mjs';
import { getCachedDimensions, loadDimensionCache } from './lib/local-image-dimensions-cache.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_CSV = path.join(ROOT, 'docs/seo-audit-2026-07-31/image-asset-audit.csv');
const CACHE = path.join(ROOT, 'src/data/local-image-dimensions.json');

const issues = [];
const notes = [];

loadDimensionCache();
if (!fs.existsSync(CACHE)) {
  issues.push('missing src/data/local-image-dimensions.json — run npm run images:dimension-cache');
}

const astroCfg = readText(path.join(ROOT, 'astro.config.mjs'));
if (!astroCfg.includes('rehypeLocalImageDimensions')) {
  issues.push('astro.config.mjs missing rehypeLocalImageDimensions');
}

// Parse F-13 audit targets (missing width/height rows)
const auditRows = [];
if (fs.existsSync(AUDIT_CSV)) {
  for (const line of readText(AUDIT_CSV).trim().split(/\r?\n/).slice(1)) {
    if (!line.includes('missing width/height')) continue;
    const cols = line.split(',');
    if (cols.length < 2) continue;
    auditRows.push({ url: cols[0], asset: cols[1] });
  }
}
notes.push(`audit_missing_rows=${auditRows.length}`);

const uniqueAssets = [...new Set(auditRows.map((r) => r.asset))];
// Resolve Batch 5 webp swaps: prefer .webp if present in cache/fs
function resolveAsset(asset) {
  if (getCachedDimensions(asset)) return asset;
  if (asset.endsWith('.png')) {
    const webp = asset.replace(/\.png$/i, '.webp');
    if (getCachedDimensions(webp) || fs.existsSync(path.join(ROOT, 'public', webp.replace(/^\//, '')))) {
      return webp;
    }
  }
  return asset;
}

for (const asset of uniqueAssets) {
  const resolved = resolveAsset(asset);
  const dims = getCachedDimensions(resolved);
  if (!dims || !(dims.width > 0) || !(dims.height > 0)) {
    issues.push(`no dimensions in cache for ${asset} (resolved ${resolved})`);
  }
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
if (built.size === 0) issues.push('no built HTML — run npm run build first');

function parseImgs(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return m ? m[1] : null;
}

let missingOnTargets = 0;
let wrongRatio = 0;
const checkedUrls = new Set();

for (const row of auditRows) {
  const pathname = row.url.startsWith('/') ? row.url : `/${row.url}`;
  if (!built.has(pathname)) {
    // draft or renamed — note only
    notes.push(`audit_url_not_built=${pathname}`);
    continue;
  }
  checkedUrls.add(pathname);
  const html = readText(built.get(pathname));
  const resolved = resolveAsset(row.asset);
  const imgs = parseImgs(html).filter((tag) => tag.includes(resolved) || tag.includes(row.asset));
  if (!imgs.length) {
    // content may only reference webp now
    const webpImgs = parseImgs(html).filter((tag) => /\.webp/i.test(tag) && /services\//.test(tag));
    if (!webpImgs.length) {
      issues.push(`no matching img for ${pathname} asset ${row.asset}`);
      continue;
    }
  }
  for (const tag of imgs.length ? imgs : parseImgs(html).filter((t) => t.includes(path.basename(resolved)))) {
    if (!tag.includes('services/') && !tag.includes(resolved) && !tag.includes(row.asset)) continue;
    // Only content/body images that match asset basename
    const src = attr(tag, 'src');
    if (!src) continue;
    if (!src.includes(path.basename(resolved).replace(/\.(png|webp)$/i, '')) && src !== resolved && src !== row.asset) {
      continue;
    }
    const w = Number(attr(tag, 'width'));
    const h = Number(attr(tag, 'height'));
    const loading = attr(tag, 'loading');
    const alt = attr(tag, 'alt');
    if (!(w > 0) || !(h > 0)) {
      missingOnTargets += 1;
      issues.push(`missing dimensions: ${pathname} ${src}`);
      continue;
    }
    const dims = getCachedDimensions(src) || getCachedDimensions(resolved);
    if (dims) {
      const ratioHtml = w / h;
      const ratioAsset = dims.width / dims.height;
      if (Math.abs(ratioHtml - ratioAsset) > 0.02) {
        // Hero may intentionally use display box ratio with object-fit cover — only flag body imgs without page-header context
        // Skip if this is clearly the hero (eager + fetchpriority high) matching ServiceLayout pattern
        const fp = attr(tag, 'fetchpriority');
        if (!(loading === 'eager' && fp === 'high')) {
          wrongRatio += 1;
          issues.push(`ratio mismatch: ${pathname} ${src} html=${w}x${h} asset=${dims.width}x${dims.height}`);
        }
      }
    }
    if (alt == null) issues.push(`alt missing: ${pathname} ${src}`);
  }
}

notes.push(`target_urls_checked=${checkedUrls.size}`);
notes.push(`missing_on_targets=${missingOnTargets}`);
notes.push(`wrong_ratio_content=${wrongRatio}`);

// Global scan: markdown-like content images under /images/services without dims
let globalMissing = 0;
for (const [pathname, filePath] of built) {
  const html = readText(filePath);
  for (const tag of parseImgs(html)) {
    const src = attr(tag, 'src');
    if (!src || !src.startsWith('/images/')) continue;
    if (/\.svg$/i.test(src)) continue;
    const w = Number(attr(tag, 'width'));
    const h = Number(attr(tag, 'height'));
    if (!(w > 0) || !(h > 0)) {
      globalMissing += 1;
      if (globalMissing <= 25) issues.push(`global missing dims: ${pathname} ${src}`);
    }
  }
}
notes.push(`global_missing_local_raster=${globalMissing}`);
if (globalMissing > 25) notes.push(`global_missing_truncated=${globalMissing - 25}`);

const sitemap0 = path.join(distDir, 'sitemap-0.xml');
if (fs.existsSync(sitemap0)) {
  const count = [...readText(sitemap0).matchAll(/<loc>/g)].length;
  notes.push(`sitemap_count=${count}`);
  if (count !== 1166) issues.push(`sitemap count ${count} !== 1166`);
}

console.log('Batch 8 image dimensions validation');
for (const note of notes) console.log(`  note: ${note}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues.slice(0, 60)) console.error(`  - ${issue}`);
  if (issues.length > 60) console.error(`  ... ${issues.length - 60} more`);
  process.exit(1);
}
console.log('PASS');
