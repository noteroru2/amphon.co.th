/**
 * Batch 12A — read-only thin content decision audit (F-04).
 * Generates reports under docs/batch-12a-thin-content-decisions/ only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  extractHrefs,
  normalizePathname,
  readText,
  walkFiles,
  distDir,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOC = path.join(ROOT, 'docs/batch-12a-thin-content-decisions');
const PROVINCES = [
  'กาฬสินธุ์',
  'ขอนแก่น',
  'ชัยภูมิ',
  'นครพนม',
  'นครราชสีมา',
  'บึงกาฬ',
  'บุรีรัมย์',
  'มหาสารคาม',
  'มุกดาหาร',
  'ยโสธร',
  'ร้อยเอ็ด',
  'ศรีสะเกษ',
  'สกลนคร',
  'สุรินทร์',
  'หนองคาย',
  'หนองบัวลำภู',
  'อำนาจเจริญ',
  'อุดรธานี',
  'อุบลราชธานี',
  'เลย',
];

const SECONDARY_SERVICES = new Set([
  'รับซื้อ-server',
  'รับซื้อ-ups',
  'รับซื้อของสะสม',
  'รับซื้อทีวี',
  'รับซื้ออุปกรณ์-network',
  'รับซื้อเฟอร์นิเจอร์',
  'รับซื้อเครื่องใช้ไฟฟ้า',
  'รับซื้อหูฟัง',
  'รับซื้อลำโพงบลูทูธ',
  'รับซื้อโดรน',
]);

const TRUST_PATTERNS = [
  /มีสาขาในจังหวัด/,
  /หน้าร้านประจำจังหวัด/,
  /สำนักงานประจำ/,
  /ทีมงานประจำจังหวัด/,
  /เปิดทุกวันในจังหวัด/,
  /เข้ารับได้ทุกพื้นที่ทันที/,
];

fs.mkdirSync(DOC, { recursive: true });

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

function toCsv(rows, cols) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}

function stripHtmlNoise(html) {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ');
  const main = h.match(/<main[\s\S]*?<\/main>/i);
  if (main) h = main[0];
  h = h
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return h;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function normalizeTemplateText(text) {
  let t = text;
  for (const p of PROVINCES) t = t.split(p).join('PROVINCE');
  t = t
    .replace(/line\s*@webuy/gi, 'CONTACT')
    .replace(/064[-\s]?257[-\s]?9353/g, 'PHONE')
    .replace(/อำพล\s*เทรดดิ้ง/g, 'BRAND');
  return t;
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function parseServiceArea(url) {
  if (!url.startsWith('/รับซื้อ/')) return null;
  const slug = url.slice('/รับซื้อ/'.length);
  for (const p of PROVINCES) {
    if (slug.endsWith(`-${p}`)) {
      return { serviceSlug: slug.slice(0, -(p.length + 1)), province: p, slug };
    }
  }
  return { serviceSlug: slug, province: '', slug };
}

function sourceFileGuess(url) {
  if (url.startsWith('/blog/')) return `src/content/blog/${url.slice(6)}.md`;
  if (url.startsWith('/รับซื้อ/')) return `src/content/serviceAreas/${url.slice(8)}.md`;
  if (url.startsWith('/บริการ/')) return `src/content/services/${url.slice(8)}.md`;
  if (url.startsWith('/พื้นที่ให้บริการ/')) return `src/content/areas/${url.slice(19)}.md`;
  if (url === '/contact') return 'src/pages/contact.astro';
  if (url === '/privacy-policy') return 'src/pages/privacy-policy.astro';
  return '';
}

// --- Load inventories ---
const qualityRows = parseCSV(readText(path.join(ROOT, 'docs/seo-audit-2026-07-31/content-quality-audit.csv')));
const qh = Object.fromEntries(qualityRows[0].map((h, i) => [h, i]));
const thinFromAudit = qualityRows.slice(1).filter((r) => /THIN/i.test(r[qh.issues] || ''));

const deferredRows = parseCSV(
  readText(path.join(ROOT, 'docs/batch-11-internal-link-architecture/deferred-to-f04.csv')),
);
const dh = Object.fromEntries(deferredRows[0].map((h, i) => [h, i]));
const deferredSet = new Set(deferredRows.slice(1).map((r) => r[dh.url]));

const priRows = parseCSV(
  readText(path.join(ROOT, 'docs/batch-11-internal-link-architecture/page-priority-map.csv')),
);
const ph = Object.fromEntries(priRows[0].map((h, i) => [h, i]));
const priority = new Map(priRows.slice(1).map((r) => [r[ph.url], r]));

const metricsRows = parseCSV(
  readText(path.join(ROOT, 'docs/batch-11-internal-link-architecture/page-metrics-diff.csv')),
);
const mh = Object.fromEntries(metricsRows[0].map((h, i) => [h, i]));
const metrics = new Map(metricsRows.slice(1).map((r) => [r[mh.url], r]));

const approvedPath = path.join(ROOT, 'docs/batch-11-internal-link-architecture/approved-links.json');
const approved = fs.existsSync(approvedPath) ? JSON.parse(readText(approvedPath)) : [];
const receivedNew = new Map();
for (const a of approved) {
  if (!receivedNew.has(a.destination_url)) receivedNew.set(a.destination_url, []);
  receivedNew.get(a.destination_url).push(a.source_url);
}

const built = collectBuiltPages();
const notes = [];
notes.push(`built_pages=${built.size}`);
if (built.size === 0) {
  console.error('No dist — run npm run build before audit:batch-12a-thin-content');
  process.exit(1);
}

// inbound from current build
const inbound = new Map([...built.keys()].map((u) => [u, new Set()]));
const outbound = new Map([...built.keys()].map((u) => [u, new Set()]));
for (const [pathname, filePath] of built) {
  if (pathname.includes('404')) continue;
  const html = readText(filePath);
  for (const href of extractHrefs(html)) {
    const dest = normalizePathname(href);
    if (!dest || !built.has(dest)) continue;
    inbound.get(dest)?.add(pathname);
    outbound.get(pathname)?.add(dest);
  }
}

// sitemap set
const sitemapUrls = new Set();
for (const f of walkFiles(distDir).filter((x) => /sitemap.*\.xml$/i.test(x))) {
  const xml = readText(f);
  if (/<sitemapindex/i.test(xml)) continue;
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      const p = decodeURIComponent(new URL(m[1]).pathname.replace(/\/$/, '') || '/');
      sitemapUrls.add(p);
    } catch {
      /* skip */
    }
  }
}

