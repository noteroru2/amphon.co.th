/**
 * Issue #54: non-destructive, production-vs-live-Cloudflare-preview SEO regression.
 * All requests are GETs for public pages/assets; never uses API secrets or mutates DNS.
 * Checks every URL enumerated by sitemap, plus critical 404/redirect/link/asset cases.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const PRODUCTION = 'https://amphon.co.th';
const PREVIEW = 'https://amphon-co-th.noteroru2.workers.dev';
const MAX_PAGES = 2500;
const BASELINE_ROUTES = [
  '/', '/about', '/contact', '/บริการ/รับซื้อโน๊ตบุ๊ค',
  '/บริการ/รับซื้อคอมพิวเตอร์', '/บริการ/รับซื้อ-macbook',
  '/บริการ/รับซื้อคอมบริษัท', '/บริการ/รับซื้อคอมยกล็อต',
  '/บริการ/รับเหมาประมูลอุปกรณ์ไอที', '/บริการ/รับซื้อ-server',
  '/พื้นที่ให้บริการ', '/พื้นที่ให้บริการ/ภูเก็ต',
  '/พื้นที่ให้บริการ/อุบลราชธานี',
  '/robots.txt', '/llms.txt', '/llms-full.txt', '/sitemap-index.xml',
];
const failures = [];
const notes = [];
const report = {
  checkedAt: new Date().toISOString(), production: PRODUCTION, preview: PREVIEW,
  sitemap: { files: [], productionCount: 0, previewCount: 0, missingInPreview: [], extraInPreview: [] },
  pages: { tested: 0, passed: 0, bad: [], contentDifferenceCount: 0, contentDifferences: [] },
  criticalRoutes: [], slash: [], errors404: [],
  internalLinks: { tested: 0, broken: [] },
  assets: { tested: 0, broken: [] },
  failures, notes,
};

function normalizedPath(input, base = PRODUCTION) {
  try { const u = new URL(input, base); return decodeURIComponent(u.pathname) + u.search; }
  catch { return 'INVALID'; }
}
function xmlLocs(body) {
  return [...body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/giu)].map(m =>
    m[1].trim().replaceAll('&amp;', '&').replaceAll('&#38;', '&'));
}
async function fetchPublic(base, route, withBody = false) {
  const u = new URL(route, base);
  try {
    const response = await fetch(u, {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'AMPHON-Issue54-SEO-Regression/1.0' },
    });
    const type = response.headers.get('content-type') || '';
    const body = withBody && /(?:html|xml|text|json|svg)/i.test(type)
      ? (await response.text()).slice(0, 500000)
      : '';
    return {
      status: response.status, type, body,
      robots: response.headers.get('x-robots-tag') || '',
      cache: response.headers.get('cache-control') || '',
      location: response.headers.get('location') || '',
      nosniff: response.headers.get('x-content-type-options') || '',
    };
  } catch (e) {
    return { status: 0, type: '', body: '', robots: '', cache: '', location: '',
      nosniff: '', error: String(e?.message || e) };
  }
}
async function pooled(items, concurrency, task) {
  let index = 0;
  const results = Array(items.length);
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await task(items[i], i);
    }
  }));
  return results;
}
function tagAttr(tag, attr) {
  const match = tag.match(new RegExp('\\b' + attr + '\\s*=\\s*(["\\x27])([^"\\x27]*)\\1', 'i'));
  return match?.[2]?.replaceAll('&amp;', '&') || '';
}
function meta(html, key, attribute = 'name') {
  for (const t of html.match(/<meta\b[^>]*>/gi) || []) {
    if (tagAttr(t, attribute).toLowerCase() === key.toLowerCase()) return tagAttr(t, 'content');
  }
  return '';
}
function canonical(html) {
  for (const t of html.match(/<link\b[^>]*>/gi) || []) {
    if (tagAttr(t, 'rel').split(/\s+/).includes('canonical')) return tagAttr(t, 'href');
  }
  return '';
}
function pageMeta(body) {
  return {
    title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim(),
    description: meta(body, 'description'),
    canonical: canonical(body),
    schemaCount: (body.match(/application\/ld\+json/gi) || []).length,
  };
}
function routeOf(src, page = '/') {
  if (!src || /^[#\s]/.test(src) || /^(?:data:|blob:|javascript:|mailto:|tel:)/i.test(src)) return '';
  try {
    const u = new URL(src, new URL(page, PREVIEW));
    if (![new URL(PRODUCTION).hostname, new URL(PREVIEW).hostname].includes(u.hostname)) return '';
    return u.pathname + u.search;
  } catch { return ''; }
}
function addFailure(msg) { failures.push(msg); }

// Resolve every sitemap XML file from the production sitemap index, then compare
// canonical URLs listed by both production and preview. Do not assume a route count.
const prodIndex = await fetchPublic(PRODUCTION, '/sitemap-index.xml', true);
const prevIndex = await fetchPublic(PREVIEW, '/sitemap-index.xml', true);
if (prodIndex.status !== 200 || prevIndex.status !== 200) {
  addFailure('sitemap index not HTTP 200 on both origins');
}
const prodParts = xmlLocs(prodIndex.body).map(x => normalizedPath(x));
const prevParts = xmlLocs(prevIndex.body).map(x => normalizedPath(x));
if (prodParts.length < 1 || prevParts.length < 1) addFailure('sitemap index has no sitemap files');
const prodUrls = new Set();
const prevUrls = new Set();
const sitemapPaths = [...new Set([...prodParts, ...prevParts])].sort();
await pooled(sitemapPaths, 5, async path => {
  const [a, b] = await Promise.all([
    fetchPublic(PRODUCTION, path, true), fetchPublic(PREVIEW, path, true)
  ]);
  const prodLocs = xmlLocs(a.body);
  const prevLocs = xmlLocs(b.body);
  for (const x of prodLocs) prodUrls.add(normalizedPath(x));
  for (const x of prevLocs) prevUrls.add(normalizedPath(x));
  report.sitemap.files.push({ path, productionStatus: a.status, previewStatus: b.status,
    productionUrls: prodLocs.length, previewUrls: prevLocs.length });
  if (a.status !== 200 || b.status !== 200) addFailure('sitemap subfile unavailable ' + path);
});
report.sitemap.productionCount = prodUrls.size;
report.sitemap.previewCount = prevUrls.size;
report.sitemap.missingInPreview = [...prodUrls].filter(x => !prevUrls.has(x));
report.sitemap.extraInPreview = [...prevUrls].filter(x => !prodUrls.has(x));
if (prevUrls.size < 500 || prevUrls.size > MAX_PAGES) addFailure('unexpected preview sitemap URL count: ' + prevUrls.size);
if (report.sitemap.missingInPreview.length) {
  addFailure('preview sitemap missing ' + report.sitemap.missingInPreview.length + ' production URLs');
}
if (report.sitemap.extraInPreview.length) {
  // New/changed URLs may reflect source-commit drift between main and Vercel.
  notes.push('preview includes ' + report.sitemap.extraInPreview.length + ' extra URLs; inspect against approved release commit before cutover');
}

const checkUrls = [...new Set([...prevUrls, ...BASELINE_ROUTES])].filter(Boolean);
const htmlForLinks = new Map();
const results = await pooled(checkUrls, 8, async route => {
  const [p, v] = await Promise.all([
    fetchPublic(PRODUCTION, route, true), fetchPublic(PREVIEW, route, true),
  ]);
  const html = v.type.includes('text/html');
  const phtml = p.type.includes('text/html');
  const pm = phtml ? pageMeta(p.body) : null;
  const vm = html ? pageMeta(v.body) : null;
  if (html && (BASELINE_ROUTES.includes(route) || htmlForLinks.size < 30)) {
    htmlForLinks.set(route, v.body);
  }
  const critical = [];
  if (v.status !== 200) critical.push('preview not 200');
  if (p.status !== 200 && prodUrls.has(route)) critical.push('production sitemap route not 200');
  if (!/noindex/i.test(v.robots)) critical.push('preview lacks X-Robots-Tag noindex');
  if (phtml && /noindex/i.test(p.robots)) critical.push('production unexpectedly noindex');
  if (html && !vm.canonical) critical.push('missing canonical');
  if (html && vm.canonical) {
    try {
      const parsed = new URL(vm.canonical);
      if (parsed.origin !== PRODUCTION || normalizedPath(vm.canonical) !== normalizedPath(route)) {
        critical.push('canonical does not equal production URL path');
      }
    } catch { critical.push('invalid canonical URL'); }
  }
  const diff = !!(phtml && html && (
    pm.title !== vm.title || pm.description !== vm.description
    || pm.schemaCount !== vm.schemaCount || pm.canonical !== vm.canonical
  ));
  return { route, productionStatus: p.status, previewStatus: v.status,
    previewNoindex: /noindex/i.test(v.robots), canonical: vm?.canonical || '',
    titleDiff: phtml && html ? pm.title !== vm.title : null,
    descriptionDiff: phtml && html ? pm.description !== vm.description : null,
    schemaDiff: phtml && html ? pm.schemaCount !== vm.schemaCount : null,
    diff, problems: critical, network: v.error || p.error || null };
});
report.pages.tested = results.length;
report.pages.bad = results.filter(x => x.problems.length);
report.pages.passed = results.length - report.pages.bad.length;
report.pages.contentDifferenceCount = results.filter(x => x.diff).length;
report.pages.contentDifferences = results.filter(x => x.diff).slice(0, 40).map(x =>
  ({ route: x.route, titleDiff: x.titleDiff, descriptionDiff: x.descriptionDiff, schemaDiff: x.schemaDiff }));
report.criticalRoutes = results.filter(x => BASELINE_ROUTES.includes(x.route));
if (report.pages.bad.length) addFailure(report.pages.bad.length + ' sitemap/critical route SEO or HTTP failures');
if (report.pages.contentDifferenceCount) notes.push(
  report.pages.contentDifferenceCount + ' pages differ in SEO content between existing Vercel Production and current GitHub main; review release drift');

// Explicit 404/410 tests; a generic Astro 404 page must not turn errors into soft 200.
for (const route of ['/__amp_issue54_missing_page__', '/บริการ/__issue54_not_found__']) {
  const [a, b] = await Promise.all([
    fetchPublic(PRODUCTION, route, true), fetchPublic(PREVIEW, route, true)
  ]);
  const match = a.status === 404 && b.status === 404 && /noindex/i.test(b.robots);
  report.errors404.push({ route, productionStatus: a.status, previewStatus: b.status,
    previewNoindex: /noindex/i.test(b.robots), match });
  if (!match) addFailure('404 page/status/header regression: ' + route);
}

// More than the earlier 4 slash examples, including service and province paths.
const trailing = [
  '/about/', '/contact/', '/บริการ/รับซื้อโน๊ตบุ๊ค/',
  '/บริการ/รับซื้อคอมพิวเตอร์/', '/บริการ/รับซื้อ-macbook/',
  '/บริการ/รับซื้อ-server/', '/บริการ/รับซื้อคอมบริษัท/',
  '/พื้นที่ให้บริการ/', '/พื้นที่ให้บริการ/ภูเก็ต/',
  '/พื้นที่ให้บริการ/อุบลราชธานี/',
];
await pooled(trailing, 5, async route => {
  const [a, b] = await Promise.all([
    fetchPublic(PRODUCTION, route), fetchPublic(PREVIEW, route),
  ]);
  const target = normalizedPath(route.slice(0, -1));
  const ok = a.status === 308 && b.status === 308 &&
    normalizedPath(b.location, PREVIEW) === target;
  report.slash.push({ route, productionStatus: a.status, previewStatus: b.status,
    destination: b.location, ok });
  if (!ok) addFailure('trailing slash 308 mismatch ' + route);
});

// Use links and image/script/style assets from rendered Preview HTML. Verify they
// resolve *on the preview origin*, not merely on the still-live Vercel origin.
const linkRoutes = new Set();
const assetRoutes = new Set();
for (const [path, html] of htmlForLinks) {
  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const href = tagAttr(tag, 'href');
    const route = routeOf(href, path);
    if (route && !route.includes('/api/') && !route.includes('?') && route !== path) linkRoutes.add(route);
  }
  for (const tag of html.match(/<(?:img|source|script|link)\b[^>]*>/gi) || []) {
    let raw = tagAttr(tag, 'src') || tagAttr(tag, 'href');
    if (/<link/i.test(tag) && !/stylesheet|icon|preload/i.test(tagAttr(tag, 'rel'))) continue;
    if (!raw && tagAttr(tag, 'srcset')) raw = tagAttr(tag, 'srcset').split(',')[0].trim().split(/\s+/)[0];
    const route = routeOf(raw, path);
    if (route && !route.includes('?')) assetRoutes.add(route);
  }
}
const links = [...linkRoutes].slice(0, 150);
const linkChecks = await pooled(links, 8, async path => {
  const x = await fetchPublic(PREVIEW, path);
  return { path, status: x.status, broken: x.status === 0 || x.status === 404 || x.status >= 500 };
});
report.internalLinks.tested = linkChecks.length;
report.internalLinks.broken = linkChecks.filter(x => x.broken);
if (report.internalLinks.broken.length) {
  addFailure(report.internalLinks.broken.length + ' broken internal link paths in preview');
}

const assets = [...assetRoutes].slice(0, 100);
const assetChecks = await pooled(assets, 8, async path => {
  const x = await fetchPublic(PREVIEW, path);
  return { path, status: x.status, contentType: x.type,
    broken: x.status !== 200 || /text\/html/i.test(x.type) };
});
report.assets.tested = assetChecks.length;
report.assets.broken = assetChecks.filter(x => x.broken);
if (report.assets.broken.length) {
  addFailure(report.assets.broken.length + ' missing/bad static assets in preview');
}

fs.mkdirSync('artifacts/cloudflare-migration', { recursive: true });
fs.writeFileSync('artifacts/cloudflare-migration/seo-regression.json',
  JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('=== ISSUE54 LIVE PREVIEW SEO REGRESSION ===');
console.log(JSON.stringify({
  sitemap: report.sitemap, pages: {
    tested: report.pages.tested, passed: report.pages.passed,
    bad: report.pages.bad.slice(0, 15),
    contentDifferenceCount: report.pages.contentDifferenceCount,
  }, errors404: report.errors404, slash: report.slash,
  internalLinks: report.internalLinks, assets: report.assets,
  failures, notes,
}, null, 2));
assert.equal(failures.length, 0, failures.join('\n'));
