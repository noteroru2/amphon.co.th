/**
 * Batch 6 regression: LocalBusiness store geo coordinates (F-11).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectBuiltPages, distDir, readText } from './lib/site-audit.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const EXPECTED_LAT = 15.2664215;
const EXPECTED_LNG = 104.844358;
const OLD_LAT = 15.2386;
const OLD_LNG = 104.8477;
const EXPECTED_NAME = 'อำพล เทรดดิ้ง';
const EXPECTED_STREET = '740/8 ถนนชยางกูร';
const EXPECTED_PHONE = '+66642579353';
const EXPECTED_URL = 'https://amphon.co.th';
const EXPECTED_HAS_MAP = 'https://maps.app.goo.gl/krv97o14jPTRrnpW8';

const SAMPLE_PATHS = [
  '/',
  '/contact',
  '/about',
  '/บริการ/รับซื้อโน๊ตบุ๊ค',
  '/พื้นที่ให้บริการ/อุบลราชธานี',
  '/พื้นที่ให้บริการ/ขอนแก่น',
  '/พื้นที่ให้บริการ/นครราชสีมา',
  '/พื้นที่ให้บริการ/อุดรธานี',
  '/พื้นที่ให้บริการ/บุรีรัมย์',
  '/พื้นที่ให้บริการ/สุรินทร์',
];

const issues = [];
const notes = [];

function almostEqual(a, b, eps = 1e-7) {
  return Math.abs(Number(a) - Number(b)) <= eps;
}

function parseJsonLdBlocks(html) {
  const blocks = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch (err) {
      issues.push(`json-ld parse error: ${err.message}`);
    }
  }
  return blocks;
}

function flattenNodes(node, acc = []) {
  if (!node || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    for (const item of node) flattenNodes(item, acc);
    return acc;
  }
  acc.push(node);
  if (Array.isArray(node['@graph'])) {
    for (const item of node['@graph']) flattenNodes(item, acc);
  }
  return acc;
}

function typeList(node) {
  const t = node['@type'];
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
}

function hasType(node, name) {
  return typeList(node).includes(name);
}

// Source of truth
const siteTs = readText(path.join(ROOT, 'src/config/site.ts'));
const latMatch = siteTs.match(/geo:\s*\{[\s\S]*?latitude:\s*([0-9.]+)/);
const lngMatch = siteTs.match(/geo:\s*\{[\s\S]*?longitude:\s*([0-9.]+)/);
if (!latMatch || !lngMatch) {
  issues.push('site.ts geo latitude/longitude not found');
} else {
  const srcLat = Number(latMatch[1]);
  const srcLng = Number(lngMatch[1]);
  notes.push(`source_lat=${srcLat}`);
  notes.push(`source_lng=${srcLng}`);
  if (!almostEqual(srcLat, EXPECTED_LAT)) issues.push(`site.ts latitude ${srcLat} !== ${EXPECTED_LAT}`);
  if (!almostEqual(srcLng, EXPECTED_LNG)) issues.push(`site.ts longitude ${srcLng} !== ${EXPECTED_LNG}`);
  if (almostEqual(srcLat, OLD_LAT) && almostEqual(srcLng, OLD_LNG)) {
    issues.push('site.ts still has old incorrect coordinates');
  }
}

if (siteTs.includes(`latitude: ${OLD_LAT}`) || siteTs.includes(`longitude: ${OLD_LNG}`)) {
  // Only flag if both appear in geo block vicinity; provinceGeo may differ
  const geoBlock = siteTs.match(/geo:\s*\{[\s\S]*?\},/);
  if (geoBlock && (geoBlock[0].includes(String(OLD_LAT)) || geoBlock[0].includes(String(OLD_LNG)))) {
    issues.push('old store coordinates remain in site.geo');
  }
}

const built = collectBuiltPages();
notes.push(`built_pages=${built.size}`);
if (built.size === 0) {
  issues.push('no built HTML found — run npm run build first');
}

let localBusinessPages = 0;
let fakeProvinceLocalBusiness = 0;
let aggregateRating = 0;
let reviewSchema = 0;
let storeGeoMismatch = 0;
let oldStoreGeoHits = 0;
let napMismatch = 0;

for (const pathname of SAMPLE_PATHS) {
  if (!built.has(pathname)) {
    issues.push(`missing sample page: ${pathname}`);
    continue;
  }
  const html = readText(built.get(pathname));
  const nodes = flattenNodes(parseJsonLdBlocks(html));

  const lbs = nodes.filter((n) => hasType(n, 'LocalBusiness'));
  const orgs = nodes.filter((n) => hasType(n, 'Organization') && !hasType(n, 'LocalBusiness'));
  localBusinessPages += lbs.length > 0 ? 1 : 0;

  for (const node of nodes) {
    if (node.aggregateRating || hasType(node, 'AggregateRating')) aggregateRating += 1;
    if (hasType(node, 'Review')) reviewSchema += 1;
  }

  for (const lb of lbs) {
    const geo = lb.geo;
    if (!geo || geo.latitude == null || geo.longitude == null) {
      issues.push(`LocalBusiness missing geo: ${pathname}`);
      continue;
    }
    if (!almostEqual(geo.latitude, EXPECTED_LAT) || !almostEqual(geo.longitude, EXPECTED_LNG)) {
      storeGeoMismatch += 1;
      issues.push(
        `LocalBusiness geo mismatch on ${pathname}: ${geo.latitude},${geo.longitude}`,
      );
    }
    if (almostEqual(geo.latitude, OLD_LAT) && almostEqual(geo.longitude, OLD_LNG)) {
      oldStoreGeoHits += 1;
    }
    if (lb.name && lb.name !== EXPECTED_NAME) {
      napMismatch += 1;
      issues.push(`LocalBusiness name changed on ${pathname}: ${lb.name}`);
    }
    const street = lb.address?.streetAddress;
    if (street && street !== EXPECTED_STREET) {
      napMismatch += 1;
      issues.push(`LocalBusiness street changed on ${pathname}: ${street}`);
    }
    if (lb.telephone && lb.telephone !== EXPECTED_PHONE) {
      napMismatch += 1;
      issues.push(`LocalBusiness telephone changed on ${pathname}: ${lb.telephone}`);
    }
    if (lb.url && lb.url !== EXPECTED_URL && lb.url !== `${EXPECTED_URL}/`) {
      napMismatch += 1;
      issues.push(`LocalBusiness url changed on ${pathname}: ${lb.url}`);
    }
    if (lb.hasMap && lb.hasMap !== EXPECTED_HAS_MAP) {
      issues.push(`LocalBusiness hasMap changed on ${pathname}: ${lb.hasMap}`);
    }

    // Fake province LocalBusiness: address region is not Ubon but claims separate store
    const region = lb.address?.addressRegion;
    if (region && region !== 'อุบลราชธานี' && pathname.includes('/รับซื้อ') && !pathname.endsWith('/อุบลราชธานี')) {
      // Sitewide LB still uses Ubon address — that is correct. Flag only if region is the page province.
      const provinceGuess = pathname.split('/').pop();
      if (region === provinceGuess) {
        fakeProvinceLocalBusiness += 1;
        issues.push(`fake province LocalBusiness on ${pathname}: region=${region}`);
      }
    }
  }

  // Meta tags on homepage / all pages via BaseLayout
  if (html.includes(`geo.position" content="${OLD_LAT};${OLD_LNG}"`)) {
    issues.push(`old geo.position meta on ${pathname}`);
  }
  if (
    !html.includes(`geo.position" content="${EXPECTED_LAT};${EXPECTED_LNG}"`) &&
    lbs.length > 0
  ) {
    // BaseLayout always emits geo.position
    if (!html.includes(`content="${EXPECTED_LAT};${EXPECTED_LNG}"`)) {
      issues.push(`expected geo.position missing on ${pathname}`);
    }
  }

  notes.push(
    `sample ${pathname}: lb=${lbs.length} org=${orgs.length} geo=${lbs[0]?.geo?.latitude ?? 'n/a'},${lbs[0]?.geo?.longitude ?? 'n/a'}`,
  );
}

// Sitewide scan: no old store coords in LocalBusiness geo
for (const [pathname, filePath] of built) {
  const html = readText(filePath);
  if (!html.includes('application/ld+json')) continue;
  const nodes = flattenNodes(parseJsonLdBlocks(html));
  for (const lb of nodes.filter((n) => hasType(n, 'LocalBusiness'))) {
    const geo = lb.geo;
    if (!geo) continue;
    if (almostEqual(geo.latitude, OLD_LAT) && almostEqual(geo.longitude, OLD_LNG)) {
      oldStoreGeoHits += 1;
      issues.push(`old LocalBusiness geo sitewide: ${pathname}`);
    }
    if (
      geo.latitude != null &&
      (!almostEqual(geo.latitude, EXPECTED_LAT) || !almostEqual(geo.longitude, EXPECTED_LNG))
    ) {
      // Only one store — any LocalBusiness must use verified pin
      storeGeoMismatch += 1;
      issues.push(`non-verified LocalBusiness geo sitewide: ${pathname} ${geo.latitude},${geo.longitude}`);
    }
  }
  for (const node of nodes) {
    if (node.aggregateRating || hasType(node, 'AggregateRating')) {
      aggregateRating += 1;
      issues.push(`AggregateRating present: ${pathname}`);
    }
  }
}

const sitemap0 = path.join(distDir, 'sitemap-0.xml');
if (fs.existsSync(sitemap0)) {
  const count = [...readText(sitemap0).matchAll(/<loc>/g)].length;
  notes.push(`sitemap_count=${count}`);
  if (count !== 1175) issues.push(`sitemap count ${count} !== 1175`);
} else {
  notes.push('sitemap_absent');
}

notes.push(`local_business_sample_pages=${localBusinessPages}`);
notes.push(`fake_province_local_business=${fakeProvinceLocalBusiness}`);
notes.push(`aggregate_rating=${aggregateRating}`);
notes.push(`review_schema=${reviewSchema}`);
notes.push(`store_geo_mismatch=${storeGeoMismatch}`);
notes.push(`old_store_geo_hits=${oldStoreGeoHits}`);
notes.push(`nap_mismatch=${napMismatch}`);

console.log('Batch 6 schema geo validation');
for (const note of notes) console.log(`  note: ${note}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues.slice(0, 80)) console.error(`  - ${issue}`);
  if (issues.length > 80) console.error(`  ... ${issues.length - 80} more`);
  process.exit(1);
}
console.log('PASS');