const auditUrls = new Set(thinFromAudit.map((r) => r[qh.url] || r[0]));
const allCandidates = new Set([...auditUrls, ...deferredSet]);

const reconciliation = [];
const inventory = [];
const uniqueValue = [];
const cannibalization = [];
const linkImpact = [];
const decisions = [];
const improvements = [];
const redirects = [];
const similarityPairs = [];

const groupStats = new Map();
const mainTextByUrl = new Map();

function meta(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}

function canonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function h1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function classifyCandidate(url, ctx) {
  const { pageType, province, serviceSlug, words, templateRatio, trustIssue, uniqueFlags } = ctx;
  let classification = 'IMPROVE';
  let target = '';
  let priority = 'P2';
  let human = 'no';
  let confidence = 'medium';
  let reason = '';

  if (url === '/contact' || url === '/privacy-policy') {
    classification = 'FALSE_POSITIVE';
    priority = 'P3';
    confidence = 'high';
    reason =
      'Audit นับตัวอักษร main content ต่ำ แต่หน้าเป็น Contact/Legal ที่มีบทบาท navigational/compliance ชัดเจน ไม่ใช่ thin doorway และไม่ควร consolidate กับหน้าบริการ';
    return { classification, target, priority, human, confidence, reason };
  }

  if (pageType === 'blog-article') {
    classification = 'IMPROVE';
    priority = 'P2';
    human = 'no';
    confidence = 'medium';
    reason = `บทความ informational มี Intent แยกจากหน้าบริการ แต่เนื้อหาสั้นและ boilerplate สูง (~${words} คำที่มองเห็น) ควรขยายขั้นตอน/ข้อควรตรวจเฉพาะหัวข้อโดยไม่สร้าง claim เกินจริง ไม่แนะนำ Redirect เพราะ Intent ไม่ตรง Hub`;
    return { classification, target, priority, human, confidence, reason };
  }

  if (pageType === 'service-x-location' && serviceSlug === 'รับเหมาประมูลอุปกรณ์ไอที') {
    classification = 'REQUIRES_BUSINESS_DECISION';
    target = province
      ? `/บริการ/รับเหมาประมูลอุปกรณ์ไอที หรือ /พื้นที่ให้บริการ/${province}`
      : '/บริการ/รับเหมาประมูลอุปกรณ์ไอที';
    priority = 'P1';
    human = 'yes';
    confidence = 'low';
    reason = `หน้าประมูล/รับเหมา × ${province || 'พื้นที่'} อยู่ในรายการ thin ของ Audit แต่เป็น Intent องค์กร/ยกล็อตที่อาจมีมูลค่าธุรกิจสูงกว่าหมวดรองทั่วไป — ห้าม MERGE/REDIRECT ทั้งกลุ่มจนกว่าธุรกิจยืนยันว่ายังรับงานประเภทนี้รายจังหวัด และมี GSC/ดีมานด์ประกอบ`;
    return { classification, target, priority, human, confidence, reason };
  }

  if (pageType === 'service-x-location' && SECONDARY_SERVICES.has(serviceSlug)) {
    const serviceHub = `/บริการ/${serviceSlug}`;
    const areaHub = province ? `/พื้นที่ให้บริการ/${province}` : '';
    if (province === 'อุบลราชธานี') {
      classification = 'IMPROVE';
      priority = 'P1';
      human = 'yes';
      confidence = 'medium';
      reason = `หน้า ${serviceSlug} × อุบลราชธานี อยู่จังหวัดที่มีหน้าร้านจริง จึงมีโอกาสเพิ่ม Unique Value (จุดรับของ เส้นทาง อำเภอที่นัดรับบ่อย) ได้โดยไม่สร้างสาขาปลอม ปัจจุบันยังเป็น Template สลับชื่อจังหวัด/สินค้าเป็นหลัก (template_ratio≈${templateRatio}) — แนะนำ IMPROVE ก่อนพิจารณา Merge`;
      return { classification, target, priority, human, confidence, reason };
    }

    // Non-Ubon secondary: pilot-friendly merge to service hub for lowest-demand families
    const lowDemandPilot = new Set(['รับซื้อของสะสม', 'รับซื้อเฟอร์นิเจอร์', 'รับซื้อลำโพงบลูทูธ', 'รับซื้อหูฟัง']);
    if (lowDemandPilot.has(serviceSlug)) {
      classification = 'MERGE';
      target = serviceHub;
      priority = 'P1';
      human = 'yes';
      confidence = 'medium';
      reason = `หน้า ${serviceSlug} ใน${province} เปลี่ยนเพียงชื่อจังหวัดจาก Template เดียวกับจังหวัดอื่น ไม่มีขั้นตอนรับสินค้า/จุดนัดหมาย/ข้อจำกัดเฉพาะพื้นที่ที่แตกต่าง และ Intent เชิงพาณิชย์ทับซ้อนกับ ${serviceHub} มากกว่าหน้าพื้นที่ทั่วไป — จัดเป็น MERGE candidate ไปยัง Service Hub (ต้อง Human Review + ยืนยันว่าไม่ต้องการ long-tail ท้องถิ่นก่อน Implementation)`;
      return { classification, target, priority, human, confidence, reason };
    }

    classification = 'REQUIRES_BUSINESS_DECISION';
    target = `${serviceHub} หรือ ${areaHub}`;
    priority = 'P2';
    human = 'yes';
    confidence = 'low';
    reason = `หน้า ${serviceSlug} × ${province} เป็น Template ท้องถิ่นของบริการรอง มี Unique Value ต่ำ (ส่วนใหญ่รายชื่ออำเภอ + CTA) แต่การ Redirect ทั้งกลุ่มไป Hub อาจตัด long-tail ท้องถิ่น หากธุรกิจยังรับสินค้าประเภทนี้ในพื้นที่จริง — ต้องยืนยัน Demand/นโยบายบริการก่อนเลือก IMPROVE ทั้งจังหวัด หรือ MERGE ไป ${serviceHub}`;
    return { classification, target, priority, human, confidence, reason };
  }

  if (pageType === 'service-x-location') {
    classification = 'KEEP_MONITOR';
    priority = 'P3';
    reason = `หน้า service×location นอกกลุ่ม secondary ที่ Batch 11 defer — ตรวจแล้วมีในรายการ thin ของ Audit เดิม แต่ต้องยืนยันคุณภาพจาก GSC ก่อนแก้; ตอนนี้ไม่เสนอ Redirect`;
    human = 'yes';
    confidence = 'low';
    return { classification, target, priority, human, confidence, reason };
  }

  classification = 'KEEP_MONITOR';
  priority = 'P3';
  human = 'yes';
  confidence = 'low';
  reason = `Candidate จากรายการ thin แต่ page type (${pageType}) ไม่อยู่ในกลุ่ม Template รองหลัก — เก็บไว้ monitor จนกว่ามี GSC หรือรีวิวเนื้อหาเชิงลึก`;
  return { classification, target, priority, human, confidence, reason };
}

