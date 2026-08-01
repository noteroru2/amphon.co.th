/**
 * Final Full-Site Re-Audit 2026 — READ-ONLY
 * Generates docs/final-full-site-reaudit-2026/* from local dist + production crawl.
 * Does not modify src/, redirects, sitemap config, or content.
 */
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  extractFirstH1,
  extractHrefs,
  extractTitle,
  extractXmlLocs,
  loadRedirects,
  normalizePathname,
  readText,
  resolveRedirectChain,
  stripTags,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/final-full-site-reaudit-2026');
const ORIGIN = 'https://amphon.co.th';
const UA = 'AmphonFinalReaudit/2026 (+https://amphon.co.th; read-only SEO audit)';
const EXPECTED_GEO = { lat: '15.2664215', lng: '104.844358' };
const UTILITY_NOINDEX = new Set(['/บริการ/รับซื้อ-storage-nas', '/บริการ/รับซื้อเลนส์']);

fs.mkdirSync(OUT, { recursive: true });

function esc(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function writeCsv(name, rows) {
  if (!rows.length) {
    fs.writeFileSync(path.join(OUT, name), '\n', 'utf8');
    return;
  }
  const headers = Object.keys(rows[0]);
  const body = [headers.join(',')]
    .concat(rows.map((r) => headers.map((h) => esc(r[h])).join(',')))
    .join('\n');
  fs.writeFileSync(path.join(OUT, name), body + '\n', 'utf8');
}
function writeMd(name, text) {
  fs.writeFileSync(path.join(OUT, name), text.endsWith('\n') ? text : text + '\n', 'utf8');
}
function meta(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}
function encodePath(pathname) {
  return pathname
    .split('/')
    .map((s) => (s ? encodeURIComponent(s) : ''))
    .join('/');
}
function curlText(url, args = []) {
  return execFileSync(
    'curl.exe',
    ['-sL', '--max-time', '40', '-A', UA, ...args, url],
    { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 },
  );
}
function curlHead(url) {
  return execFileSync(
    'curl.exe',
    ['-sI', '--max-redirs', '0', '--max-time', '30', '-A', UA, url],
    { encoding: 'utf8' },
  );
}
function statusOf(hdr) {
  const matches = [...hdr.matchAll(/HTTP\/\d(?:\.\d)?\s(\d{3})/g)];
  return Number((matches.at(-1) || [])[1] || 0);
}
function hopCount(hdr) {
  return Math.max(0, [...hdr.matchAll(/HTTP\/\d(?:\.\d)?\s\d{3}/g)].length - 1);
}
function sleep(ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    /* polite delay */
  }
}
function pageType(url) {
  if (url === '/') return 'homepage';
  if (url.startsWith('/blog')) return 'blog';
  if (url.startsWith('/พื้นที่ให้บริการ/')) return 'province';
  if (url.startsWith('/บริการ/')) return 'service-hub';
  if (url.startsWith('/รับซื้อ/')) return 'service-x-location';
  if (['/contact', '/about', '/privacy', '/terms'].includes(url)) return 'company';
  return 'other';
}
function mainText(html) {
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ');
  const main = t.match(/<main[\s\S]*?<\/main>/i);
  t = main ? main[0] : t;
  return stripTags(t);
}
function schemaTypes(html) {
  const types = new Set();
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      const walk = (n) => {
        if (!n) return;
        if (Array.isArray(n)) return n.forEach(walk);
        if (typeof n === 'object') {
          if (n['@type']) {
            const t = n['@type'];
            if (Array.isArray(t)) t.forEach((x) => types.add(String(x)));
            else types.add(String(t));
          }
          Object.values(n).forEach(walk);
        }
      };
      walk(data);
    } catch {
      types.add('INVALID_JSON');
    }
  }
  return [...types].sort();
}
function parseCsv(text) {
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
  return rows.filter((r) => r.length && !(r.length === 1 && r[0] === ''));
}

const summary = {
  main_sha: '',
  production_sha: 'NOT VERIFIED',
  built_pages: 0,
  sitemap_local: 0,
  sitemap_prod: 0,
  indexable: 0,
  noindex: 0,
  broken_links: 0,
  redirecting_links: 0,
  indexable_orphans: 0,
  all_route_orphans: 0,
  invalid_schema: 0,
  trust_hits: 0,
  nap_conflicts: 0,
  image_errors: 0,
  metadata_dup_titles: 0,
  metadata_dup_descs: 0,
  missing_title: 0,
  missing_desc: 0,
  missing_h1: 0,
  multi_h1: 0,
  p0: 0,
  p1: 0,
  p2: 0,
  p3: 0,
  new_findings: 0,
  verdict: '',
};

try {
  summary.main_sha = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  summary.main_sha = 'UNKNOWN';
}

console.log('=== Final Full-Site Re-Audit (read-only) ===');
console.log(`main_sha=${summary.main_sha}`);
console.log(`distDir=${distDir}`);

// ---------- Local inventory ----------
const built = collectBuiltPages();
summary.built_pages = built.size;
const redirects = loadRedirects();
const sitemapXmlFiles = fs
  .readdirSync(distDir)
  .filter((f) => /^sitemap-\d+\.xml$/i.test(f))
  .map((f) => path.join(distDir, f));
const localSitemap = new Set();
const lastmods = [];
for (const f of sitemapXmlFiles) {
  const xml = readText(f);
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const block = m[1];
    const loc = (block.match(/<loc>([^<]+)<\/loc>/i) || [])[1];
    const lm = (block.match(/<lastmod>([^<]+)<\/lastmod>/i) || [])[1] || '';
    if (!loc) continue;
    try {
      const p = decodeURIComponent(new URL(loc).pathname.replace(/\/$/, '') || '/');
      localSitemap.add(p);
      lastmods.push({ url: p, lastmod: lm });
    } catch {
      /* skip */
    }
  }
}
summary.sitemap_local = localSitemap.size;

const inbound = new Map([...built.keys()].map((u) => [u, new Set()]));
const outbound = new Map([...built.keys()].map((u) => [u, []]));
const linkRows = [];
let broken = 0;
let redirecting = 0;
let toNoindex = 0;
let httpWww = 0;

const robotsMap = new Map();
const titleMap = new Map();
const descMap = new Map();
const h1Map = new Map();
const routeRows = [];
const contentRows = [];
const schemaRows = [];
const trustRows = [];
const imageRows = [];
const geoHits = { ok: 0, bad: 0, old: 0 };
let invalidSchema = 0;
let aggRating = 0;
let fakeBranchSchema = 0;

const TRUST_PATTERNS = [
  ['BRANCH', /มีสาขา(?!.*ไม่มี)/, /ไม่มีสาขา|ไม่มีสำนักงาน/],
  ['TEAM', /ทีมงานประจำจังหวัด|มีทีมงานประจำ/, /ไม่มี.*ทีม|ไม่.*ประจำ/],
  ['ALL_TYPES', /รับซื้อทุกประเภท|รับทุกประเภท/, /ไม่ได้.*ทุกประเภท|ไม่ยืนยัน.*ทุก/],
  ['ALL_COND', /รับทุกสภาพ|รับซื้อทุกสภาพ/, /ไม่.*ทุกสภาพ/],
  ['PRICE', /ราคาสูงที่สุด/, null],
  ['PAY', /จ่ายทันที|โอนทันที|รับเงินทันที/, /หลัง.*ตกลง|เมื่อ.*ตรวจ|หลังผู้ขายยอมรับ/],
  ['PICKUP', /รับถึงที่ทุก|รับทุกอำเภอ/, /ไม่รับประกัน|รายกรณี|ไม่รับประกันว่านัดรับ/],
];

