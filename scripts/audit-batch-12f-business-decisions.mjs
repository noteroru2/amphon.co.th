/**
 * Batch 12F — F-04 Business Decision Matrix (read-only audit).
 * Generates docs under docs/batch-12f-business-decision-matrix/
 * Does NOT modify content, routes, redirects, sitemap, or config.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  normalizePathname,
  readText,
  walkFiles,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs/batch-12f-business-decision-matrix');
const MATRIX = path.join(ROOT, 'docs/batch-12a-thin-content-decisions/decision-matrix.csv');
const EXPECTED_RBD = 134;
const EXPECTED_SITEMAP = 1166;

const COLLECTIBLES_RESOLVED = new Set([
  // 19 non-Ubon ของสะสม retired in 12B/12C — all ofสะสม except Ubon which was IMPROVED in 12D
]);

const IMPROVE_RESOLVED = new Set([
  '/รับซื้อ/รับซื้อของสะสม-อุบลราชธานี',
  '/รับซื้อ/รับซื้อเครื่องใช้ไฟฟ้า-อุบลราชธานี',
  '/รับซื้อ/รับซื้อโดรน-อุบลราชธานี',
  '/รับซื้อ/รับซื้อทีวี-อุบลราชธานี',
  '/รับซื้อ/รับซื้อเฟอร์นิเจอร์-อุบลราชธานี',
  '/รับซื้อ/รับซื้ออุปกรณ์-network-อุบลราชธานี',
  '/รับซื้อ/รับซื้อ-server-อุบลราชธานี',
  '/รับซื้อ/รับซื้อ-ups-อุบลราชธานี',
  '/blog/ขาย-iphone-มือสอง-ต้องเตรียมอะไรบ้าง',
  '/blog/คอมบริษัทเก่า-ขายยังไง',
  '/blog/โน๊ตบุ๊คเสีย-ขายได้ไหม',
  '/blog/รับซื้อสินค้าไอทีถึงที่-ปลอดภัยไหม',
  '/blog/วิธีเช็กราคาก่อนขายโน๊ตบุ๊คมือสอง',
  '/blog/วิธีเตรียมเครื่องก่อนขายสินค้าไอที',
]);

/** @type {Record<string, { id: string, name: string, hub: string, service: string, product: string, audience: string, model: string, priority: 'A'|'B'|'C', question: string, decisionScope: string, risk: string, largeItem?: boolean, auction?: boolean }>} */
const FAMILY_META = {
  'G-SA-รับซื้อเครื่องใช้ไฟฟ้า': {
    id: 'BD-01',
    name: 'เครื่องใช้ไฟฟ้า — จังหวัดนอกอุบล',
    hub: '/บริการ/รับซื้อเครื่องใช้ไฟฟ้า',
    service: 'รับซื้อเครื่องใช้ไฟฟ้า',
    product: 'ตู้เย็น;เครื่องซักผ้า;แอร์;ไมโครเวฟ;เครื่องใช้ไฟฟ้าบ้าน',
    audience: 'consumer;possible-company',
    model: 'retail-tradein',
    priority: 'A',
    question: 'ร้านรับซื้อเครื่องใช้ไฟฟ้าขนาดใหญ่/บ้าน (นอกอุบลราชธานี) จริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+D+E+F',
    risk: 'large-item-fulfilment;fake-local-service',
    largeItem: true,
  },
  'G-SA-รับซื้อทีวี': {
    id: 'BD-02',
    name: 'ทีวี — จังหวัดนอกอุบล',
    hub: '/บริการ/รับซื้อทีวี',
    service: 'รับซื้อทีวี',
    product: 'ทีวี;สมาร์ททีวี',
    audience: 'consumer',
    model: 'retail-tradein',
    priority: 'B',
    question: 'ร้านรับซื้อทีวีจากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+D+E+F',
    risk: 'fake-local-service;long-tail-unknown',
  },
  'G-SA-รับซื้อโดรน': {
    id: 'BD-03',
    name: 'โดรน — จังหวัดนอกอุบล',
    hub: '/บริการ/รับซื้อโดรน',
    service: 'รับซื้อโดรน',
    product: 'โดรน;โดรนพร้อมรีโมต',
    audience: 'consumer;hobbyist',
    model: 'retail-tradein',
    priority: 'B',
    question: 'ร้านรับซื้อโดรนจากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+B+E+F',
    risk: 'condition-ambiguity;long-tail-unknown',
  },
  'G-SA-รับซื้ออุปกรณ์-network': {
    id: 'BD-04',
    name: 'อุปกรณ์ Network — จังหวัดนอกอุบล',
    hub: '/บริการ/รับซื้ออุปกรณ์-network',
    service: 'รับซื้ออุปกรณ์ Network',
    product: 'สวิตช์;เราเตอร์;แอคเซสพอยต์;อุปกรณ์เครือข่าย',
    audience: 'consumer;smb;company',
    model: 'retail-b2b-mix',
    priority: 'B',
    question: 'ร้านรับซื้ออุปกรณ์ Network จากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+C+E+F',
    risk: 'b2b-ambiguity;long-tail-unknown',
  },
  'G-SA-รับซื้อ-server': {
    id: 'BD-05',
    name: 'Server / Rack — จังหวัดนอกอุบล',
    hub: '/บริการ/รับซื้อ-server',
    service: 'รับซื้อ Server และตู้ Rack',
    product: 'server;rack;storage-server',
    audience: 'company;it-asset',
    model: 'b2b-asset',
    priority: 'A',
    question: 'ร้านรับซื้อ Server/ตู้ Rack จากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+C+D+E+F',
    risk: 'b2b-ambiguity;large-item-fulfilment;data-wipe',
    largeItem: true,
  },
  'G-SA-รับซื้อ-ups': {
    id: 'BD-06',
    name: 'UPS — จังหวัดนอกอุบล',
    hub: '/บริการ/รับซื้อ-ups',
    service: 'รับซื้อ UPS',
    product: 'UPS;เครื่องสำรองไฟ',
    audience: 'consumer;smb;company',
    model: 'retail-b2b-mix',
    priority: 'A',
    question: 'ร้านรับซื้อ UPS จากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+B+D+E+F',
    risk: 'battery-condition;large-item-fulfilment',
    largeItem: true,
  },
  'G-SA-OTHER': {
    id: 'BD-07',
    name: 'รับเหมาประมูลอุปกรณ์ไอที — ทุกจังหวัดในชุด (รวมอุบล)',
    hub: '/บริการ/รับเหมาประมูลอุปกรณ์ไอที',
    service: 'รับเหมาประมูลอุปกรณ์ไอที',
    product: 'อุปกรณ์ไอทียกชุด;ล็อตประมูล;สินทรัพย์องค์กร',
    audience: 'company;school;agency;auction',
    model: 'auction-bulk-b2b',
    priority: 'A',
    question: 'ร้านรับงานรับเหมา/ประมูลอุปกรณ์ไอที (รวมหน้าจังหวัดในชุดนี้) จริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
    decisionScope: 'A+C+D+E+F',
    risk: 'auction-bulk-ambiguity;ownership-docs;fake-local-service',
    auction: true,
  },
};

