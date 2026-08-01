/**
 * Batch 4 regression: F-05 unqualified payment claims on confirmed target pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectBuiltPages,
  distDir,
  extractCanonical,
  normalizePathname,
  readText,
} from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://amphon.co.th';

const TARGETS = [
  {
    pathname: '/บริการ/รับซื้อ-notebook-acer',
    source: 'src/content/services/รับซื้อ-notebook-acer.md',
    expectedH1Includes: 'Notebook Acer',
  },
  {
    pathname: '/บริการ/รับซื้อ-notebook-asus',
    source: 'src/content/services/รับซื้อ-notebook-asus.md',
    expectedH1Includes: 'Notebook Asus',
  },
  {
    pathname: '/บริการ/รับซื้อ-notebook-dell',
    source: 'src/content/services/รับซื้อ-notebook-dell.md',
    expectedH1Includes: 'Notebook Dell',
  },
  {
    pathname: '/บริการ/รับซื้อ-notebook-hp',
    source: 'src/content/services/รับซื้อ-notebook-hp.md',
    expectedH1Includes: 'Notebook HP',
  },
  {
    pathname: '/บริการ/รับซื้อ-notebook-lenovo',
    source: 'src/content/services/รับซื้อ-notebook-lenovo.md',
    expectedH1Includes: 'Notebook Lenovo',
  },
  {
    pathname: '/blog/รับซื้อสินค้าไอทีถึงที่-ปลอดภัยไหม',
    source: 'src/content/blog/รับซื้อสินค้าไอทีถึงที่-ปลอดภัยไหม.md',
    expectedH1Includes: 'รับซื้อสินค้าไอทีถึงที่',
  },
  {
    pathname: '/blog/ราคา-ipad-มือสอง-2026',
    source: 'src/content/blog/ราคา-ipad-มือสอง-2026.md',
    expectedH1Includes: 'iPad',
  },
  {
    pathname: '/blog/ราคา-macbook-มือสอง-2026',
    source: 'src/content/blog/ราคา-macbook-มือสอง-2026.md',
    expectedH1Includes: 'MacBook',
  },
];

const BANNED_UNQUALIFIED = [
  /ประเมินฟรี\s*จ่ายทันที/u,
  /ประเมินเร็ว\s*จ่ายเงินทันที/u,
  /ตรวจเครื่องหน้างาน\s*จ่ายเงินทันที/u,
  /ขายแล้วได้เงินทันที/u,
  /ได้เงินทันทีทุกเครื่อง/u,
  /จ่ายทันทีถึงบ้าน/u,
  /ประเมินปุ๊บได้เงินปั๊บ/u,
];

const PAY_IMMEDIATE = /จ่าย(เงิน)?(สด)?ทันที/gu;
const QUALIFIER =
  /(หลังตรวจ|เมื่อตรวจ|หลังตกลง|เมื่อตกลง|หลังยืนยัน|เมื่อการซื้อขาย|ตกลงราคา(สุดท้าย)?แล้ว|ตรวจสินค้าและตกลง)/u;

const issues = [];
const notes = [];

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function metaContent(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`, 'i');
  return (html.match(re2) || [])[1] ?? '';
}

function titleText(html) {
  return ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
}

function h1Texts(html) {
  return [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  );
}

function ogDescription(html) {
  const m =
    html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["'][^>]*>/i);
  return m?.[1] ?? '';
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1],
  );
}

function hasUnqualifiedPayClaim(text) {
  if (!text) return false;
  for (const banned of BANNED_UNQUALIFIED) {
    if (banned.test(text)) return true;
  }
  PAY_IMMEDIATE.lastIndex = 0;
  let match;
  while ((match = PAY_IMMEDIATE.exec(text)) !== null) {
    const start = Math.max(0, match.index - 40);
    const end = Math.min(text.length, match.index + match[0].length + 40);
    const window = text.slice(start, end);
    if (!QUALIFIER.test(window)) return true;
  }
  return false;
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);

for (const target of TARGETS) {
  if (!fs.existsSync(path.join(ROOT, target.source))) {
    issues.push(`missing source: ${target.source}`);
  }
  if (!built.has(target.pathname)) {
    issues.push(`missing built page: ${target.pathname}`);
    continue;
  }

  const htmlPath = built.get(target.pathname);
  const html = readText(htmlPath);
  const h1s = h1Texts(html);
  const title = titleText(html);
  const description = metaContent(html, 'description');
  const robots = metaContent(html, 'robots');
  const canonical = normalizePathname(extractCanonical(html));
  const visible = stripTags(html);
  const ogDesc = ogDescription(html);
  const ldBlocks = jsonLdBlocks(html);

  if (h1s.length !== 1) issues.push(`${target.pathname}: expected 1 H1, found ${h1s.length}`);
  const h1 = h1s[0] || '';
  if (!h1.includes(target.expectedH1Includes)) {
    issues.push(`${target.pathname}: H1 missing primary keyword fragment "${target.expectedH1Includes}"`);
  }
  if (hasUnqualifiedPayClaim(h1)) issues.push(`${target.pathname}: unqualified claim in H1: ${h1}`);
  if (hasUnqualifiedPayClaim(title)) issues.push(`${target.pathname}: unqualified claim in title`);
  if (hasUnqualifiedPayClaim(description)) issues.push(`${target.pathname}: unqualified claim in description`);
  if (hasUnqualifiedPayClaim(ogDesc)) issues.push(`${target.pathname}: unqualified claim in og:description`);
  if (hasUnqualifiedPayClaim(visible)) issues.push(`${target.pathname}: unqualified claim in visible HTML`);

  for (const block of ldBlocks) {
    try {
      JSON.parse(block);
    } catch (err) {
      issues.push(`${target.pathname}: invalid JSON-LD (${err.message})`);
      continue;
    }
    if (hasUnqualifiedPayClaim(block)) {
      issues.push(`${target.pathname}: unqualified claim in JSON-LD`);
    }
  }

  if (canonical !== target.pathname) {
    issues.push(`${target.pathname}: canonical changed to ${canonical}`);
  }
  if (/noindex/i.test(robots)) {
    issues.push(`${target.pathname}: unexpectedly noindex (${robots})`);
  }

  // Source-level banned phrases for notebook H1 frontmatter
  const sourceText = readText(path.join(ROOT, target.source));
  if (/ประเมินฟรี\s*จ่ายทันที/u.test(sourceText)) {
    issues.push(`${target.source}: still contains "ประเมินฟรี จ่ายทันที"`);
  }
  if (/ประเมินเร็ว\s*จ่ายเงินทันที/u.test(sourceText)) {
    issues.push(`${target.source}: still contains "ประเมินเร็ว จ่ายเงินทันที"`);
  }
  if (/ตรวจเครื่องหน้างาน\s*จ่ายเงินทันที/u.test(sourceText)) {
    issues.push(`${target.source}: still contains "ตรวจเครื่องหน้างาน จ่ายเงินทันที"`);
  }
}

// Global smoke: route/sitemap counts when dist present
const htmlCount = fs.existsSync(distDir)
  ? [...fs.readdirSync(distDir, { recursive: true })].filter((f) => String(f).endsWith('.html')).length
  : 0;
notes.push(`dist_html_approx=${htmlCount}`);

const sitemap0 = path.join(distDir, 'sitemap-0.xml');
if (fs.existsSync(sitemap0)) {
  const locs = [...readText(sitemap0).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  notes.push(`sitemap_count=${locs.length}`);
  if (locs.length !== 1166) issues.push(`sitemap count ${locs.length} !== 1166`);
  for (const target of TARGETS) {
    const abs = `${SITE}${encodeURI(target.pathname).replace(/%2F/gi, '/')}`;
    // Astro sitemap percent-encodes Thai path segments
    const found = locs.some((loc) => {
      try {
        return decodeURIComponent(loc) === `${SITE}${target.pathname}`;
      } catch {
        return loc === abs;
      }
    });
    if (!found) issues.push(`target missing from sitemap: ${target.pathname}`);
  }
} else {
  notes.push('sitemap_absent_skip_count_check');
}

console.log('Batch 4 qualified payment claims validation');
for (const note of notes) console.log(`  note: ${note}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log('PASS');
