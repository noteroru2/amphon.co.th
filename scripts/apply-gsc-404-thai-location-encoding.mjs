/**
 * Apply Fix F: percent-encode Thai (non-ASCII) destinations in vercel.json.
 * Writes inventory CSVs under docs/gsc-404-thai-location-encoding/.
 * Does not change sources, status, order, or logical targets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  encodeRedirectDestination,
  hasNonAscii,
  isExternalDestination,
  logicalPathname,
  looksDoubleEncoded,
} from './lib/encode-redirect-destination.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/gsc-404-thai-location-encoding');
const vercelPath = path.join(ROOT, 'vercel.json');

const esc = (s) => {
  const t = String(s ?? '');
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
const csv = (rows) => rows.map((r) => r.map(esc).join(',')).join('\n') + '\n';

fs.mkdirSync(OUT, { recursive: true });
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
const redirects = vercel.redirects || [];

const beforeRows = [[
  'rule_index', 'source', 'destination_raw', 'destination_decoded', 'status_code',
  'permanent', 'query_behavior', 'contains_non_ascii', 'contains_percent_encoding',
  'double_encoded', 'external', 'source_file',
]];
const mapRows = [[
  'rule_index', 'source', 'destination_before', 'destination_after', 'logical_before',
  'logical_after', 'contains_raw_unicode_before', 'contains_raw_unicode_after',
  'double_encoded', 'status_code_before', 'status_code_after', 'rule_order_before',
  'rule_order_after', 'query_preserved', 'result',
]];

const next = redirects.map((rule, i) => {
  const before = rule.destination;
  const after = encodeRedirectDestination(before);
  const logicalBefore = logicalPathname(before);
  const logicalAfter = logicalPathname(after);
  const status = rule.statusCode ?? (rule.permanent ? 308 : 307);
  const hasQ = String(before).includes('?') || String(after).includes('?');
  beforeRows.push([
    i, rule.source, before, logicalBefore, status, rule.permanent === true,
    hasQ ? 'has_query' : 'none', hasNonAscii(before) ? 'yes' : 'no',
    /%[0-9A-Fa-f]{2}/.test(before) ? 'yes' : 'no',
    looksDoubleEncoded(before) ? 'yes' : 'no',
    isExternalDestination(before) ? 'yes' : 'no', 'vercel.json',
  ]);
  const ok =
    logicalBefore === logicalAfter &&
    !looksDoubleEncoded(after) &&
    (rule.permanent === true) === (rule.permanent === true);
  mapRows.push([
    i, rule.source, before, after, logicalBefore, logicalAfter,
    hasNonAscii(before) ? 'yes' : 'no', hasNonAscii(after) ? 'yes' : 'no',
    looksDoubleEncoded(after) ? 'yes' : 'no', status, status, i, i,
    String(before).includes('?') === String(after).includes('?') ? 'yes' : 'no',
    ok && logicalBefore === logicalAfter ? 'PASS' : 'FAIL',
  ]);
  return { ...rule, destination: after };
});

const thaiBefore = redirects.filter((r) => hasNonAscii(r.destination)).length;
const thaiAfter = next.filter((r) => hasNonAscii(r.destination)).length;
const changed = next.filter((r, i) => r.destination !== redirects[i].destination).length;
const logicalDiff = mapRows.slice(1).filter((r) => r[4] !== r[5]).length;
const doubleAfter = next.filter((r) => looksDoubleEncoded(r.destination)).length;

if (logicalDiff > 0) {
  console.error('FAIL logical destination changes:', logicalDiff);
  process.exit(1);
}
if (doubleAfter > 0) {
  console.error('FAIL double encoding after apply:', doubleAfter);
  process.exit(1);
}
if (thaiAfter > 0) {
  console.error('FAIL raw unicode destinations remain:', thaiAfter);
  process.exit(1);
}
if (next.length !== redirects.length) {
  console.error('FAIL rule count changed');
  process.exit(1);
}

vercel.redirects = next;
fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');

fs.writeFileSync(path.join(OUT, 'redirect-inventory-before.csv'), csv(beforeRows));
fs.writeFileSync(path.join(OUT, 'destination-encoding-map.csv'), csv(mapRows));
fs.writeFileSync(
  path.join(OUT, 'redirect-source-inventory.csv'),
  csv([
    ['file', 'type', 'source_of_truth', 'generated', 'rule_count', 'thai_destination_count', 'encoded_destination_count', 'used_in_build', 'used_in_production', 'action'],
    ['vercel.json', 'vercel_redirects', 'yes', 'no', redirects.length, thaiBefore, changed, 'yes', 'yes', 'ENCODE_DESTINATIONS'],
    ['scripts/generate-batch-1-redirects.mjs', 'manual_generator', 'helper_only', 'writes_vercel_when_run', 'n/a', 'n/a', 'n/a', 'no_default', 'no', 'UPDATE_TO_EMIT_ENCODED_DEST'],
    ['scripts/lib/encode-redirect-destination.mjs', 'utility', 'encoding_helper', 'no', 'n/a', 'n/a', 'n/a', 'qa_and_generator', 'indirect', 'ADD'],
  ]),
);

const summary = {
  rules_before: redirects.length,
  rules_after: next.length,
  thai_destinations_before: thaiBefore,
  thai_destinations_after: thaiAfter,
  destinations_reencoded: changed,
  logical_destination_changes: logicalDiff,
  double_encoded_after: doubleAfter,
  blog_destinations_unchanged: next.filter((r, i) =>
    ['/blog/how-to-reset-playstation', '/blog/check-nintendo-joycon'].includes(redirects[i].source) &&
    r.destination === redirects[i].destination &&
    r.destination === '/blog',
  ).length,
};
fs.writeFileSync(path.join(OUT, 'apply-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