// Secondary headphone/speaker groups may appear under different group_ids — discover dynamically
const FALLBACK_META = {
  id: 'BD-XX',
  name: 'หมวดรองอื่น',
  hub: '/รับซื้อสินค้าไอที',
  service: 'unknown',
  product: 'unknown',
  audience: 'unknown',
  model: 'unknown',
  priority: 'C',
  question: 'ร้านยังต้องการหน้าจังหวัดสำหรับหมวดนี้หรือไม่',
  decisionScope: 'A+E+F',
  risk: 'unknown-service',
};

function parseCSV(text) {
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

function esc(v) {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCSV(file, header, rows) {
  const lines = [header.join(',')];
  for (const r of rows) lines.push(header.map((h) => esc(r[h])).join(','));
  fs.writeFileSync(file, lines.join('\n') + '\n', 'utf8');
}

function stripQuotes(u) {
  return String(u || '').replace(/^"|"$/g, '');
}

function provinceFromUrl(url) {
  const m = url.match(/-([^-/]+)$/);
  return m ? m[1] : '';
}

function serviceSlugFromUrl(url) {
  // /รับซื้อ/รับซื้อX-จังหวัด or /รับซื้อ/รับเหมา...
  const leaf = url.split('/').pop() || '';
  const parts = leaf.split('-');
  if (parts.length < 2) return leaf;
  return parts.slice(0, -1).join('-');
}

function metaForGroup(groupId, url) {
  if (FAMILY_META[groupId]) return FAMILY_META[groupId];
  const slug = serviceSlugFromUrl(url);
  // headphone / speaker discovery
  if (/หูฟัง|headphones?/i.test(slug)) {
    return {
      id: 'BD-08',
      name: 'หูฟัง — จังหวัดนอกอุบล',
      hub: '/บริการ/รับซื้อหูฟัง',
      service: 'รับซื้อหูฟัง',
      product: 'หูฟัง;เฮดโฟน',
      audience: 'consumer',
      model: 'retail-tradein',
      priority: 'C',
      question: 'ร้านรับซื้อหูฟังจากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
      decisionScope: 'A+E+F',
      risk: 'long-tail-unknown',
    };
  }
  if (/ลำโพง|speaker/i.test(slug)) {
    return {
      id: 'BD-09',
      name: 'ลำโพง — จังหวัดนอกอุบล',
      hub: '/บริการ/รับซื้อลำโพง',
      service: 'รับซื้อลำโพง',
      product: 'ลำโพง;ลำโพงบลูทูธ',
      audience: 'consumer',
      model: 'retail-tradein',
      priority: 'C',
      question: 'ร้านรับซื้อลำโพงจากจังหวัดนอกอุบลราชธานีจริงหรือไม่ และต้องการหน้าแยกตามจังหวัดหรือไม่',
      decisionScope: 'A+E+F',
      risk: 'long-tail-unknown',
    };
  }
  return { ...FALLBACK_META, id: `BD-${groupId}`, name: groupId, hub: FALLBACK_META.hub };
}

function ensureDist() {
  if (!fs.existsSync(distDir)) {
    console.error('dist missing — run npm run build before audit for route validation');
    return false;
  }
  return true;
}

function pagePathMap() {
  if (!ensureDist()) return new Map();
  /** @type {Map<string, string>} */
  const raw = collectBuiltPages();
  const map = new Map();
  for (const [pathname, file] of raw.entries()) {
    map.set(normalizePathname(pathname), file);
  }
  return map;
}

function extractClaims(html, url) {
  const title = ((html.match(/<title>([^<]*)/i) || [])[1] || '').trim();
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '')
    .replace(/<[^>]+>/g, '')
    .trim();
  const desc =
    (html.match(/name=["']description["'][^>]*content=["']([^"']*)/i) ||
      html.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      [])[1] || '';
  const claims = [];
  const push = (field, current_claim, claim_type, risk = 'low') => {
    if (!current_claim) return;
    claims.push({ field, current_claim, claim_type, risk });
  };
  push('title', title, 'SERVICE_OFFERING');
  push('h1', h1, 'SERVICE_OFFERING');
  push('description', desc, 'SERVICE_OFFERING');
  if (/นัดรับ|รับถึงที่|เข้ารับ/.test(title + h1 + desc)) push('meta+h1', 'mentions pickup', 'PICKUP', 'medium');
  if (/ประมูล|รับเหมา|ยกล็อต/.test(title + h1 + desc)) push('meta+h1', 'mentions auction/bulk', 'AUCTION', 'high');
  if (/บริษัท|องค์กร|หน่วยงาน/.test(title + h1 + desc)) push('meta+h1', 'mentions business customer', 'BUSINESS_CUSTOMER', 'medium');
  if (/สาขา|สำนักงานประจำ|ทีมงานประจำจังหวัด/.test(html))
    push('body', 'possible branch/staff claim', 'LOCATION', 'KNOWN TRUST ISSUE');
  const prov = provinceFromUrl(url);
  if (prov && prov !== 'อุบลราชธานี' && new RegExp(prov).test(h1)) {
    push('h1', `local service claim for ${prov}`, 'LOCATION', 'medium-fake-local-risk');
  }
  return claims;
}

// --- main ---
fs.mkdirSync(DOCS, { recursive: true });

const matrixRows = parseCSV(readText(MATRIX));
const mh = Object.fromEntries(matrixRows[0].map((x, i) => [x, i]));
const all = matrixRows.slice(1).map((r) => {
  const o = {};
  for (const k of Object.keys(mh)) o[k] = stripQuotes(r[mh[k]]);
  return o;
});

const counts = {};
for (const r of all) counts[r.classification] = (counts[r.classification] || 0) + 1;

const rbd = all.filter((r) => r.classification === 'REQUIRES_BUSINESS_DECISION');
const mergeAll = all.filter((r) => r.classification === 'MERGE');
const fp = all.filter((r) => r.classification === 'FALSE_POSITIVE');
const improve = all.filter((r) => r.classification === 'IMPROVE');

// Collectibles: MERGE ของสะสม non-Ubon that were resolved
const collectiblesMerge = mergeAll.filter((r) => r.group_id === 'G-SA-รับซื้อของสะสม');
const furnitureMerge = mergeAll.filter((r) => r.group_id === 'G-SA-รับซื้อเฟอร์นิเจอร์');

if (rbd.length !== EXPECTED_RBD) {
  console.error(`BLOCKED — RBD count ${rbd.length} != ${EXPECTED_RBD}`);
  process.exit(1);
}

const pages = pagePathMap();
const sitemapUrls = new Set();
if (ensureDist()) {
  for (const f of walkFiles(distDir).filter((n) => /sitemap.*\.xml$/i.test(n))) {
    const xml = readText(f);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        sitemapUrls.add(decodeURIComponent(new URL(m[1]).pathname.replace(/\/$/, '') || '/'));
      } catch {
        /* skip */
      }
    }
  }
}

// Reconciliation of ALL 188
const recon = [];
for (const r of all) {
  const url = r.url;
  const isCollectibleResolved =
    r.group_id === 'G-SA-รับซื้อของสะสม' && r.classification === 'MERGE';
  const isImproveResolved = IMPROVE_RESOLVED.has(url);
  const routeExists = pages.has(url) || r.production_status?.includes('200');
  // After 12C, collectibles non-Ubon are redirected — route may not exist as 200 page
  let currentClass = r.classification;
  let include = 'no';
  let reason = '';
  if (r.classification === 'FALSE_POSITIVE') {
    reason = 'false positive utility';
    currentClass = 'FALSE_POSITIVE';
  } else if (isCollectibleResolved) {
    reason = 'resolved Collectibles MERGE family Batch 12B/12C';
    currentClass = 'RESOLVED_MERGE_COLLECTIBLES';
  } else if (isImproveResolved) {
    reason = 'resolved IMPROVE Batch 12D/12E';
    currentClass = 'RESOLVED_IMPROVE';
  } else if (r.classification === 'MERGE') {
    reason = 'remaining MERGE (furniture non-Ubon) — out of Batch 12F scope';
    currentClass = 'MERGE';
  } else if (r.classification === 'REQUIRES_BUSINESS_DECISION') {
    include = 'yes';
    reason = 'Batch 12F business decision candidate';
    currentClass = 'REQUIRES_BUSINESS_DECISION';
  } else {
    reason = `other classification ${r.classification}`;
  }
  const inSitemap = sitemapUrls.has(url) ? 'yes' : pages.has(url) ? 'check' : 'no';
  recon.push({
    url,
    classification_batch12a: r.classification,
    resolved_batch12b: isCollectibleResolved && url.includes('ของสะสม') ? 'family_pilot' : 'no',
    resolved_batch12c: isCollectibleResolved ? 'yes' : 'no',
    resolved_batch12d: IMPROVE_RESOLVED.has(url) && !url.includes('server') && !url.includes('ups') && !url.startsWith('/blog/') ? 'yes' : 'no',
    resolved_batch12e:
      IMPROVE_RESOLVED.has(url) &&
      (url.includes('server') || url.includes('ups') || url.startsWith('/blog/'))
        ? 'yes'
        : 'no',
    current_route_exists: pages.has(url) ? 'yes' : isCollectibleResolved ? 'retired_redirect' : 'unknown',
    production_status: r.production_status,
    indexable: r.indexable,
    canonical: r.canonical,
    sitemap: r.sitemap,
    current_classification: currentClass,
    include_batch12f: include,
    reason,
  });
}

// Fix improve resolved flags more accurately
for (const row of recon) {
  if (IMPROVE_RESOLVED.has(row.url)) {
    const ubon12d = [
      'ของสะสม',
      'เครื่องใช้ไฟฟ้า',
      'โดรน',
      'ทีวี',
      'เฟอร์นิเจอร์',
      'อุปกรณ์-network',
    ].some((k) => row.url.includes(k) && row.url.includes('อุบลราชธานี'));
    row.resolved_batch12d = ubon12d ? 'yes' : 'no';
    row.resolved_batch12e =
      row.url.startsWith('/blog/') ||
      row.url.includes('รับซื้อ-server-อุบล') ||
      row.url.includes('รับซื้อ-ups-อุบล')
        ? 'yes'
        : 'no';
  }
}

writeCSV(
  path.join(DOCS, 'candidate-reconciliation.csv'),
  [
    'url',
    'classification_batch12a',
    'resolved_batch12b',
    'resolved_batch12c',
    'resolved_batch12d',
    'resolved_batch12e',
    'current_route_exists',
    'production_status',
    'indexable',
    'canonical',
    'sitemap',
    'current_classification',
    'include_batch12f',
    'reason',
  ],
  recon,
);

const include12f = recon.filter((r) => r.include_batch12f === 'yes');
if (include12f.length !== EXPECTED_RBD) {
  console.error(`BLOCKED — include_batch12f ${include12f.length} != ${EXPECTED_RBD}`);
  process.exit(1);
}

// Group RBD by group_id / discovered meta
/** @type {Map<string, typeof rbd>} */
const byGroup = new Map();
for (const r of rbd) {
  const meta = metaForGroup(r.group_id, r.url);
  const key = meta.id;
  if (!byGroup.has(key)) byGroup.set(key, []);
  byGroup.get(key).push({ ...r, _meta: meta });
}

// Assign stable BD ids: sort by id
const groups = [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]));