for (const url of [...allCandidates].sort((a, b) => a.localeCompare(b, 'th'))) {
  const inAudit = auditUrls.has(url) ? 'yes' : 'no';
  const inB11 = deferredSet.has(url) ? 'yes' : 'no';
  const exists = built.has(url);
  const sa = parseServiceArea(url);
  const pageType =
    url.startsWith('/blog/')
      ? 'blog-article'
      : url.startsWith('/รับซื้อ/')
        ? 'service-x-location'
        : url.startsWith('/บริการ/')
          ? 'service-page'
          : url.startsWith('/พื้นที่ให้บริการ/')
            ? 'location-page'
            : url === '/contact' || url === '/privacy-policy'
              ? 'utility'
              : 'other';

  let production_status = exists ? '200-local-build' : 'MISSING_ROUTE';
  let indexable = 'unknown';
  let can = '';
  let inSitemap = sitemapUrls.has(url) ? 'yes' : 'no';
  let words = 0;
  let html = '';
  let titleH1 = '';
  let robots = '';
  let trustIssue = 'no';
  let templateRatio = '';

  if (exists) {
    html = readText(built.get(url));
    robots = meta(html, 'robots');
    indexable = /noindex/i.test(robots) ? 'no' : 'yes';
    can = canonical(html) || `https://amphon.co.th${url}`;
    titleH1 = h1(html);
    const main = stripHtmlNoise(html);
    mainTextByUrl.set(url, main);
    words = tokenize(main).length;
    for (const pat of TRUST_PATTERNS) {
      if (pat.test(main) || pat.test(html)) trustIssue = 'TRUST/CORRECTNESS ISSUE';
    }
    const auditRow = thinFromAudit.find((r) => (r[qh.url] || r[0]) === url);
    if (auditRow && qh.boilerplate_shingle_ratio != null) {
      templateRatio = auditRow[qh.boilerplate_shingle_ratio] || '';
    }
  } else {
    production_status = 'ALREADY RESOLVED / MISSING';
  }

  let current_classification = 'ACTIVE_CANDIDATE';
  let reason_diff = '';
  if (!exists) {
    current_classification = 'ALREADY RESOLVED';
    reason_diff = 'ไม่พบใน build ปัจจุบัน';
  } else if (inAudit === 'yes' && inB11 === 'no') {
    reason_diff = 'อยู่ใน F-04 Audit แต่ไม่อยู่ Batch11 deferred (เช่น utility/contact)';
  } else if (inAudit === 'no' && inB11 === 'yes') {
    reason_diff = 'Batch11 deferred แต่ไม่ติด THIN flag ใน content-quality-audit';
  } else {
    reason_diff = 'ซ้อนทับทั้ง Audit และ Batch11';
  }

  const include = exists ? 'yes' : 'no';

  reconciliation.push({
    url,
    in_original_f04: inAudit,
    in_batch11_deferred: inB11,
    current_route_exists: exists ? 'yes' : 'no',
    production_status,
    indexable,
    canonical: can,
    sitemap: inSitemap,
    current_classification,
    reason_for_difference: reason_diff,
    include_in_batch12a: include,
  });

  if (!exists) continue;

  const serviceSlug = sa?.serviceSlug || '';
  const province = sa?.province || '';
  const groupId =
    pageType === 'blog-article'
      ? 'G-BLOG-THIN'
      : pageType === 'utility'
        ? 'G-UTILITY'
        : SECONDARY_SERVICES.has(serviceSlug)
          ? `G-SA-${serviceSlug}`
          : `G-SA-OTHER`;

  if (!groupStats.has(groupId)) {
    groupStats.set(groupId, {
      urls: [],
      words: [],
      page_type: pageType,
      serviceSlug,
    });
  }
  groupStats.get(groupId).urls.push(url);
  groupStats.get(groupId).words.push(words);

  const hasDistrict = /อำเภอ|เขตเมือง|วาริน|เมือง/.test(mainTextByUrl.get(url) || '');
  const hasProcess = /ส่งรูป|ประเมิน|นัดรับ|ขนส่ง/.test(mainTextByUrl.get(url) || '');
  const uniquePresent =
    pageType === 'utility'
      ? 'yes'
      : pageType === 'blog-article'
        ? 'partial'
        : province === 'อุบลราชธานี'
          ? 'partial'
          : 'low';

  uniqueValue.push({
    url,
    group_id: groupId,
    unique_value_present: uniquePresent,
    unique_value_types:
      pageType === 'blog-article'
        ? 'informational-topic'
        : pageType === 'utility'
          ? 'navigational-legal'
          : 'province-name-swap;district-list;cta-to-hub',
    location_specific_value: hasDistrict ? 'district-list-only' : 'province-name-only',
    service_specific_value: serviceSlug ? 'service-label-in-template' : 'n/a',
    product_specific_value: 'n/a',
    process_specific_value: hasProcess ? 'generic-eval-steps' : 'none',
    shipping_or_meetup_value: /นัดรับ|ขนส่ง/.test(mainTextByUrl.get(url) || '')
      ? 'generic-conditional-pickup'
      : 'none',
    district_or_area_value: hasDistrict ? 'yes-list' : 'no',
    original_faq_value: /faq/i.test(html) ? 'layout-faq-possible' : 'none-detected',
    original_example_value: 'none',
    business_value:
      SECONDARY_SERVICES.has(serviceSlug) && province !== 'อุบลราชธานี' ? 'low-uncertain' : 'medium',
    user_value: pageType === 'utility' ? 'high' : uniquePresent === 'low' ? 'low' : 'medium',
    evidence: `visible_words=${words}; template_family=${groupId}; trust=${trustIssue}`,
  });

  const serviceHub = serviceSlug ? `/บริการ/${serviceSlug}` : '';
  const areaHub = province ? `/พื้นที่ให้บริการ/${province}` : '';
  cannibalization.push({
    url,
    primary_intent:
      pageType === 'blog-article'
        ? 'informational'
        : pageType === 'utility'
          ? 'navigational'
          : 'local-commercial',
    closest_competing_url: serviceHub || areaHub || '/',
    competing_intent: serviceHub ? 'commercial-national' : 'local-hub',
    title_overlap: 'high-template',
    h1_overlap: 'high-template',
    content_overlap: 'high-within-family',
    canonical_relationship: 'self',
    internal_anchor_overlap: 'descriptive-province',
    gsc_evidence: 'GSC_NOT_AVAILABLE',
    cannibalization_risk:
      pageType === 'service-x-location' && SECONDARY_SERVICES.has(serviceSlug) ? 'medium' : 'low',
    recommended_primary_url: serviceHub || url,
    decision_impact: 'may-merge-or-improve',
  });

  const before = Number(priority.get(url)?.[ph.inbound_count] || inbound.get(url)?.size || 0);
  const after = Number(metrics.get(url)?.[mh.inbound_after] || inbound.get(url)?.size || 0);
  const newLinks = receivedNew.get(url) || [];
  linkImpact.push({
    candidate_url: url,
    inbound_before_batch11: before,
    inbound_after_batch11: after,
    received_new_links: newLinks.length ? 'yes' : 'no',
    links_from_sources: newLinks.slice(0, 5).join('|'),
    outbound_links: outbound.get(url)?.size || 0,
    links_to_priority_pages: [...(outbound.get(url) || [])]
      .filter((d) => d.startsWith('/บริการ/') || d.startsWith('/พื้นที่ให้บริการ/'))
      .slice(0, 5)
      .join('|'),
    decision: newLinks.length ? 'REVIEW_LINK_CLEANUP_IF_MERGED' : 'NO_NEW_INBOUND_FROM_B11',
    links_to_remove_if_merged: newLinks.length,
    links_to_update_if_redirected: inbound.get(url)?.size || 0,
    links_to_keep_if_improved: 'all-existing',
    risk: newLinks.length ? 'medium' : 'low',
  });

  const cls = classifyCandidate(url, {
    pageType,
    province,
    serviceSlug,
    words,
    templateRatio,
    trustIssue,
    uniqueFlags: uniquePresent,
  });

  decisions.push({
    url,
    source_file: sourceFileGuess(url),
    page_type: pageType,
    group_id: groupId,
    production_status,
    indexable,
    canonical: can,
    sitemap: inSitemap,
    visible_words: words,
    template_ratio: templateRatio,
    unique_value: uniquePresent,
    primary_intent:
      pageType === 'blog-article'
        ? 'informational'
        : pageType === 'utility'
          ? 'navigational'
          : 'local-commercial',
    closest_competing_url: serviceHub || areaHub,
    cannibalization_risk:
      pageType === 'service-x-location' && SECONDARY_SERVICES.has(serviceSlug) ? 'medium' : 'low',
    gsc_status: 'GSC_NOT_AVAILABLE',
    external_link_status: 'EXTERNAL LINK DATA NOT AVAILABLE',
    inbound_links: inbound.get(url)?.size || 0,
    batch11_link_impact: newLinks.length ? `received_${newLinks.length}_new` : 'none_as_destination',
    business_value:
      province === 'อุบลราชธานี' ? 'higher-store-province' : SECONDARY_SERVICES.has(serviceSlug) ? 'uncertain' : 'medium',
    trust_issue: trustIssue,
    classification: cls.classification,
    recommended_target: cls.target,
    implementation_priority: cls.priority,
    human_review_required: cls.human,
    reason: cls.reason,
    confidence: cls.confidence,
  });

  inventory.push({
    url,
    page_type: pageType,
    group_id: groupId,
    service_slug: serviceSlug,
    province,
    visible_main_text_words: words,
    h1: titleH1,
    indexable,
    sitemap: inSitemap,
    inbound_links: inbound.get(url)?.size || 0,
    trust_issue: trustIssue,
    in_audit: inAudit,
    in_batch11: inB11,
  });

  if (cls.classification === 'IMPROVE') {
    improvements.push({
      url,
      group_id: groupId,
      missing_user_value:
        pageType === 'blog-article'
          ? 'depth-on-topic-steps-risks-examples'
          : 'province-specific-process;pickup-constraints;no-branch-disclaimer;service-prep-checklist',
      required_unique_sections:
        pageType === 'blog-article'
          ? 'checklist;edge-cases;link-to-matching-service'
          : 'how-evaluation-works-here;what-to-prepare;appointment-limits;district-notes-if-verified',
      verified_facts_needed: 'no-fake-branch;no-guaranteed-pickup;store-only-in-ubon',
      business_input_needed:
        province && province !== 'อุบลราชธานี'
          ? 'confirm-service-offered-in-province;typical-logistics'
          : 'optional-local-examples',
      safe_existing_sources: `${serviceHub};${areaHub};/วิธีการรับซื้อ;/contact`,
      prohibited_claims: 'สาขา;ทีมประจำจังหวัด;จ่ายทันทีโดยไม่มีเงื่อนไข;รับทุกเครื่อง',
      minimum_acceptance_criteria:
        'มีขั้นตอนเฉพาะประเภทสินค้า;มีข้อจำกัดการนัดรับที่ถูกต้อง;ไม่มีสาขาปลอม;ไม่ซ้ำ Hub ทั้งหน้า;FAQ เฉพาะอย่างน้อย 2 ข้อ',
      recommended_batch: pageType === 'blog-article' ? '12C-blog-improve' : '12B-sa-improve-ubon-or-pilot',
    });
  }

  if (['MERGE', 'REDIRECT', 'REMOVE_ROUTE'].includes(cls.classification)) {
    redirects.push({
      source_url: url,
      classification: cls.classification,
      proposed_target_url: cls.target.split(' ')[0],
      source_intent: 'local-commercial-secondary',
      target_intent: 'commercial-national-service',
      intent_match: 'partial-to-strong',
      source_unique_value: 'low-template',
      content_to_merge: 'none-material;optional-district-list-if-verified',
      gsc_risk: 'unknown-requires-export',
      external_link_risk: 'unknown',
      internal_link_count: inbound.get(url)?.size || 0,
      sitemap_impact: 'remove-source-after-redirect',
      canonical_impact: 'none-if-301-to-self-canonical-target',
      redirect_chain_risk: 'low-if-target-final',
      human_review_required: 'yes',
      recommendation: cls.reason,
    });
  }
}

