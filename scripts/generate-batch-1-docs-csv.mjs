/**
 * Emit Batch 1 CSV maps from vercel.json + production baseline probes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadRedirects } from './lib/site-audit.mjs';

const outDir = path.join(process.cwd(), 'docs/batch-1-thai-legacy-redirects');
fs.mkdirSync(outDir, { recursive: true });

const encodePath = (pathname) =>
  pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : ''))
    .join('/');

const provinces = fs
  .readdirSync('src/content/serviceAreas')
  .filter((file) => file.startsWith('รับซื้อ-ssd-') && file.endsWith('.md'))
  .map((file) => file.replace(/^รับซื้อ-ssd-/, '').replace(/\.md$/, ''))
  .sort((a, b) => a.localeCompare(b, 'th'));

const pairs = [];

function addPair(unicode, destination, notes) {
  pairs.push({
    legacy_unicode_url: unicode,
    legacy_encoded_url: encodePath(unicode),
    expected_destination: destination,
    notes,
  });
}

addPair('/รับซื้อ', '/รับซื้อสินค้าไอที', 'hub rename');
addPair('/บริการ/รับซื้อสินค้าไอที', '/รับซื้อสินค้าไอที', 'old service-hub path');
addPair('/รับซื้อ/รับซื้อ-hdd', '/บริการ/รับซื้อ-ssd', 'legacy storage slug');
addPair('/รับซื้อ/รับซื้อ-gopro', '/บริการ/รับซื้อ-gopro-action-camera', 'legacy gopro slug under /รับซื้อ');
addPair('/รับซื้อ/รับซื้อเลนส์', '/บริการ/รับซื้อเลนส์กล้อง', 'legacy lens slug under /รับซื้อ');
addPair('/รับซื้อ/รับซื้อ-storage-nas', '/บริการ/รับซื้อ-nas', 'legacy nas slug under /รับซื้อ');

for (const province of provinces) {
  addPair(`/รับซื้อ/รับซื้อ-hdd-${province}`, `/รับซื้อ/รับซื้อ-ssd-${province}`, 'legacy hdd×province → ssd×province');
  addPair(`/รับซื้อ/รับซื้อ-gopro-${province}`, '/บริการ/รับซื้อ-gopro-action-camera', 'legacy gopro×province → service hub');
  addPair(`/รับซื้อ/รับซื้อเลนส์-${province}`, '/บริการ/รับซื้อเลนส์กล้อง', 'legacy lens×province → service hub');
  addPair(`/รับซื้อ/รับซื้อ-storage-nas-${province}`, '/บริการ/รับซื้อ-nas', 'legacy nas×province → service hub');
}

const redirects = loadRedirects();
const sourceSet = new Set(redirects.map((rule) => rule.source));

const csvEsc = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const mapRows = [];
for (const pair of pairs) {
  const hasUnicode = sourceSet.has(pair.legacy_unicode_url);
  const hasEncoded = sourceSet.has(pair.legacy_encoded_url);
  mapRows.push([
    pair.legacy_unicode_url,
    pair.legacy_encoded_url,
    pair.expected_destination,
    '404 (production baseline before deploy)',
    '',
    '301',
    `${pair.notes}; unicode_rule=${hasUnicode}; encoded_rule=${hasEncoded}`,
  ]);
}

fs.writeFileSync(
  path.join(outDir, 'redirect-map.csv'),
  `\uFEFFlegacy_unicode_url,legacy_encoded_url,expected_destination,current_status,current_location,expected_status,notes\n${mapRows
    .map((row) => row.map(csvEsc).join(','))
    .join('\n')}\n`,
);

const postDeploy = [];
for (const pair of pairs) {
  postDeploy.push([
    pair.legacy_unicode_url,
    '301',
    pair.expected_destination,
    '200',
    'no',
    '404',
    'PENDING DEPLOYMENT',
    'PENDING',
  ]);
  postDeploy.push([
    pair.legacy_encoded_url,
    '301',
    pair.expected_destination,
    '200',
    'no',
    '404',
    'PENDING DEPLOYMENT',
    'PENDING',
  ]);
}

// Query preservation checks
postDeploy.push([
  '/รับซื้อ?source=test',
  '301',
  '/รับซื้อสินค้าไอที?source=test',
  '200',
  'yes',
  '404',
  'PENDING DEPLOYMENT',
  'PENDING',
]);
postDeploy.push([
  `${encodePath('/รับซื้อ')}?source=test`,
  '301',
  '/รับซื้อสินค้าไอที?source=test',
  '200',
  'yes',
  '404',
  'PENDING DEPLOYMENT',
  'PENDING',
]);

// Negatives
postDeploy.push([
  '/random-url-that-does-not-exist',
  '404',
  '',
  '404',
  'no',
  '404',
  'PENDING DEPLOYMENT',
  'PENDING',
]);

fs.writeFileSync(
  path.join(outDir, 'post-deploy-validation.csv'),
  `\uFEFFurl,expected_status,expected_location,expected_final_status,query_test,production_status_before,production_status_after,result\n${postDeploy
    .map((row) => row.map(csvEsc).join(','))
    .join('\n')}\n`,
);

console.log({
  redirectMapRows: mapRows.length,
  postDeployRows: postDeploy.length,
  unicodeRulesPresent: mapRows.every((row) => row[6].includes('unicode_rule=true')),
  encodedRulesPresent: mapRows.every((row) => row[6].includes('encoded_rule=true')),
});