// Candidates inventory
const candidates = [];
for (const [bdId, urls] of groups) {
  const meta = urls[0]._meta;
  for (const r of urls) {
    const loc = provinceFromUrl(r.url);
    candidates.push({
      url: r.url,
      source_file: r.source_file,
      page_type: r.page_type,
      template_family: r.group_id,
      service_category: meta.service,
      product_category: meta.product,
      location: loc,
      audience: meta.audience,
      commercial_model: meta.model,
      primary_intent: r.primary_intent,
      closest_hub: meta.hub,
      closest_competing_url: r.closest_competing_url || meta.hub,
      content_quality: 'thin_template',
      unique_value: r.unique_value || 'low',
      business_fact_missing:
        'service_existence;condition_policy;fulfilment_outside_ubon;page_strategy',
      decision_required: meta.question,
      decision_scope: meta.decisionScope,
      production_status: r.production_status,
      indexable: r.indexable,
      canonical: r.canonical,
      sitemap: r.sitemap,
      risk: meta.risk,
    });
  }
}
writeCSV(
  path.join(DOCS, 'business-decision-candidates.csv'),
  [
    'url',
    'source_file',
    'page_type',
    'template_family',
    'service_category',
    'product_category',
    'location',
    'audience',
    'commercial_model',
    'primary_intent',
    'closest_hub',
    'closest_competing_url',
    'content_quality',
    'unique_value',
    'business_fact_missing',
    'decision_required',
    'decision_scope',
    'production_status',
    'indexable',
    'canonical',
    'sitemap',
    'risk',
  ],
  candidates,
);