// Similarity within groups (sample pairs)
for (const [gid, g] of groupStats) {
  if (g.urls.length < 2) continue;
  const sample = g.urls.slice(0, 8);
  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < sample.length; j++) {
      const ua = sample[i];
      const ub = sample[j];
      const ta = normalizeTemplateText(mainTextByUrl.get(ua) || '');
      const tb = normalizeTemplateText(mainTextByUrl.get(ub) || '');
      const wa = tokenize(ta);
      const wb = tokenize(tb);
      const sim = jaccard(wa, wb);
      const sa = parseServiceArea(ua);
      const sb = parseServiceArea(ub);
      similarityPairs.push({
        url_a: ua,
        url_b: ub,
        group_id: gid,
        normalized_similarity: sim.toFixed(3),
        shared_word_percent: ((sim * 100) | 0) + '%',
        shared_sentence_percent: 'n/a',
        unique_sections_a: 'low',
        unique_sections_b: 'low',
        same_intent: 'yes',
        same_entity: sa?.serviceSlug === sb?.serviceSlug ? 'yes' : 'no',
        same_location: sa?.province === sb?.province ? 'yes' : 'no',
        possible_duplicate: sim >= 0.55 ? 'yes-template-duplicate' : sim >= 0.35 ? 'near' : 'related-template',
        recommended_review: sim >= 0.55 ? 'merge-or-improve-family' : 'monitor',
      });
    }
  }
}