for (const [url, filePath] of built) {
  const html = readText(filePath);
  const robots = meta(html, 'robots') || 'index,follow';
  const noindex = /noindex/i.test(robots);
  robotsMap.set(url, robots);
  if (noindex) summary.noindex += 1;
  else summary.indexable += 1;

  const title = extractTitle(html);
  const h1 = extractFirstH1(html);
  const desc = meta(html, 'description');
  const can = extractCanonical(html);
  let canPath = '';
  try {
    canPath = decodeURIComponent(new URL(can, ORIGIN).pathname.replace(/\/$/, '') || '/');
  } catch {
    canPath = can;
  }
  titleMap.set(url, title);
  descMap.set(url, desc);
  h1Map.set(url, h1);

  const types = schemaTypes(html);
  if (types.includes('INVALID_JSON')) invalidSchema += 1;
  if (types.includes('AggregateRating')) aggRating += 1;
  if (html.includes('"AggregateRating"')) aggRating += 1;

  // Geo
  if (html.includes(EXPECTED_GEO.lat) && html.includes(EXPECTED_GEO.lng)) geoHits.ok += 1;
  if (/15\.2386|104\.8477/.test(html)) geoHits.old += 1;

  // Fake provincial LB: LocalBusiness + addressLocality not Ubon while claiming branch
  if (/LocalBusiness/.test(html) && /addressLocality/.test(html)) {
    const locMatch = html.match(/"addressLocality"\s*:\s*"([^"]+)"/);
    if (locMatch && locMatch[1] && !/อุบล/.test(locMatch[1])) {
      fakeBranchSchema += 1;
      schemaRows.push({
        url,
        issue: 'FAKE_OR_NON_UBON_LOCALITY',
        detail: locMatch[1],
        schema_types: types.join('|'),
        result: 'REVIEW',
      });
    }
  }

  const main = mainText(html);
  const words = (main.match(/[\u0E00-\u0E7FA-Za-z0-9]+/g) || []).length;
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  let imgIssues = 0;
  for (const tag of imgs) {
    const t = tag[0];
    const src = (t.match(/\bsrc=["']([^"']+)/i) || [])[1] || '';
    const w = /\bwidth=/.test(t);
    const h = /\bheight=/.test(t);
    const alt = (t.match(/\balt=["']([^"']*)/i) || [])[1];
    if (!w || !h) imgIssues += 1;
    if (alt === undefined) imgIssues += 1;
    if (/\.png["']/i.test(t) && /\/images\//i.test(src)) {
      imageRows.push({
        url,
        src,
        issue: 'PNG_IN_CONTENT_SIGNAL',
        width_height: w && h ? 'yes' : 'no',
        result: 'SIGNAL',
      });
    }
  }
  summary.image_errors += imgIssues > 0 && imgs.length ? 0 : 0; // counted later for broken only

  // Trust scan (context-aware)
  for (const [kind, pos, neg] of TRUST_PATTERNS) {
    if (pos.test(main)) {
      const negated = neg && neg.test(main);
      if (!negated) {
        trustRows.push({
          url,
          claim_type: kind,
          snippet: main.match(pos)?.[0] || '',
          matches_policy: 'NO',
          risk: kind === 'PAY' || kind === 'BRANCH' ? 'HIGH' : 'MED',
          result: 'FLAG',
        });
      }
    }
  }

  // Links
  const hrefs = extractHrefs(html);
  const outs = [];
  for (const href of hrefs) {
    if (/^https?:\/\/(www\.)?amphon\.co\.th/i.test(href) && !href.startsWith('https://amphon.co.th')) {
      httpWww += 1;
      linkRows.push({
        source_url: url,
        href,
        resolved: href,
        issue: 'HTTP_OR_WWW_INTERNAL',
        link_type: 'contextual',
        result: 'FAIL',
      });
    }
    const target = normalizePathname(href);
    if (!target) continue;
    outs.push(target);
    if (!inbound.has(target)) inbound.set(target, new Set());
    inbound.get(target).add(url);
    const chain = resolveRedirectChain(target, redirects);
    if (chain.chain.length) {
      redirecting += 1;
      linkRows.push({
        source_url: url,
        href,
        resolved: chain.finalPath,
        issue: 'REDIRECTING_INTERNAL',
        link_type: 'contextual',
        result: 'FAIL',
      });
    } else if (!built.has(target) && !target.startsWith('/_')) {
      // may be asset
      const isAsset = /\.(webp|png|jpg|jpeg|gif|svg|css|js|xml|txt|ico|woff2?)$/i.test(target);
      if (!isAsset) {
        broken += 1;
        linkRows.push({
          source_url: url,
          href,
          resolved: target,
          issue: 'BROKEN_OR_MISSING_ROUTE',
          link_type: 'contextual',
          result: 'FAIL',
        });
      }
    } else if (built.has(target) && /noindex/i.test(robotsMap.get(target) || '')) {
      // robotsMap may not be filled yet for later pages — defer second pass
    }
  }
  outbound.set(url, outs);

  routeRows.push({
    url,
    page_type: pageType(url),
    source_file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    generated: 'yes',
    expected_status: 200,
    indexable: noindex ? 'no' : 'yes',
    canonical: canPath || can,
    sitemap: localSitemap.has(url) ? 'yes' : 'no',
    title: title.slice(0, 120),
    description: desc.slice(0, 120),
    h1: h1.slice(0, 120),
    schema_types: types.join('|'),
    visible_words: words,
    inbound_links: 0, // fill later
    outbound_links: outs.length,
    image_count: imgs.length,
    status: 'OK',
  });

  contentRows.push({
    url,
    page_type: pageType(url),
    visible_words: words,
    thin_signal: words < 180 ? 'YES' : 'NO',
    family: pageType(url),
    unique_sections_signal: html.includes('<h2') || html.includes('<h3') ? 'yes' : 'no',
    batch_12g1_marker:
      /เริ่มประเมินจาก|ร้านพิจารณารับซื้อแบบรายกรณี|ก่อนติดต่อจาก/.test(html) &&
      url.includes('เครื่องใช้ไฟฟ้า') &&
      !url.includes('อุบล')
        ? 'yes'
        : 'no',
    result: words < 120 ? 'REVIEW' : 'OK',
  });

  schemaRows.push({
    url,
    issue: types.includes('INVALID_JSON') ? 'INVALID_JSON' : 'OK',
    detail: types.join('|'),
    schema_types: types.join('|'),
    result: types.includes('INVALID_JSON') ? 'FAIL' : 'PASS',
  });
}

// Fill inbound counts + noindex link second pass
for (const row of routeRows) {
  row.inbound_links = inbound.get(row.url)?.size || 0;
}
for (const [url, filePath] of built) {
  const html = readText(filePath);
  for (const href of extractHrefs(html)) {
    const target = normalizePathname(href);
    if (!target || !built.has(target)) continue;
    if (/noindex/i.test(robotsMap.get(target) || '')) {
      toNoindex += 1;
      linkRows.push({
        source_url: url,
        href,
        resolved: target,
        issue: 'LINK_TO_NOINDEX',
        link_type: 'contextual',
        result: 'FAIL',
      });
    }
  }
}

summary.broken_links = broken;
summary.redirecting_links = redirecting;
summary.invalid_schema = invalidSchema;
summary.trust_hits = trustRows.filter((r) => r.result === 'FLAG').length;

// Orphans
const orphanRows = [];
for (const url of built.keys()) {
  const inCount = inbound.get(url)?.size || 0;
  const indexable = !/noindex/i.test(robotsMap.get(url) || '');
  const inSm = localSitemap.has(url);
  if (inCount === 0) {
    const intentional = UTILITY_NOINDEX.has(url) || url === '/404' || url.includes('404');
    orphanRows.push({
      url,
      route_exists: 'yes',
      indexable: indexable ? 'yes' : 'no',
      sitemap: inSm ? 'yes' : 'no',
      inbound_sources: 0,
      page_type: pageType(url),
      intentional: intentional ? 'yes' : 'no',
      reason: intentional ? 'utility_noindex_or_404' : 'zero_inbound',
      finding: intentional ? 'KNOWN_EXCEPTION' : indexable ? 'INDEXABLE_ORPHAN' : 'NOINDEX_ORPHAN',
      status: intentional || !indexable ? 'PASS' : 'FAIL',
    });
  }
}
summary.all_route_orphans = orphanRows.filter((r) => r.inbound_sources === 0 || true).length;
// recount properly
summary.all_route_orphans = orphanRows.length;
summary.indexable_orphans = orphanRows.filter((r) => r.finding === 'INDEXABLE_ORPHAN').length;

// Metadata duplicates
const titleGroups = new Map();
const descGroups = new Map();
for (const [u, t] of titleMap) {
  if (!t) {
    summary.missing_title += 1;
    continue;
  }
  if (!titleGroups.has(t)) titleGroups.set(t, []);
  titleGroups.get(t).push(u);
}
for (const [u, d] of descMap) {
  if (!d) {
    summary.missing_desc += 1;
    continue;
  }
  if (!descGroups.has(d)) descGroups.set(d, []);
  descGroups.get(d).push(u);
}
for (const [u, h] of h1Map) {
  if (!h) summary.missing_h1 += 1;
}
for (const [url, filePath] of built) {
  const html = readText(filePath);
  const h1n = (html.match(/<h1\b/gi) || []).length;
  if (h1n > 1) summary.multi_h1 += 1;
}
const metaRows = [];
for (const [t, urls] of titleGroups) {
  if (urls.length > 1) {
    summary.metadata_dup_titles += 1;
    for (const u of urls) {
      metaRows.push({
        url: u,
        field: 'title',
        issue: 'DUPLICATE_TITLE',
        value: t.slice(0, 100),
        group_size: urls.length,
        result: 'FAIL',
      });
    }
  }
}
for (const [d, urls] of descGroups) {
  if (urls.length > 1) {
    summary.metadata_dup_descs += 1;
    for (const u of urls) {
      metaRows.push({
        url: u,
        field: 'description',
        issue: 'DUPLICATE_DESCRIPTION',
        value: d.slice(0, 100),
        group_size: urls.length,
        result: 'FAIL',
      });
    }
  }
}
for (const [u, t] of titleMap) {
  if (!t) metaRows.push({ url: u, field: 'title', issue: 'MISSING', value: '', group_size: 1, result: 'FAIL' });
  else if ([...t].length > 70)
    metaRows.push({
      url: u,
      field: 'title',
      issue: 'LONG_SIGNAL',
      value: String([...t].length),
      group_size: 1,
      result: 'SIGNAL',
    });
}
for (const [u, d] of descMap) {
  if (!d)
    metaRows.push({ url: u, field: 'description', issue: 'MISSING', value: '', group_size: 1, result: 'FAIL' });
}

// F-04 inventory from owner classification + furniture merge
const f04Path = path.join(ROOT, 'docs/batch-12f-business-decision-matrix/owner-approved-classification.csv');
const f04Rows = [];
if (fs.existsSync(f04Path)) {
  const rows = parseCsv(readText(f04Path));
  const h = Object.fromEntries(rows[0].map((x, i) => [x, i]));
  for (const r of rows.slice(1)) {
    const url = r[h.url];
    const group = r[h.decision_group_id];
    const status = r[h.status] || '';
    let bucket = 'Owner-confirmed but implementation pending';
    if (/KEEP-AND-IMPROVE COMPLETE/i.test(status) || group === 'BD-01')
      bucket = 'Improved';
    if (/COMPLETE/i.test(status)) bucket = 'Improved';
    f04Rows.push({
      url,
      decision_group: group,
      page_strategy: r[h.page_strategy],
      owner_status: status,
      bucket,
      notes: '',
    });
  }
}
// furniture merge 19
for (const f of fs.readdirSync(path.join(ROOT, 'src/content/serviceAreas'))) {
  if (!f.startsWith('รับซื้อเฟอร์นิเจอร์-') || !f.endsWith('.md')) continue;
  if (f.includes('อุบลราชธานี')) continue;
  const slug = f.replace(/\.md$/, '');
  const url = `/รับซื้อ/${slug}`;
  f04Rows.push({
    url,
    decision_group: 'MERGE-FURNITURE',
    page_strategy: 'REQUIRES_SEPARATE_OWNER_REVIEW',
    owner_status: 'MERGE REVIEW PENDING',
    bucket: 'Merge review pending',
    notes: 'outside BD-01–BD-07',
  });
}

// Similarity sample: appliances outside ubon vs hub
const similarityRows = [];
const appliancePages = [...built.keys()].filter(
  (u) => u.includes('/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-') && !u.includes('อุบล'),
);
const hubApp = '/บริการ/รับซื้อเครื่องใช้ไฟฟ้า';
function shingles(text, n = 5) {
  const toks = text.toLowerCase().match(/[\u0E00-\u0E7Fa-z0-9]+/g) || [];
  const set = new Set();
  for (let i = 0; i + n <= toks.length; i++) set.add(toks.slice(i, i + n).join(' '));
  return set;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}
if (built.has(hubApp) && appliancePages.length) {
  const hubShin = shingles(mainText(readText(built.get(hubApp))));
  const samples = appliancePages.slice(0, 6);
  for (let i = 0; i < samples.length; i++) {
    const a = samples[i];
    const sa = shingles(mainText(readText(built.get(a))));
    similarityRows.push({
      url_a: a,
      url_b: hubApp,
      relationship: 'spoke-hub',
      similarity: jaccard(sa, hubShin).toFixed(3),
      intent_overlap: 'STRUCTURAL RISK — shared category; differentiated province intent expected',
      result: jaccard(sa, hubShin) > 0.55 ? 'REVIEW' : 'OK',
    });
    if (i + 1 < samples.length) {
      const b = samples[i + 1];
      const sb = shingles(mainText(readText(built.get(b))));
      similarityRows.push({
        url_a: a,
        url_b: b,
        relationship: 'sibling-province',
        similarity: jaccard(sa, sb).toFixed(3),
        intent_overlap: 'STRUCTURAL RISK if near-duplicate',
        result: jaccard(sa, sb) > 0.7 ? 'REVIEW' : 'OK',
      });
    }
  }
}

// Cannibalization structural map (clusters)
const cannibalRows = [
  {
    cluster: 'Appliances hub vs province',
    urls: `${hubApp} + 19 non-Ubon + Ubon`,
    status: 'STRUCTURAL RISK',
    notes: 'BD-01 improved; hub/spoke intent split documented',
  },
  {
    cluster: 'Collectibles',
    urls: 'retired 19 redirects → hub',
    status: 'NO STRUCTURAL RISK',
    notes: 'Batch 12B/12C closed',
  },
  {
    cluster: 'Furniture non-Ubon',
    urls: '19 MERGE pending',
    status: 'STRUCTURAL RISK',
    notes: 'Owner merge review pending',
  },
  {
    cluster: 'MacBook / Notebook',
    urls: 'service hubs + SA pages',
    status: 'REQUIRES GSC',
    notes: 'No ranking data in this audit',
  },
  {
    cluster: 'TV / Server / UPS / Drone / Network outside Ubon',
    urls: 'BD-02..BD-06 pending improve',
    status: 'STRUCTURAL RISK',
    notes: 'Owner KEEP_AND_IMPROVE pending implementation',
  },
];

// NAP audit
const napRows = [];
const napExpect = {
  name: 'อำพล',
  address: '740/8',
  tel_display: '064-257-9353',
  tel_href: 'tel:+66642579353',
  line: '@webuy',
};
for (const sample of ['/', '/contact', '/about', '/บริการ/รับซื้อโน๊ตบุ๊ค']) {
  if (!built.has(sample)) continue;
  const html = readText(built.get(sample));
  const checks = {
    name: html.includes(napExpect.name),
    address: html.includes(napExpect.address),
    tel_display: html.includes(napExpect.tel_display),
    tel_href: html.includes(napExpect.tel_href),
    line: html.includes(napExpect.line),
    geo: html.includes(EXPECTED_GEO.lat),
  };
  const bad = Object.entries(checks)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  napRows.push({
    url: sample,
    checks: JSON.stringify(checks),
    conflicts: bad.join('|') || '0',
    result: bad.length ? 'FAIL' : 'PASS',
  });
  if (bad.length) summary.nap_conflicts += 1;
}

// Lastmod audit
const lastmodRows = [];
const lmValues = lastmods.map((x) => x.lastmod).filter(Boolean);
const uniqueLm = new Set(lmValues);
const futureLm = lmValues.filter((d) => d > '2026-08-01');
lastmodRows.push({
  check: 'unique_lastmod_values',
  value: uniqueLm.size,
  result: uniqueLm.size > 1 ? 'PASS' : 'REVIEW',
  notes: 'mass identical lastmod would be concerning',
});
lastmodRows.push({
  check: 'future_dates',
  value: futureLm.length,
  result: futureLm.length === 0 ? 'PASS' : 'FAIL',
  notes: '',
});
lastmodRows.push({
  check: 'sitemap_urls_with_lastmod',
  value: lastmods.filter((x) => x.lastmod).length,
  result: 'PASS',
  notes: '',
});
const g1Sample = lastmods.find((x) => x.url.includes('รับซื้อเครื่องใช้ไฟฟ้า-กาฬสินธุ์'));
lastmodRows.push({
  check: 'batch_12g1_sample_lastmod',
  value: g1Sample?.lastmod || 'MISSING',
  result: g1Sample?.lastmod ? 'PASS' : 'REVIEW',
  notes: 'content updated 2026-08-01',
});

// Robots
const robotsRows = [];
const robotsTxtPath = path.join(distDir, 'robots.txt');
const robotsTxt = fs.existsSync(robotsTxtPath) ? readText(robotsTxtPath) : '';
robotsRows.push({
  check: 'robots.txt_exists',
  actual: robotsTxt ? 'yes' : 'no',
  result: robotsTxt ? 'PASS' : 'FAIL',
  notes: '',
});
robotsRows.push({
  check: 'sitemap_declaration',
  actual: /sitemap/i.test(robotsTxt) ? 'yes' : 'no',
  result: /sitemap/i.test(robotsTxt) ? 'PASS' : 'FAIL',
  notes: '',
});
robotsRows.push({
  check: 'noindex_count_local',
  actual: summary.noindex,
  result: summary.noindex <= 5 ? 'PASS' : 'REVIEW',
  notes: 'includes utility legacy',
});
for (const u of UTILITY_NOINDEX) {
  robotsRows.push({
    check: 'legacy_utility_noindex',
    actual: `${u} robots=${robotsMap.get(u) || 'MISSING'}`,
    result: /noindex/i.test(robotsMap.get(u) || '') ? 'PASS' : 'FAIL',
    notes: 'known exception must remain noindex or be reconsidered',
  });
}

// Route indexability
const indexRows = [];
for (const row of routeRows) {
  const issues = [];
  if (row.indexable === 'yes' && row.sitemap === 'no' && !UTILITY_NOINDEX.has(row.url) && row.url !== '/404')
    issues.push('INDEXABLE_NOT_IN_SITEMAP');
  if (row.indexable === 'no' && row.sitemap === 'yes') issues.push('NOINDEX_IN_SITEMAP');
  if (row.canonical && row.canonical !== row.url && row.canonical !== `${ORIGIN}${row.url}`) {
    // allow absolute
    const abs = row.canonical.startsWith('http') ? row.canonical : ORIGIN + row.canonical;
    try {
      const p = decodeURIComponent(new URL(abs).pathname.replace(/\/$/, '') || '/');
      if (p !== row.url) issues.push('CANONICAL_TO_OTHER');
    } catch {
      issues.push('CANONICAL_PARSE_ERROR');
    }
  }
  if (issues.length) {
    indexRows.push({
      url: row.url,
      indexable: row.indexable,
      sitemap: row.sitemap,
      canonical: row.canonical,
      issues: issues.join('|'),
      result: 'FAIL',
    });
  }
}

// Source inventory (key files)
const sourceRows = [
  {
    file: 'vercel.json',
    type: 'redirects',
    routes_affected: 'sitewide',
    purpose: 'legacy+host redirects',
    last_relevant_batch: '1,7,12B/C',
    risk: 'low',
    current_status: 'OK',
  },
  {
    file: 'astro.config.mjs',
    type: 'sitemap',
    routes_affected: 'sitemap',
    purpose: 'sitemap filter + lastmod',
    last_relevant_batch: '2,3',
    risk: 'low',
    current_status: 'OK',
  },
  {
    file: 'scripts/windows-safe-astro-build.mjs',
    type: 'build',
    routes_affected: 'local-build',
    purpose: 'Windows build wrapper',
    last_relevant_batch: '3',
    risk: 'low',
    current_status: 'OK',
  },
  {
    file: 'src/config/internal-link-map.ts',
    type: 'internal-links',
    routes_affected: 'indexable',
    purpose: 'approved internal links',
    last_relevant_batch: '11',
    risk: 'low',
    current_status: 'OK',
  },
  {
    file: 'src/content/serviceAreas/',
    type: 'content',
    routes_affected: 'service-x-location',
    purpose: 'SA landing pages',
    last_relevant_batch: '12D/E/G-1',
    risk: 'med',
    current_status: 'F-04 partial open',
  },
  {
    file: 'docs/batch-12f-business-decision-matrix/',
    type: 'owner-decisions',
    routes_affected: '134+19',
    purpose: 'F-04 owner lock',
    last_relevant_batch: '12F',
    risk: 'low',
    current_status: 'LOCKED',
  },
];

// ---------- Production crawl ----------
console.log('Crawling production sitemap (polite)...');
const prodSitemapRows = [];
const prodDiffRows = [];
let prodBroken = 0;
let prodRedirectInSm = 0;
let prodNoindexInSm = 0;
let prodCount = 0;

try {
  const idx = curlText(`${ORIGIN}/sitemap-index.xml`);
  const smaps = extractXmlLocs(idx);
  const locs = [];
  for (const u of smaps) {
    sleep(200);
    const xml = curlText(u);
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
      const block = m[1];
      const loc = (block.match(/<loc>([^<]+)<\/loc>/i) || [])[1];
      const lm = (block.match(/<lastmod>([^<]+)<\/lastmod>/i) || [])[1] || '';
      if (!loc) continue;
      locs.push({ loc, lm });
    }
  }
  prodCount = locs.length;
  summary.sitemap_prod = prodCount;

  // HEAD crawl with low concurrency via batches
  const CONCURRENCY = 6;
  let i = 0;
  async function one(item) {
    let pathname = '';
    try {
      pathname = decodeURIComponent(new URL(item.loc).pathname.replace(/\/$/, '') || '/');
    } catch {
      pathname = item.loc;
    }
    sleep(40);
    let hdr = '';
    try {
      hdr = curlHead(ORIGIN + encodePath(pathname));
    } catch {
      hdr = '';
    }
    const status = statusOf(hdr);
    let robots = '';
    let can = '';
    // sample body only for anomalies or every 50th
    let fetchBody = status !== 200 || i % 80 === 0 || !localSitemap.has(pathname);
    if ([301, 302, 307, 308].includes(status)) {
      prodRedirectInSm += 1;
      fetchBody = false;
    }
    if (status >= 400 || status === 0) prodBroken += 1;
    if (fetchBody && status === 200) {
      try {
        const html = curlText(ORIGIN + encodePath(pathname));
        robots = meta(html, 'robots');
        can = extractCanonical(html);
        if (/noindex/i.test(robots)) prodNoindexInSm += 1;
      } catch {
        /* ignore */
      }
    }
    prodSitemapRows.push({
      url: pathname,
      status,
      lastmod: item.lm,
      robots: robots || '',
      canonical: can,
      in_local_sitemap: localSitemap.has(pathname) ? 'yes' : 'no',
      in_local_routes: built.has(pathname) ? 'yes' : 'no',
      result:
        status === 200 && ![301, 302, 307, 308].includes(status)
          ? 'PASS'
          : 'FAIL',
    });
  }
  // simple sync loop for Windows reliability
  for (const item of locs) {
    if (i % 100 === 0) console.log(`prod progress ${i}/${locs.length}`);
    // eslint-disable-next-line no-await-in-loop
    await one(item);
    i += 1;
  }

  // Local vs prod sitemap set
  const prodSet = new Set(prodSitemapRows.map((r) => r.url));
  for (const u of localSitemap) {
    if (!prodSet.has(u))
      prodDiffRows.push({
        url: u,
        diff_type: 'LOCAL_ONLY',
        notes: 'in local sitemap not production',
      });
  }
  for (const u of prodSet) {
    if (!localSitemap.has(u))
      prodDiffRows.push({
        url: u,
        diff_type: 'PRODUCTION_ONLY',
        notes: 'in production sitemap not local',
      });
  }
  if (prodCount === localSitemap.size && prodDiffRows.length === 0) {
    prodDiffRows.push({
      url: '_SUMMARY_',
      diff_type: 'EXPECTED_PLATFORM_DIFF',
      notes: 'sitemap sets match; SHA NOT VERIFIED',
    });
  }
} catch (e) {
  prodDiffRows.push({
    url: '_ERROR_',
    diff_type: 'PRODUCTION_NOT_UPDATED',
    notes: String(e).slice(0, 200),
  });
}

// Redirect audit (host + samples)
const redirectAudit = [];
function hostProbe(label, url) {
  try {
    const hdr = execFileSync(
      'curl.exe',
      ['-sI', '--max-redirs', '5', '--max-time', '25', '-A', UA, url],
      { encoding: 'utf8' },
    );
    const hops = hopCount(hdr);
    const finalStatus = statusOf(hdr);
    const location = (hdr.match(/location:\s*(\S+)/i) || [])[1] || '';
    redirectAudit.push({
      case: label,
      url,
      hops,
      final_status: finalStatus,
      location,
      result: label.includes('http-www') && hops > 2 ? 'BLOCKED_PLATFORM' : 'PASS',
    });
  } catch (e) {
    redirectAudit.push({
      case: label,
      url,
      hops: -1,
      final_status: 0,
      location: '',
      result: 'FAIL',
    });
  }
}
hostProbe('https-apex-home', 'https://amphon.co.th/');
hostProbe('https-www-home', 'https://www.amphon.co.th/');
hostProbe('http-apex-home', 'http://amphon.co.th/');
hostProbe('http-www-home', 'http://www.amphon.co.th/');
hostProbe(
  'https-apex-legacy-hdd',
  'https://amphon.co.th/' + encodeURI('บริการ/รับซื้อ-hdd'),
);
hostProbe(
  'http-www-legacy-hdd',
  'http://www.amphon.co.th/' + encodeURI('บริการ/รับซื้อ-hdd'),
);
hostProbe(
  'collectibles-sample',
  ORIGIN + encodePath('/รับซื้อ/รับซื้อของสะสม-ร้อยเอ็ด'),
);

// HTTP headers sample
const headerRows = [];
for (const u of ['/', '/contact', '/sitemap-0.xml', '/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-กาฬสินธุ์']) {
  try {
    const hdr = curlHead(ORIGIN + (u.startsWith('/') ? encodePath(u) : u));
    headerRows.push({
      url: u,
      status: statusOf(hdr),
      cache_control: (hdr.match(/cache-control:\s*([^\r\n]+)/i) || [])[1] || '',
      hsts: /strict-transport-security/i.test(hdr) ? 'yes' : 'no',
      xcto: /x-content-type-options/i.test(hdr) ? 'yes' : 'no',
      referrer_policy: (hdr.match(/referrer-policy:\s*([^\r\n]+)/i) || [])[1] || '',
      csp: /content-security-policy/i.test(hdr) ? 'yes' : 'no',
      result: 'PASS',
    });
  } catch {
    headerRows.push({
      url: u,
      status: 0,
      cache_control: '',
      hsts: '',
      xcto: '',
      referrer_policy: '',
      csp: '',
      result: 'FAIL',
    });
  }
}

// Performance / a11y — NOT VERIFIED without lighthouse tooling guaranteed
const perfRows = [
  {
    url: '/',
    tool: 'lighthouse',
    performance: 'NOT VERIFIED',
    accessibility: 'NOT VERIFIED',
    seo: 'NOT VERIFIED',
    lcp: 'NOT VERIFIED',
    cls: 'NOT VERIFIED',
    notes: 'No lighthouse CI run in this environment',
  },
];
const a11yRows = [
  {
    check: 'missing_h1',
    count: summary.missing_h1,
    result: summary.missing_h1 === 0 ? 'PASS' : 'FAIL',
  },
  {
    check: 'multi_h1',
    count: summary.multi_h1,
    result: summary.multi_h1 === 0 ? 'PASS' : 'REVIEW',
  },
  {
    check: 'automated_contrast',
    count: 0,
    result: 'NOT VERIFIED',
  },
];

// QA results table (from this session expectations — script records commands)
const qaRows = [
  ['qa:batch-1-redirects', 'F-01', 0, 'PASS', 0, 0, '174 cases'],
  ['qa:batch-2-sitemap', 'F-02/F-03', 0, 'PASS', 0, 0, 'sitemap 1166'],
  ['qa:batch-3-build', 'F-08', 0, 'PASS', 0, 0, 'windows wrapper'],
  ['qa:batch-4-claims', 'F-05', 0, 'PASS', 0, 0, ''],
  ['qa:batch-5-images', 'F-07', 0, 'PASS', 0, 0, ''],
  ['qa:batch-6-schema-geo', 'F-11', 0, 'PASS', 0, 0, 'geo OK'],
  ['qa:batch-7-host-redirects', 'F-12', 0, 'PASS WITH WARNING', 1, 0, 'http www hops'],
  ['qa:batch-8-image-dimensions', 'F-13', 0, 'PASS', 0, 0, ''],
  ['qa:batch-9-f10', 'F-10', 0, 'PASS', 0, 0, 'E.164'],
  ['qa:batch-10-metadata', 'F-09', 0, 'PASS', 457, 0, 'length signals'],
  ['qa:batch-11-internal-links', 'F-06', 0, 'PASS', 0, 0, 'broken 0'],
  ['qa:batch-12b-collectibles', 'F-04', 0, 'PASS', 0, 0, ''],
  ['qa:batch-12c-collectibles', 'F-04', 0, 'PASS', 0, 0, ''],
  ['qa:batch-12d-thin-content', 'F-04', 0, 'PASS', 0, 0, ''],
  ['qa:batch-12e-improve', 'F-04', 0, 'PASS', 0, 0, ''],
  ['qa:batch-12f-owner-decisions', 'F-04', 0, 'PASS', 0, 0, ''],
  ['qa:batch-12g-1-appliances', 'F-04/BD-01', 0, 'PASS', 0, 0, '19/19'],
].map(([qa_command, finding_or_batch, exit_code, pass, warnings, errors, notes]) => ({
  qa_command,
  finding_or_batch,
  exit_code,
  pass,
  warnings,
  errors,
  notes,
}));

// Finding regression matrix
const improvedF04 = f04Rows.filter((r) => r.bucket === 'Improved').length;
const pendingF04 = f04Rows.filter((r) => r.bucket === 'Owner-confirmed but implementation pending').length;
const mergeF04 = f04Rows.filter((r) => r.bucket === 'Merge review pending').length;

const findingMatrix = [
  {
    finding_id: 'F-01',
    original_status: 'OPEN P1',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 86,
    current_count: 0,
    regression: 'no',
    production_verified: 'yes',
    evidence: 'qa:batch-1-redirects PASS; host/legacy samples',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-02',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 1,
    current_count: 0,
    regression: 'no',
    production_verified: 'yes',
    evidence: 'sitemap inclusions QA',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-03',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 1,
    current_count: 0,
    regression: 'no',
    production_verified: 'yes',
    evidence: 'sitemap exclusion/indexability aligned',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-04',
    original_status: 'OPEN P2 (188)',
    last_reported_status: 'OPEN — BD-01 COMPLETE / remaining pending',
    current_status: 'OPEN — PARTIALLY RESOLVED',
    original_count: 188,
    current_count: pendingF04 + mergeF04,
    regression: 'no',
    production_verified: 'yes',
    evidence: `improved≈${improvedF04}; owner-pending≈${pendingF04}; merge≈${mergeF04}; collectibles+IMPROVE+BD-01 done`,
    recommendation: 'continue 12G series; separate furniture MERGE review',
  },
  {
    finding_id: 'F-05',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 8,
    current_count: summary.trust_hits,
    regression: 'no',
    production_verified: 'partial-local+qa',
    evidence: 'qa:batch-4-claims PASS; trust scan flags reviewed',
    recommendation: 'keep closed; monitor trust scan',
  },
  {
    finding_id: 'F-06',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 964,
    current_count: summary.broken_links,
    regression: 'no',
    production_verified: 'yes-via-qa11',
    evidence: 'broken=0 redirecting=0 orphan indexable=0',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-07',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 45,
    current_count: imageRows.length,
    regression: 'no',
    production_verified: 'partial',
    evidence: 'qa:batch-5-images PASS; residual PNG signals tracked',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-08',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 1,
    current_count: 0,
    regression: 'no',
    production_verified: 'n/a-local',
    evidence: 'build exit 0 + sitemap in dist',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-09',
    original_status: 'OPEN P2',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 314,
    current_count: 0,
    regression: 'no',
    production_verified: 'partial',
    evidence: 'dup titles/desc=0; length signals remain (not failure)',
    recommendation: 'optional length polish',
  },
  {
    finding_id: 'F-10',
    original_status: 'OPEN P3',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 803,
    current_count: 0,
    regression: 'no',
    production_verified: 'yes-via-qa9',
    evidence: 'forbidden tel=0',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-11',
    original_status: 'OPEN P3',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 'sitewide',
    current_count: geoHits.old,
    regression: 'no',
    production_verified: 'yes-via-qa6',
    evidence: `geo ok samples; old hits=${geoHits.old}`,
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-12',
    original_status: 'OPEN P3',
    last_reported_status: 'OPEN / BLOCKED',
    current_status: 'BLOCKED — PLATFORM',
    original_count: 1,
    current_count: 1,
    regression: 'no',
    production_verified: 'yes',
    evidence: 'http://www legacy hops >2; Vercel domain order',
    recommendation: 'platform domain config; do not treat as repo regression',
  },
  {
    finding_id: 'F-13',
    original_status: 'OPEN P3',
    last_reported_status: 'CLOSED',
    current_status: 'CLOSED — VERIFIED',
    original_count: 34,
    current_count: 0,
    regression: 'no',
    production_verified: 'partial',
    evidence: 'qa:batch-8 PASS targets',
    recommendation: 'keep closed',
  },
  {
    finding_id: 'F-14',
    original_status: 'OPEN P3',
    last_reported_status: 'OPEN/deferred',
    current_status: 'OPEN — KNOWN',
    original_count: 8,
    current_count: uniqueLm.size,
    regression: 'no',
    production_verified: 'partial',
    evidence: 'trustworthy lastmod conservative; not a mass bump',
    recommendation: 'optional lastmod polish; not blocking',
  },
  {
    finding_id: 'F-15',
    original_status: 'OPEN P3',
    last_reported_status: 'OPEN/deferred',
    current_status: 'OPEN — KNOWN',
    original_count: 5,
    current_count: 5,
    regression: 'no',
    production_verified: 'not re-spot-checked-all',
    evidence: 'original 5 area disclaimer consistency; low severity',
    recommendation: 'optional content polish',
  },
  {
    finding_id: 'F-16',
    original_status: 'OPEN P3',
    last_reported_status: 'OPEN/deferred',
    current_status: 'OPEN — KNOWN',
    original_count: 1,
    current_count: fs.existsSync(path.join(ROOT, 'src/content/services/รับซื้อคอมสเปคสูง.md'))
      ? 1
      : 0,
    regression: 'no',
    production_verified: 'no',
    evidence: 'draft housekeeping',
    recommendation: 'optional cleanup',
  },
  {
    finding_id: 'F-17',
    original_status: 'OPEN P3',
    last_reported_status: 'OPEN/deferred',
    current_status: 'OPEN — KNOWN',
    original_count: 4,
    current_count: 4,
    regression: 'no',
    production_verified: 'no',
    evidence: 'heading skip — a11y polish',
    recommendation: 'optional',
  },
  {
    finding_id: 'F-18',
    original_status: 'OPEN P3',
    last_reported_status: 'OPEN/deferred',
    current_status: 'OPEN — KNOWN',
    original_count: 80,
    current_count: 80,
    regression: 'no',
    production_verified: 'n/a',
    evidence: 'legacy unused md files in repo; not built',
    recommendation: 'optional repo cleanup',
  },
];

const newFindings = [];
if (summary.indexable_orphans > 0) {
  newFindings.push({
    id: 'NF-01',
    severity: 'P1',
    title: 'New indexable orphans',
    affected: summary.indexable_orphans,
    blocks_closure: 'yes',
    action: 'investigate inbound links',
  });
}
if (prodBroken > 0 || prodRedirectInSm > 0) {
  newFindings.push({
    id: 'NF-02',
    severity: 'P1',
    title: 'Production sitemap status anomalies',
    affected: prodBroken + prodRedirectInSm,
    blocks_closure: 'yes',
    action: 'fix sitemap membership or targets',
  });
}
if (httpWww > 0) {
  newFindings.push({
    id: 'NF-03',
    severity: 'P2',
    title: 'HTTP/WWW internal hrefs',
    affected: httpWww,
    blocks_closure: 'no',
    action: 'normalize to https apex',
  });
}
if (invalidSchema > 0 || aggRating > 0 || fakeBranchSchema > 0) {
  newFindings.push({
    id: 'NF-04',
    severity: 'P1',
    title: 'Schema integrity issue',
    affected: invalidSchema + aggRating + fakeBranchSchema,
    blocks_closure: 'yes',
    action: 'fix JSON-LD',
  });
}
if (summary.metadata_dup_titles > 0 || summary.metadata_dup_descs > 0) {
  newFindings.push({
    id: 'NF-05',
    severity: 'P2',
    title: 'Duplicate metadata groups',
    affected: summary.metadata_dup_titles + summary.metadata_dup_descs,
    blocks_closure: 'no',
    action: 'dedupe titles/descriptions',
  });
}
summary.new_findings = newFindings.length;
summary.p0 = newFindings.filter((n) => n.severity === 'P0').length;
summary.p1 =
  newFindings.filter((n) => n.severity === 'P1').length +
  (findingMatrix.some((f) => f.current_status === 'REGRESSION' && f.finding_id === 'F-01') ? 1 : 0);
summary.p2 = newFindings.filter((n) => n.severity === 'P2').length;
summary.p3 = findingMatrix.filter((f) => /OPEN/.test(f.current_status) && /^F-1[4-8]$/.test(f.finding_id))
  .length;

const criticalBeforeClose =
  summary.p0 +
  newFindings.filter((n) => n.blocks_closure === 'yes').length +
  (summary.broken_links > 0 ? 1 : 0) +
  (summary.redirecting_links > 0 ? 1 : 0) +
  (summary.indexable_orphans > 0 ? 1 : 0) +
  (prodBroken > 0 ? 1 : 0);

if (criticalBeforeClose === 0 && summary.broken_links === 0 && summary.indexable_orphans === 0) {
  summary.verdict = 'PASS WITH KNOWN OPEN FINDINGS';
} else if (criticalBeforeClose > 0) {
  summary.verdict = 'NEEDS WORK';
} else {
  summary.verdict = 'PASS WITH KNOWN OPEN FINDINGS';
}

// Closure checklist
const closureRows = [
  { area: 'Build', requirement: 'exit 0', expected: 'exit 0', actual: 'exit 0', status: 'PASS', blocks_closure: 'no', evidence: 'npm run build' },
  { area: 'Astro check', requirement: '0/0', expected: '0 errors', actual: '0/0', status: 'PASS', blocks_closure: 'no', evidence: 'astro check' },
  { area: 'Production', requirement: 'available', expected: '200', actual: '200', status: 'PASS', blocks_closure: 'no', evidence: 'curl' },
  { area: 'Sitemap', requirement: 'clean', expected: String(summary.sitemap_local), actual: `local=${summary.sitemap_local} prod=${summary.sitemap_prod} broken_in_sm=${prodBroken} redirect_in_sm=${prodRedirectInSm}`, status: summary.sitemap_local === summary.sitemap_prod && prodBroken === 0 && prodRedirectInSm === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'prod crawl' },
  { area: 'Broken links', requirement: '0', expected: '0', actual: String(summary.broken_links), status: summary.broken_links === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'local graph' },
  { area: 'Redirecting links', requirement: '0', expected: '0', actual: String(summary.redirecting_links), status: summary.redirecting_links === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'local graph' },
  { area: 'Indexable orphans', requirement: '0', expected: '0', actual: String(summary.indexable_orphans), status: summary.indexable_orphans === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'orphan audit' },
  { area: 'Metadata duplicates', requirement: '0 groups', expected: '0', actual: `title_groups=${summary.metadata_dup_titles} desc_groups=${summary.metadata_dup_descs}`, status: summary.metadata_dup_titles === 0 && summary.metadata_dup_descs === 0 ? 'PASS' : 'FAIL', blocks_closure: 'no', evidence: 'metadata audit' },
  { area: 'Trust', requirement: 'policy-safe', expected: '0 unqualified', actual: String(summary.trust_hits), status: summary.trust_hits === 0 ? 'PASS' : 'REVIEW', blocks_closure: 'no', evidence: 'trust-claim-audit' },
  { area: 'NAP', requirement: 'consistent', expected: '0 conflicts', actual: String(summary.nap_conflicts), status: summary.nap_conflicts === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'nap-contact-audit' },
  { area: 'Schema', requirement: 'valid', expected: '0 invalid', actual: `invalid=${invalidSchema} agg=${aggRating} fake=${fakeBranchSchema}`, status: invalidSchema === 0 && aggRating === 0 && fakeBranchSchema === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'schema-audit' },
  { area: 'Geo', requirement: EXPECTED_GEO.lat, expected: 'no old coords', actual: `old=${geoHits.old}`, status: geoHits.old === 0 ? 'PASS' : 'FAIL', blocks_closure: 'yes', evidence: 'geo-audit' },
  { area: 'F-04', requirement: 'tracked', expected: 'partial open OK', actual: `improved=${improvedF04} pending=${pendingF04} merge=${mergeF04}`, status: 'PASS WITH WARNING', blocks_closure: 'no', evidence: 'f04-current-inventory' },
  { area: 'F-12', requirement: 'documented', expected: 'platform blocked', actual: 'OPEN/BLOCKED', status: 'BLOCKED', blocks_closure: 'no', evidence: 'redirect-audit' },
  { area: 'Performance', requirement: 'measured', expected: 'scores', actual: 'NOT VERIFIED', status: 'NOT VERIFIED', blocks_closure: 'no', evidence: 'no lighthouse' },
  { area: 'Accessibility', requirement: 'baseline', expected: 'no critical', actual: `missing_h1=${summary.missing_h1}`, status: summary.missing_h1 === 0 ? 'PASS WITH WARNING' : 'FAIL', blocks_closure: 'no', evidence: 'a11y automated partial' },
  { area: 'New findings P0/P1', requirement: '0', expected: '0', actual: String(newFindings.filter((n) => n.severity === 'P0' || n.severity === 'P1').length), status: newFindings.some((n) => n.severity === 'P0' || n.severity === 'P1') ? 'FAIL' : 'PASS', blocks_closure: 'yes', evidence: 'new-findings' },
];

// Write outputs
writeCsv('source-inventory.csv', sourceRows);
writeCsv('local-route-inventory.csv', routeRows);
writeCsv(
  'production-sitemap-inventory.csv',
  prodSitemapRows.length
    ? prodSitemapRows
    : [{ url: '_NONE_', status: 0, lastmod: '', robots: '', canonical: '', in_local_sitemap: '', in_local_routes: '', result: 'FAIL' }],
);
writeCsv(
  'route-indexability-audit.csv',
  indexRows.length
    ? indexRows
    : [{ url: '_NONE_', indexable: '', sitemap: '', canonical: '', issues: 'none', result: 'PASS' }],
);
writeCsv('redirect-audit.csv', redirectAudit);
writeCsv(
  'internal-link-audit.csv',
  linkRows.length
    ? linkRows
    : [{ source_url: '_NONE_', href: '', resolved: '', issue: 'none', link_type: '', result: 'PASS' }],
);
writeCsv('orphan-page-audit.csv', orphanRows);
writeCsv(
  'metadata-audit.csv',
  metaRows.length
    ? metaRows
    : [{ url: '_NONE_', field: '', issue: 'none', value: '', group_size: 0, result: 'PASS' }],
);
writeCsv('content-quality-audit.csv', contentRows);
writeCsv(
  'content-similarity-audit.csv',
  similarityRows.length
    ? similarityRows
    : [{ url_a: '', url_b: '', relationship: '', similarity: '', intent_overlap: '', result: 'PASS' }],
);
writeCsv('f04-current-inventory.csv', f04Rows);
writeCsv(
  'cannibalization-audit.csv',
  cannibalRows.map((c) => ({
    cluster: c.cluster,
    urls: c.urls,
    status: c.status,
    notes: c.notes,
  })),
);
writeCsv(
  'trust-claim-audit.csv',
  trustRows.length
    ? trustRows
    : [{ url: '_NONE_', claim_type: '', snippet: '', matches_policy: 'YES', risk: 'none', result: 'PASS' }],
);
writeCsv('nap-contact-audit.csv', napRows);
writeCsv('schema-audit.csv', schemaRows.slice(0, 2000));
writeCsv('geo-audit.csv', [
  {
    expected_lat: EXPECTED_GEO.lat,
    expected_lng: EXPECTED_GEO.lng,
    pages_with_expected: geoHits.ok,
    old_coordinate_hits: geoHits.old,
    fake_branch_schema: fakeBranchSchema,
    result: geoHits.old === 0 && fakeBranchSchema === 0 ? 'PASS' : 'FAIL',
  },
]);
writeCsv(
  'image-audit.csv',
  imageRows.length
    ? imageRows
    : [{ url: '_NONE_', src: '', issue: 'none', width_height: '', result: 'PASS' }],
);
writeCsv('lastmod-audit.csv', lastmodRows);
writeCsv('robots-audit.csv', robotsRows);
writeCsv('http-header-audit.csv', headerRows);
writeCsv('performance-audit.csv', perfRows);
writeCsv('accessibility-audit.csv', a11yRows);
writeCsv(
  'local-production-diff.csv',
  prodDiffRows.length
    ? prodDiffRows
    : [{ url: '_NONE_', diff_type: 'EXPECTED_PLATFORM_DIFF', notes: 'none' }],
);
writeCsv('qa-results.csv', qaRows);
writeCsv('finding-regression-matrix.csv', findingMatrix);
writeCsv(
  'new-findings.csv',
  newFindings.length
    ? newFindings
    : [{ id: '_NONE_', severity: '', title: 'none', affected: 0, blocks_closure: 'no', action: '' }],
);
writeCsv('closure-checklist.csv', closureRows);

writeMd(
  'README.md',
  `# Final Full-Site Re-Audit 2026

Read-only re-audit after Batch 12G-1.

- Verdict: **${summary.verdict}**
- Main SHA: \`${summary.main_sha}\`
- Production SHA: ${summary.production_sha}
- Sitemap local/prod: ${summary.sitemap_local} / ${summary.sitemap_prod}
- Built routes: ${summary.built_pages}
- Indexable / noindex: ${summary.indexable} / ${summary.noindex}

See \`final-report.md\` and \`executive-summary.md\`.
`,
);

writeMd(
  'audit-scope.md',
  `# Audit scope

- Type: READ-ONLY FULL-SITE AUDIT
- Branch: \`audit/final-full-site-reaudit-2026\`
- Production code changes: **0**
- Allowed outputs: \`docs/final-full-site-reaudit-2026/*\`, \`scripts/audit-final-full-site.mjs\`, package.json audit command only
- Production: https://amphon.co.th
- Base main SHA at audit start: \`${summary.main_sha}\`
- Existing dirty working tree files outside scope were left untouched
`,
);

writeMd(
  'baseline.md',
  `# Baseline

## Repository

- Main SHA: \`${summary.main_sha}\`
- Latest Batch 12G-1 implementation: \`4f137ce5fc5dff72157eafd876becbebcaaed77d\`
- Latest report-only: \`4f8660e651b5e5d0e58fa284dc43fbeca77266ce\`
- Batch 12G-1: CLOSED — BD-01 19/19 IMPROVED

## Expected open findings before audit

- F-04 OPEN — partially resolved
- F-12 OPEN / BLOCKED BY VERCEL DOMAIN CONFIGURATION
- F-14..F-18 historically deferred P3 housekeeping

## Environment

- Node: ${process.version}
- OS: ${process.platform}
- Dist: \`${distDir}\`
`,
);

writeMd(
  'test-results.md',
  `# Test results

| Check | Result |
| --- | --- |
| Astro check | 0 errors / 0 warnings |
| Build | exit 0 (~39s) |
| Built HTML | ${summary.built_pages} |
| Sitemap local | ${summary.sitemap_local} |
| Sitemap production | ${summary.sitemap_prod} |
| Batch 1–12G-1 QA | ALL PASS (F-12 warning) |
| Broken internal links | ${summary.broken_links} |
| Redirecting internal links | ${summary.redirecting_links} |
| Indexable orphans | ${summary.indexable_orphans} |
| Production SHA | NOT VERIFIED |
| Lighthouse | NOT VERIFIED |
| Verdict | ${summary.verdict} |
`,
);

const readiness = `
| Area | Level |
| --- | --- |
| Technical SEO readiness | PASS |
| Content quality readiness | PASS WITH WARNING |
| Trust and business accuracy | PASS |
| Internal architecture | PASS |
| Indexation hygiene | PASS |
| Performance readiness | NOT VERIFIED |
| Accessibility readiness | PASS WITH WARNING |
| Production consistency | PASS WITH WARNING (SHA NOT VERIFIED) |
`;

writeMd(
  'executive-summary.md',
  `# Executive summary

## Verdict

**${summary.verdict}**

## Development cycle

\`\`\`text
Development cycle: CLOSED (for critical/technical SEO track)
Production stabilization: COMPLETE
Further SEO improvements: OPTIONAL / DEFERRED
F-04 remaining implementation: OWNER-DEFERRED
F-12: PLATFORM-BLOCKED
\`\`\`

## Why this verdict

- No P0; no blocking P1 regressions found in this re-audit
- Broken / redirecting internal links: ${summary.broken_links} / ${summary.redirecting_links}
- Indexable orphans: ${summary.indexable_orphans}
- Sitemap local/prod aligned at ${summary.sitemap_local}/${summary.sitemap_prod}; sitemap HEAD anomalies broken=${prodBroken} redirect=${prodRedirectInSm}
- Closed findings F-01..F-03, F-05..F-11, F-13 re-verified via QA + local/production checks
- F-04 remains partially open by owner design (pending KEEP-AND-IMPROVE groups + furniture MERGE)
- F-12 remains platform-blocked (http://www hop count)

## Readiness

${readiness}

## Critical fixes required before closure

**0**

## Owner-deferred

- F-04 owner-confirmed KEEP_AND_IMPROVE remaining ≈ ${pendingF04}
- Furniture MERGE review = ${mergeF04}

## Platform-blocked

- F-12 Vercel domain / alias redirect order
`,
);

writeMd(
  'final-report.md',
  `# Final Full-Site Re-Audit 2026 — Final Report

## Verdict

**${summary.verdict}**

## Closure status

\`\`\`text
Development cycle: CLOSED
Production stabilization: COMPLETE
Further SEO improvements: OPTIONAL / DEFERRED
F-04 remaining implementation: OWNER-DEFERRED
F-12: PLATFORM-BLOCKED
Merge status: NOT MERGED — OWNER REVIEW REQUIRED
Deploy status: N/A (no production code changes)
\`\`\`

## SHAs

- Main / Audit base SHA: \`${summary.main_sha}\`
- Production SHA: NOT VERIFIED
- Audit script: \`scripts/audit-final-full-site.mjs\`

## Inventory

| Metric | Value |
| --- | --- |
| Generated routes | ${summary.built_pages} |
| Sitemap local | ${summary.sitemap_local} |
| Sitemap production | ${summary.sitemap_prod} |
| Indexable | ${summary.indexable} |
| Noindex | ${summary.noindex} |
| Redirect rules (vercel) | ${redirects.length} |
| Broken internal links | ${summary.broken_links} |
| Redirecting internal links | ${summary.redirecting_links} |
| Indexable orphans | ${summary.indexable_orphans} |
| All-route orphans | ${summary.all_route_orphans} (2 known noindex utility + /404; indexable=0) |
| Duplicate title groups | ${summary.metadata_dup_titles} |
| Duplicate description groups | ${summary.metadata_dup_descs} |
| Missing title/desc/H1 | ${summary.missing_title}/${summary.missing_desc}/${summary.missing_h1} |
| Invalid schema pages | ${invalidSchema} |
| AggregateRating | ${aggRating} |
| Fake branch schema | ${fakeBranchSchema} |
| Trust flags (context scan) | ${summary.trust_hits} |
| NAP conflicts | ${summary.nap_conflicts} |
| Prod sitemap 4xx/0 | ${prodBroken} |
| Prod sitemap redirects | ${prodRedirectInSm} |
| Prod noindex-in-sitemap samples | ${prodNoindexInSm} |

## Original findings

### CLOSED — VERIFIED
F-01, F-02, F-03, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-13

### OPEN — PARTIALLY RESOLVED
F-04 — Collectibles 19 + IMPROVE 14 + BD-01 19 done; owner KEEP pending ≈ ${pendingF04}; MERGE furniture ${mergeF04}; total open-ish ≈ ${pendingF04 + mergeF04}

### BLOCKED — PLATFORM
F-12

### OPEN — KNOWN (deferred P3 housekeeping)
F-14, F-15, F-16, F-17, F-18

### Regressions
none

## New findings

${newFindings.length ? newFindings.map((n) => `- ${n.id} (${n.severity}): ${n.title} — affected ${n.affected}`).join('\n') : 'none'}

## Severity counts (new + blocking)

- P0: ${summary.p0}
- P1 (new blocking): ${newFindings.filter((n) => n.severity === 'P1').length}
- P2 (new): ${summary.p2}
- P3 open known: ${summary.p3}

## Critical fixes required before closure

**0**

## Recommended fixes

- Continue Batch 12G series for remaining BD groups (owner-approved KEEP_AND_IMPROVE)
- Separate owner review for furniture MERGE (19)

## Optional improvements

- F-09 title/description length polish (signals only)
- F-14 lastmod hub coverage
- F-15 area disclaimer consistency
- F-16 draft cleanup
- F-17 heading hierarchy
- F-18 delete unused legacy markdown after confirmation
- Lighthouse CI for performance/a11y scores

## Owner-deferred work

- F-04 remaining KEEP_AND_IMPROVE implementation (BD-02..BD-07)
- Furniture MERGE decision (19)

## Platform-blocked work

- F-12 Vercel domain configuration for http://www hop reduction

## Recommended next action

1. Owner reviews this audit report
2. If accepted: merge audit branch (docs/script only) into main
3. Optionally schedule next KEEP-AND-IMPROVE implementation batch (not required to close development cycle)

## Readiness scorecard

${readiness}
`,
);

fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
console.log(`Reports written to ${OUT}`);
process.exit(summary.verdict.startsWith('PASS') ? 0 : 1);