if (candidates.length !== EXPECTED_RBD) {
  console.error(`candidates ${candidates.length} != ${EXPECTED_RBD}`);
  process.exit(1);
}

// Decision group map
const groupMap = [];
for (const [bdId, urls] of groups) {
  const meta = urls[0]._meta;
  const products = [...new Set(urls.map((u) => meta.product))].join('|');
  groupMap.push({
    decision_group_id: bdId,
    decision_group_name: meta.name,
    service_category: meta.service,
    product_categories: products,
    template_family: urls[0].group_id,
    url_count: urls.length,
    urls: urls.map((u) => u.url).join(' | '),
    shared_business_question: meta.question,
    shared_implementation_outcome:
      'A→IMPROVE keep SA; B→MERGE to hub; C→KEEP with limits; D→REDIRECT to hub; E→investigate',
    possible_keep_target: 'self',
    possible_merge_target: meta.hub,
    possible_redirect_target: meta.hub,
    risk: meta.risk,
  });
}
writeCSV(
  path.join(DOCS, 'decision-group-map.csv'),
  [
    'decision_group_id',
    'decision_group_name',
    'service_category',
    'product_categories',
    'template_family',
    'url_count',
    'urls',
    'shared_business_question',
    'shared_implementation_outcome',
    'possible_keep_target',
    'possible_merge_target',
    'possible_redirect_target',
    'risk',
  ],
  groupMap,
);