const pageGroups = [];
for (const [gid, g] of [...groupStats.entries()].sort((a, b) => a[0].localeCompare(b[0], 'th'))) {
  const ws = g.words.slice().sort((a, b) => a - b);
  const avg = ws.length ? Math.round(ws.reduce((s, x) => s + x, 0) / ws.length) : 0;
  const med = ws.length ? ws[Math.floor(ws.length / 2)] : 0;
  pageGroups.push({
    group_id: gid,
    group_name: g.serviceSlug || gid,
    page_type: g.page_type,
    template_source:
      g.page_type === 'service-x-location'
        ? 'src/content/serviceAreas/*.md + ServiceAreaLayout'
        : g.page_type === 'blog-article'
          ? 'src/content/blog/*.md'
          : 'page module',
    url_count: g.urls.length,
    example_urls: g.urls.slice(0, 3).join(' | '),
    shared_sections: 'intro-template;cta-to-service;area-blurb;contact',
    variable_sections: 'province-name;service-label;district-list',
    average_visible_words: avg,
    median_visible_words: med,
    minimum_visible_words: ws[0] || 0,
    maximum_visible_words: ws[ws.length - 1] || 0,
    similarity_range: similarityPairs
      .filter((p) => p.group_id === gid)
      .map((p) => Number(p.normalized_similarity))
      .reduce(
        (acc, v, _, arr) =>
          arr.length
            ? `${Math.min(...arr).toFixed(2)}-${Math.max(...arr).toFixed(2)}`
            : 'n/a',
        'n/a',
      ),
    business_role: SECONDARY_SERVICES.has(g.serviceSlug) ? 'secondary-local-landing' : g.page_type,
    search_intent: g.page_type === 'blog-article' ? 'informational' : 'local-commercial',
    risk: SECONDARY_SERVICES.has(g.serviceSlug) ? 'medium-doorway' : 'low',
  });
}