// Business service matrix
const serviceMatrix = groups.map(([bdId, urls]) => {
  const meta = urls[0]._meta;
  return {
    decision_group_id: bdId,
    service_or_product: meta.service,
    currently_claimed_on_site: 'yes — province SA pages claim local buyback',
    claim_locations: urls.map((u) => u.url).slice(0, 5).join(' | ') + (urls.length > 5 ? ' | …' : ''),
    confirmed_business_fact:
      'store only in Ubon 740/8; no other branches; remote = photo quote + appointment/shipping by agreement',
    unconfirmed_business_fact:
      'UNKNOWN — OWNER DECISION REQUIRED: service offered for this category outside Ubon; condition policy; bulk/auction if applicable; page strategy',
    accept_working: 'UNKNOWN — OWNER DECISION REQUIRED',
    accept_damaged: 'UNKNOWN — OWNER DECISION REQUIRED',
    accept_incomplete: 'UNKNOWN — OWNER DECISION REQUIRED',
    accept_bulk: meta.auction ? 'UNKNOWN — OWNER DECISION REQUIRED' : 'UNKNOWN — OWNER DECISION REQUIRED',
    accept_company_assets: /b2b|auction|company/i.test(meta.audience + meta.model)
      ? 'UNKNOWN — OWNER DECISION REQUIRED'
      : 'UNKNOWN — OWNER DECISION REQUIRED',
    accept_shipping: 'UNKNOWN — OWNER DECISION REQUIRED',
    accept_appointment_pickup: 'UNKNOWN — OWNER DECISION REQUIRED',
    store_dropoff: 'CONFIRMED for Ubon store visitors — not a substitute for province LP decision',
    geographic_scope: 'UNKNOWN — OWNER DECISION REQUIRED (outside Ubon)',
    page_strategy_if_yes: 'KEEP_SEPARATE→IMPROVE or YES_MERGE_TO_HUB',
    page_strategy_if_no: 'REDIRECT to hub (preferred) or REMOVE_ROUTE after link cleanup',
    owner_decision_required: 'yes',
  };
});
writeCSV(
  path.join(DOCS, 'business-service-matrix.csv'),
  [
    'decision_group_id',
    'service_or_product',
    'currently_claimed_on_site',
    'claim_locations',
    'confirmed_business_fact',
    'unconfirmed_business_fact',
    'accept_working',
    'accept_damaged',
    'accept_incomplete',
    'accept_bulk',
    'accept_company_assets',
    'accept_shipping',
    'accept_appointment_pickup',
    'store_dropoff',
    'geographic_scope',
    'page_strategy_if_yes',
    'page_strategy_if_no',
    'owner_decision_required',
  ],
  serviceMatrix,
);

// Owner response sheet (blank answers)
writeCSV(
  path.join(DOCS, 'owner-response-sheet.csv'),
  [
    'decision_group_id',
    'question_short',
    'url_count',
    'answer',
    'accepted_products',
    'excluded_products',
    'accepted_conditions',
    'customer_types',
    'fulfilment_methods',
    'geographic_scope',
    'preferred_page_strategy',
    'notes',
  ],
  groups.map(([bdId, urls]) => ({
    decision_group_id: bdId,
    question_short: urls[0]._meta.question,
    url_count: urls.length,
    answer: '',
    accepted_products: '',
    excluded_products: '',
    accepted_conditions: '',
    customer_types: '',
    fulfilment_methods: '',
    geographic_scope: '',
    preferred_page_strategy: '',
    notes: '',
  })),
);

// Outcome map
const outcomes = [];
const answerKeys = [
  ['A', 'YES_KEEP_SEPARATE', 'IMPROVE', 'self', 'improve_unique_value', 'none', 'keep', 'retain', '12H'],
  ['B', 'YES_MERGE_TO_HUB', 'MERGE', 'hub', 'merge_content_if_any', 'add_301/308_to_hub', 'remove_sources', 'retarget_to_hub', '12I'],
  ['C', 'YES_WITH_LIMITATIONS', 'IMPROVE', 'self', 'document_limits', 'none', 'keep', 'retain', '12H'],
  ['D', 'NO_SERVICE', 'REDIRECT', 'hub', 'remove_or_retire', 'add_301/308_to_hub', 'remove_sources', 'retarget_to_hub', '12G'],
  ['E', 'UNCERTAIN', 'KEEP_MONITOR', 'self', 'none_until_gsc_or_owner', 'none', 'keep', 'retain', 'HOLD'],
];
for (const [bdId, urls] of groups) {
  const meta = urls[0]._meta;
  for (const [ans, resulting, classif, tgt, content, redir, sm, il, batch] of answerKeys) {
    outcomes.push({
      decision_group_id: bdId,
      owner_answer: ans,
      resulting_classification: `${resulting}/${classif}`,
      target_url: tgt === 'hub' ? meta.hub : 'self',
      content_action: content,
      redirect_action: redir,
      sitemap_action: sm,
      internal_link_action: il,
      risk: meta.risk,
      implementation_batch: batch,
    });
  }
}
writeCSV(
  path.join(DOCS, 'decision-outcome-map.csv'),
  [
    'decision_group_id',
    'owner_answer',
    'resulting_classification',
    'target_url',
    'content_action',
    'redirect_action',
    'sitemap_action',
    'internal_link_action',
    'risk',
    'implementation_batch',
  ],
  outcomes,
);

// Target validation
const targetRows = [];
for (const [bdId, urls] of groups) {
  const meta = urls[0]._meta;
  const hub = meta.hub;
  const hubPage = pages.get(hub);
  let target_status = 'unknown';
  let target_indexable = 'unknown';
  let target_canonical = 'unknown';
  let target_in_sitemap = sitemapUrls.has(hub) ? 'yes' : 'no';
  let valid = 'uncertain';
  if (hubPage) {
    const html = readText(hubPage);
    target_status = '200-local-build';
    const noindex = /name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
    target_indexable = noindex ? 'no' : 'yes';
    const can =
      (html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i) ||
        html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) ||
        [])[1] || '';
    let canPath = '';
    try {
      canPath = decodeURIComponent(new URL(can).pathname.replace(/\/$/, '') || '/');
    } catch {
      canPath = can;
    }
    target_canonical = canPath === hub ? 'self' : canPath || 'missing';
    valid =
      !noindex && target_canonical === 'self' && target_in_sitemap === 'yes' ? 'yes' : 'needs_review';
  } else {
    valid = 'needs_review';
  }
  for (const u of urls.slice(0, 3)) {
    targetRows.push({
      decision_group_id: bdId,
      source_url: u.url,
      proposed_target: hub,
      target_status,
      target_indexable,
      target_canonical,
      target_in_sitemap,
      intent_match: 'service-hub-same-category — provisional',
      content_match: 'hub covers category; province LP is thin template',
      redirect_chain_risk: 'low_if_hub_self_canonical',
      valid_target: valid,
    });
  }
  // also sample homepage as invalid default
  targetRows.push({
    decision_group_id: bdId,
    source_url: urls[0].url,
    proposed_target: '/',
    target_status: pages.has('/') ? '200' : 'unknown',
    target_indexable: 'yes',
    target_canonical: 'self',
    target_in_sitemap: sitemapUrls.has('/') ? 'yes' : 'no',
    intent_match: 'poor — homepage not category intent',
    content_match: 'no',
    redirect_chain_risk: 'n/a',
    valid_target: 'no — homepage not default',
  });
}
writeCSV(
  path.join(DOCS, 'target-validation.csv'),
  [
    'decision_group_id',
    'source_url',
    'proposed_target',
    'target_status',
    'target_indexable',
    'target_canonical',
    'target_in_sitemap',
    'intent_match',
    'content_match',
    'redirect_chain_risk',
    'valid_target',
  ],
  targetRows,
);

// Claims inventory (sample up to 2 URLs per group from dist)
const claimRows = [];
let trustRiskUrls = 0;
for (const [bdId, urls] of groups) {
  const sample = urls.slice(0, 2);
  for (const u of sample) {
    const f = pages.get(u.url);
    if (!f) {
      claimRows.push({
        decision_group_id: bdId,
        url: u.url,
        field: 'route',
        current_claim: 'built page missing in dist — verify after build',
        claim_type: 'OTHER',
        business_fact_confirmed: 'no',
        risk: 'medium',
        recommended_action_after_decision: 're-check claims when implementing',
      });
      continue;
    }
    const html = readText(f);
    const claims = extractClaims(html, u.url);
    for (const c of claims) {
      if (c.risk === 'KNOWN TRUST ISSUE') trustRiskUrls += 1;
      claimRows.push({
        decision_group_id: bdId,
        url: u.url,
        field: c.field,
        current_claim: c.current_claim.slice(0, 240),
        claim_type: c.claim_type,
        business_fact_confirmed:
          c.claim_type === 'LOCATION' && c.risk.includes('fake-local')
            ? 'no — remote service model only confirmed'
            : 'partial — store facts confirmed; service scope UNKNOWN',
        risk: c.risk,
        recommended_action_after_decision:
          'align claims with owner answer; do not invent branch language',
      });
    }
  }
}
writeCSV(
  path.join(DOCS, 'current-claim-inventory.csv'),
  [
    'decision_group_id',
    'url',
    'field',
    'current_claim',
    'claim_type',
    'business_fact_confirmed',
    'risk',
    'recommended_action_after_decision',
  ],
  claimRows,
);

// GSC / external
writeCSV(
  path.join(DOCS, 'gsc-evidence.csv'),
  ['url', 'decision_group_id', 'gsc_status', 'notes'],
  candidates.map((c) => ({
    url: c.url,
    decision_group_id: metaForGroup(
      rbd.find((x) => x.url === c.url)?.group_id || '',
      c.url,
    ).id,
    gsc_status: 'GSC DATA NOT AVAILABLE IN REPOSITORY',
    notes: 'SEARCH DEMAND UNKNOWN — CONSERVATIVE ACTION REQUIRED',
  })),
);
writeCSV(
  path.join(DOCS, 'external-link-evidence.csv'),
  ['url', 'decision_group_id', 'external_link_status', 'notes'],
  candidates.map((c) => ({
    url: c.url,
    decision_group_id: metaForGroup(
      rbd.find((x) => x.url === c.url)?.group_id || '',
      c.url,
    ).id,
    external_link_status: 'EXTERNAL LINK DATA NOT AVAILABLE',
    notes: 'Do not infer zero backlinks',
  })),
);

// Priority
const priorityRows = groups.map(([bdId, urls]) => {
  const meta = urls[0]._meta;
  return {
    decision_group_id: bdId,
    decision_group_name: meta.name,
    priority: meta.priority,
    url_count: urls.length,
    rationale:
      meta.priority === 'A'
        ? 'trust/fulfilment/b2b/auction or large-item risk'
        : meta.priority === 'B'
          ? 'secondary category; merge candidate likely; demand unknown'
          : 'long-tail / lower claim risk; can keep-monitor',
    owner_question: meta.question,
  };
});
writeCSV(
  path.join(DOCS, 'decision-priority.csv'),
  [
    'decision_group_id',
    'decision_group_name',
    'priority',
    'url_count',
    'rationale',
    'owner_question',
  ],
  priorityRows,
);