// Write CSVs
fs.writeFileSync(
  path.join(DOC, 'candidate-reconciliation.csv'),
  toCsv(reconciliation, [
    'url',
    'in_original_f04',
    'in_batch11_deferred',
    'current_route_exists',
    'production_status',
    'indexable',
    'canonical',
    'sitemap',
    'current_classification',
    'reason_for_difference',
    'include_in_batch12a',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'thin-content-inventory.csv'),
  toCsv(inventory, [
    'url',
    'page_type',
    'group_id',
    'service_slug',
    'province',
    'visible_main_text_words',
    'h1',
    'indexable',
    'sitemap',
    'inbound_links',
    'trust_issue',
    'in_audit',
    'in_batch11',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'page-group-inventory.csv'),
  toCsv(pageGroups, [
    'group_id',
    'group_name',
    'page_type',
    'template_source',
    'url_count',
    'example_urls',
    'shared_sections',
    'variable_sections',
    'average_visible_words',
    'median_visible_words',
    'minimum_visible_words',
    'maximum_visible_words',
    'similarity_range',
    'business_role',
    'search_intent',
    'risk',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'content-similarity.csv'),
  toCsv(similarityPairs, [
    'url_a',
    'url_b',
    'group_id',
    'normalized_similarity',
    'shared_word_percent',
    'shared_sentence_percent',
    'unique_sections_a',
    'unique_sections_b',
    'same_intent',
    'same_entity',
    'same_location',
    'possible_duplicate',
    'recommended_review',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'unique-value-evidence.csv'),
  toCsv(uniqueValue, [
    'url',
    'group_id',
    'unique_value_present',
    'unique_value_types',
    'location_specific_value',
    'service_specific_value',
    'product_specific_value',
    'process_specific_value',
    'shipping_or_meetup_value',
    'district_or_area_value',
    'original_faq_value',
    'original_example_value',
    'business_value',
    'user_value',
    'evidence',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'gsc-evidence.csv'),
  'url,source_file,date_range,export_date,query,clicks,impressions,ctr,position,notes\n,,,,,,, ,,,GSC DATA NOT AVAILABLE IN REPOSITORY\n',
);
fs.writeFileSync(
  path.join(DOC, 'external-link-evidence.csv'),
  toCsv(
    [
      {
        url: '(all-candidates)',
        known_external_links: '0-confirmed-inbound-to-candidates',
        known_referring_domains: 'n/a',
        source: 'docs/seo-audit-2026-07-31/external-link-audit.csv (outbound-only)',
        data_date: '2026-07-31',
        external_value: 'EXTERNAL LINK DATA NOT AVAILABLE',
        confidence: 'n/a',
      },
    ],
    [
      'url',
      'known_external_links',
      'known_referring_domains',
      'source',
      'data_date',
      'external_value',
      'confidence',
    ],
  ),
);
fs.writeFileSync(
  path.join(DOC, 'cannibalization-review.csv'),
  toCsv(cannibalization, [
    'url',
    'primary_intent',
    'closest_competing_url',
    'competing_intent',
    'title_overlap',
    'h1_overlap',
    'content_overlap',
    'canonical_relationship',
    'internal_anchor_overlap',
    'gsc_evidence',
    'cannibalization_risk',
    'recommended_primary_url',
    'decision_impact',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'internal-link-impact.csv'),
  toCsv(linkImpact, [
    'candidate_url',
    'inbound_before_batch11',
    'inbound_after_batch11',
    'received_new_links',
    'links_from_sources',
    'outbound_links',
    'links_to_priority_pages',
    'decision',
    'links_to_remove_if_merged',
    'links_to_update_if_redirected',
    'links_to_keep_if_improved',
    'risk',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'decision-matrix.csv'),
  toCsv(decisions, [
    'url',
    'source_file',
    'page_type',
    'group_id',
    'production_status',
    'indexable',
    'canonical',
    'sitemap',
    'visible_words',
    'template_ratio',
    'unique_value',
    'primary_intent',
    'closest_competing_url',
    'cannibalization_risk',
    'gsc_status',
    'external_link_status',
    'inbound_links',
    'batch11_link_impact',
    'business_value',
    'trust_issue',
    'classification',
    'recommended_target',
    'implementation_priority',
    'human_review_required',
    'reason',
    'confidence',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'improvement-requirements.csv'),
  toCsv(improvements, [
    'url',
    'group_id',
    'missing_user_value',
    'required_unique_sections',
    'verified_facts_needed',
    'business_input_needed',
    'safe_existing_sources',
    'prohibited_claims',
    'minimum_acceptance_criteria',
    'recommended_batch',
  ]),
);
fs.writeFileSync(
  path.join(DOC, 'redirect-candidate-map.csv'),
  toCsv(redirects, [
    'source_url',
    'classification',
    'proposed_target_url',
    'source_intent',
    'target_intent',
    'intent_match',
    'source_unique_value',
    'content_to_merge',
    'gsc_risk',
    'external_link_risk',
    'internal_link_count',
    'sitemap_impact',
    'canonical_impact',
    'redirect_chain_risk',
    'human_review_required',
    'recommendation',
  ]),
);

const counts = {};
for (const d of decisions) counts[d.classification] = (counts[d.classification] || 0) + 1;
const summary = {
  audit_thin: auditUrls.size,
  batch11_deferred: deferredSet.size,
  unique_candidates: allCandidates.size,
  active: decisions.length,
  already_resolved: reconciliation.filter((r) => r.include_in_batch12a === 'no').length,
  only_audit: [...auditUrls].filter((u) => !deferredSet.has(u)).length,
  only_batch11: [...deferredSet].filter((u) => !auditUrls.has(u)).length,
  overlap: [...auditUrls].filter((u) => deferredSet.has(u)).length,
  classifications: counts,
  received_b11_inbound: linkImpact.filter((r) => r.received_new_links === 'yes').length,
  merge_redirect_rows: redirects.length,
  improve_rows: improvements.length,
  groups: pageGroups.length,
  similarity_pairs: similarityPairs.length,
};
fs.writeFileSync(path.join(DOC, '_summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
for (const n of notes) console.log('note:', n);