// Implementation batch plan — one decision group ≈ one implementable unit (~19 URLs)
const batchPlan = [];
let gSeq = 1;
let hSeq = 1;
for (const [bdId, urls] of groups) {
  const meta = urls[0]._meta;
  const isA = meta.priority === 'A';
  const proposed = isA ? `Batch 12G-${gSeq++}` : `Batch 12H-${hSeq++}`;
  batchPlan.push({
    proposed_batch: proposed,
    decision_group_ids: bdId,
    url_count: String(urls.length),
    action_type: isA
      ? 'priority_A_trust_service_or_redirect_after_owner'
      : 'priority_B_keep_improve_or_merge_after_owner',
    risk: meta.risk,
    dependencies: `owner answer for ${bdId}; valid target ${meta.hub}`,
    expected_sitemap_diff:
      '0 if A/C/E; -' + urls.length + ' if B/D redirect-all',
    expected_redirect_count: '0 or ' + urls.length,
    requires_gsc: isA || meta.priority === 'B' ? 'recommended_before_mass_merge' : 'optional',
    requires_owner_approval: 'yes',
  });
}
batchPlan.push({
  proposed_batch: 'Batch 12I',
  decision_group_ids: 'owner_selected_merge_pilot (5-19 URLs from any BD answering B)',
  url_count: '5-19',
  action_type: 'confirmed_merge_pilot',
  risk: 'medium',
  dependencies: 'at least one group answered B + hub valid',
  expected_sitemap_diff: '-pilot_count',
  expected_redirect_count: 'pilot_count',
  requires_gsc: 'strongly_recommended',
  requires_owner_approval: 'yes',
});
batchPlan.push({
  proposed_batch: 'Batch 12J',
  decision_group_ids: 'remaining_B_or_D_after_12I',
  url_count: 'remainder',
  action_type: 'remaining_merge_or_redirect',
  risk: 'medium-high',
  dependencies: '12I lessons + optional GSC',
  expected_sitemap_diff: '-remainder',
  expected_redirect_count: 'remainder',
  requires_gsc: 'recommended',
  requires_owner_approval: 'yes',
});
batchPlan.push({
  proposed_batch: 'NOTE — Remaining MERGE furniture (out of 12F RBD)',
  decision_group_ids: 'G-SA-รับซื้อเฟอร์นิเจอร์',
  url_count: String(furnitureMerge.length),
  action_type: 'separate_MERGE_family_not_in_RBD_set',
  risk: 'medium',
  dependencies: 'owner furniture policy; pattern similar to collectibles 12B/12C',
  expected_sitemap_diff: `-${furnitureMerge.length}_if_merged`,
  expected_redirect_count: String(furnitureMerge.length),
  requires_gsc: 'recommended',
  requires_owner_approval: 'yes',
});
writeCSV(
  path.join(DOCS, 'implementation-batch-plan.csv'),
  [
    'proposed_batch',
    'decision_group_ids',
    'url_count',
    'action_type',
    'risk',
    'dependencies',
    'expected_sitemap_diff',
    'expected_redirect_count',
    'requires_gsc',
    'requires_owner_approval',
  ],
  batchPlan,
);

// Owner questionnaire MD
const qLines = [
  '# Owner Decision Questionnaire — Batch 12F',
  '',
  'เอกสารนี้ถามเฉพาะเรื่องที่ยังไม่ยืนยันทางธุรกิจ',
  'ข้อมูลที่ยืนยันแล้วแล้ว: หน้าร้านอยู่เฉพาะอุบลราชธานี (740/8 ถนนชยางกูร), ไม่มีสาขาจังหวัดอื่น, ประเมินนอกพื้นที่ผ่านรูป/ข้อมูล, นัดรับหรือจัดส่งเป็นรายกรณี',
  '',
  `จำนวน URL ที่รอตัดสิน: **${EXPECTED_RBD}**`,
  `จำนวนคำถาม (Decision Groups): **${groups.length}**`,
  `อัตราลดคำถาม: **${EXPECTED_RBD} → ${groups.length}** (reduction ${(100 - (groups.length / EXPECTED_RBD) * 100).toFixed(1)}%)`,
  '',
  'วิธีตอบ: เลือก A–E ต่อกลุ่ม แล้วกรอก `owner-response-sheet.csv`',
  '',
];

for (const [bdId, urls] of groups) {
  const meta = urls[0]._meta;
  qLines.push(`## Decision ${bdId}`);
  qLines.push('');
  qLines.push(`**${meta.name}**`);
  qLines.push('');
  qLines.push(meta.question + '?');
  qLines.push('');
  qLines.push('ตัวเลือก:');
  qLines.push('A. รับซื้อและต้องการเก็บหน้าแยกตามจังหวัด');
  qLines.push('B. รับซื้อ แต่ควรรวมเข้าหน้าบริการหลัก');
  qLines.push('C. รับซื้อเฉพาะบางประเภทหรือบางสภาพ (ระบุใน notes)');
  qLines.push('D. ไม่รับซื้อ / ไม่ต้องการให้หน้านี้สื่อว่าให้บริการ');
  qLines.push('E. ต้องตรวจสอบเพิ่มเติม / ยังไม่ตัดสิน');
  qLines.push('');
  qLines.push(`URL ที่ได้รับผลกระทบ (${urls.length}):`);
  for (const u of urls) qLines.push(`- ${u.url}`);
  qLines.push('');
  qLines.push('หากตอบ A:');
  qLines.push('- Implementation: KEEP + IMPROVE เนื้อหาเฉพาะหมวด (คล้าย Batch 12D/12E) โดยไม่สร้างสาขา');
  qLines.push('- ต้องเพิ่ม: เช็กลิสต์สินค้า, เงื่อนไขสภาพ, วิธีส่งมอบที่ตรงจริง');
  qLines.push('');
  qLines.push('หากตอบ B:');
  qLines.push(`- Proposed merge/redirect target: \`${meta.hub}\``);
  qLines.push('- Redirect impact: ทุก URL ในกลุ่ม → hub (ตรวจ self-canonical แล้วใน target-validation)');
  qLines.push('');
  qLines.push('หากตอบ C:');
  qLines.push('- ระบุประเภท/สภาพที่รับและไม่รับใน notes');
  qLines.push('- Implementation: KEEP/IMPROVE พร้อมข้อความเงื่อนไขที่ตรวจสอบได้');
  qLines.push('');
  qLines.push('หากตอบ D:');
  qLines.push(`- Proposed redirect target: \`${meta.hub}\` (ไม่ใช้ homepage เป็นค่าเริ่มต้น)`);
  qLines.push('- หรือ REMOVE_ROUTE หลังเก็บลิงก์ภายในแล้ว');
  qLines.push('');
  qLines.push('หากตอบ E:');
  qLines.push('- KEEP_MONITOR — ไม่ merge/redirect จนกว่ามีคำตอบหรือ GSC');
  qLines.push('');
  qLines.push(`ความเสี่ยง: ${meta.risk}`);
  qLines.push('');
  qLines.push('---');
  qLines.push('');
}
fs.writeFileSync(path.join(DOCS, 'owner-decision-questionnaire.md'), qLines.join('\n'), 'utf8');

// Risk register
const riskMd = `# Risk Register — Batch 12F

| risk | affected_group | likelihood | impact | owner_decision | mitigation | validation | rollback |
|---|---|---|---|---|---|---|---|
| Service claim ไม่ตรงธุรกิจ | all BD groups | medium | high | A–D | รอคำตอบก่อนแก้ claim | claim inventory + prod crawl | revert content/redirect |
| Redirect ผิด Intent | B/D answers | medium | high | B/D | ใช้ hub หมวดเดียวกันที่ผ่าน target-validation | intent check + 200/self-can | remove redirect rule |
| Traffic loss | merge/redirect groups | unknown | medium | B/D | GSC before mass merge; pilot 12I | GSC after deploy | restore routes |
| Long-tail loss | all non-Ubon SA | unknown | medium | A/B | SEARCH DEMAND UNKNOWN — conservative | keep-monitor if E | n/a |
| Backlink loss | all | unknown | medium | B/D | EXTERNAL LINK DATA NOT AVAILABLE — conservative | check when data exists | 301 retain equity |
| Index removal | D/B | medium | medium | B/D | sitemap remove only after redirect | sitemap count | re-include |
| Fake local-service impression | all province LPs | high | high | A–D | ไม่สื่อสาขา; ใช้โมเดลประเมินผ่านรูป | claim scan | rewrite claims |
| Large-item fulfilment | BD-01, BD-05, BD-06 | medium | high | A/C/D | ถามความสามารถขนส่ง/นัดรับ | owner notes | limit claims |
| Auction/bulk ambiguity | BD-07 | high | high | A–D | ถามแยกหมวดประมูล | owner sheet | tighten copy |
| Product-condition ambiguity | BD-03, BD-06, others | medium | medium | C | ถามสภาพที่รับ | content limits | soften claims |
| Duplicate content | all template families | high | medium | B | merge to hub if no unique value | similarity | improve if A |
| Internal-link cleanup | B/D | medium | medium | B/D | retarget links with redirects | batch-11 QA | restore links |
| Sitemap changes | B/D | medium | low | B/D | expect count drop = redirected URLs | sitemap QA | republish |
| Redirect-rule growth | B/D | medium | medium | B/D | explicit per-URL like 12B/12C; no wildcards unless approved | redirect QA | delete rules |
| GSC unavailable | all | certain | medium | E possible | flag UNKNOWN demand | n/a | n/a |
| External-link data unavailable | all | certain | medium | conservative | do not assume zero links | n/a | n/a |
| F-12 warning | host | certain | low | out of scope | ignore as baseline | batch-7 | n/a |
`;
fs.writeFileSync(path.join(DOCS, 'risk-register.md'), riskMd, 'utf8');

const priA = priorityRows.filter((p) => p.priority === 'A');
const priB = priorityRows.filter((p) => p.priority === 'B');
const priC = priorityRows.filter((p) => p.priority === 'C');
const validTargets = targetRows.filter((t) => t.valid_target === 'yes').length;
const reviewTargets = targetRows.filter((t) => String(t.valid_target).includes('review') || t.valid_target === 'uncertain').length;

const reduction = ((1 - groups.length / EXPECTED_RBD) * 100).toFixed(1);

const summary = {
  original_f04: all.length,
  false_positives: fp.length,
  collectibles_resolved: collectiblesMerge.length,
  improve_resolved: improve.length,
  merge_remaining: furnitureMerge.length,
  rbd: rbd.length,
  decision_groups: groups.length,
  reduction_ratio_pct: Number(reduction),
  priority_a_groups: priA.length,
  priority_b_groups: priB.length,
  priority_c_groups: priC.length,
  priority_a_urls: priA.reduce((s, p) => s + Number(p.url_count), 0),
  priority_b_urls: priB.reduce((s, p) => s + Number(p.url_count), 0),
  priority_c_urls: priC.reduce((s, p) => s + Number(p.url_count), 0),
  owner_questions: groups.length,
  valid_hub_targets: validTargets,
  targets_needing_review: reviewTargets,
  gsc: 'GSC DATA NOT AVAILABLE IN REPOSITORY',
  external: 'EXTERNAL LINK DATA NOT AVAILABLE',
  group_ids: groups.map(([id, u]) => ({ id, name: u[0]._meta.name, n: u.length, priority: u[0]._meta.priority })),
};

fs.writeFileSync(path.join(DOCS, '_audit-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote reports to ${DOCS}`);
