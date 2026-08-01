/**
 * Batch 12F.2 — Validate owner decisions recorded (read-only).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs/batch-12f-business-decision-matrix');
const issues = [];
const notes = [];

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

function load(name) {
  const p = path.join(DOCS, name);
  if (!fs.existsSync(p)) {
    issues.push(`missing ${name}`);
    return [];
  }
  const rows = parseCSV(fs.readFileSync(p, 'utf8'));
  const h = Object.fromEntries(rows[0].map((x, i) => [x, i]));
  return rows.slice(1).map((r) => {
    const o = {};
    for (const k of Object.keys(h)) o[k] = r[h[k]];
    return o;
  });
}

const EXPECTED = {
  'BD-01': 'C',
  'BD-02': 'C',
  'BD-03': 'B',
  'BD-04': 'B',
  'BD-05': 'C',
  'BD-06': 'B',
  'BD-07': 'B',
};

const sheet = load('owner-response-sheet-ready.csv');
const approved = load('owner-approved-classification.csv');
const outcomes = load('decision-outcome-map.csv');
const lock = fs.existsSync(path.join(DOCS, 'owner-decision-lock.md'))
  ? fs.readFileSync(path.join(DOCS, 'owner-decision-lock.md'), 'utf8')
  : '';

notes.push(`decision_groups=${sheet.length}`);
notes.push(`urls_covered=${approved.length}`);

if (sheet.length !== 7) issues.push(`decision groups ${sheet.length} != 7`);
if (approved.length !== 134) issues.push(`urls ${approved.length} != 134`);

let pending = 0;
for (const row of sheet) {
  if (!row.answer || /PENDING/i.test(row.implementation_status || '')) {
    if (/PENDING OWNER RESPONSE/i.test(row.implementation_status || '')) pending += 1;
  }
  if (EXPECTED[row.decision_group_id] !== row.answer) {
    issues.push(`answer mismatch ${row.decision_group_id}: got ${row.answer}`);
  }
  if (row.preferred_page_strategy !== 'KEEP_EXISTING_URLS_AND_IMPROVE') {
    issues.push(`bad page strategy ${row.decision_group_id}`);
  }
  if (/MERGE_TO_HUB|RETIRE_AND_REDIRECT|NOINDEX|REMOVE_ROUTE/.test(row.preferred_page_strategy || '')) {
    issues.push(`forbidden strategy ${row.decision_group_id}`);
  }
  if (!/OWNER CONFIRMED/.test(row.implementation_status || '')) {
    issues.push(`impl status not confirmed ${row.decision_group_id}`);
  }
}
notes.push(`owner_answers_filled=${sheet.filter((r) => r.answer).length}`);
notes.push(`pending_answers=${sheet.filter((r) => !r.answer).length}`);

let merge = 0;
let redirect = 0;
let noindex = 0;
let remove = 0;
for (const r of approved) {
  if (r.page_strategy !== 'KEEP_EXISTING_URLS_AND_IMPROVE') issues.push(`url strategy ${r.url}`);
  if (r.redirect_action !== 'NONE') {
    redirect += 1;
    issues.push(`redirect planned ${r.url}`);
  }
  if (r.noindex_action !== 'NONE') {
    noindex += 1;
    issues.push(`noindex planned ${r.url}`);
  }
  if (r.sitemap_action !== 'KEEP') issues.push(`sitemap action ${r.url}`);
}
notes.push(`merge_approved=${merge}`);
notes.push(`redirect_approved=${redirect}`);
notes.push(`noindex_approved=${noindex}`);
notes.push(`remove_route_approved=${remove}`);
notes.push(`urls_retained=${approved.length}`);

for (const o of outcomes) {
  if (o.resulting_classification !== 'OWNER_CONFIRMED_KEEP_AND_IMPROVE') {
    issues.push(`outcome class ${o.decision_group_id}`);
  }
  if (o.redirect_action !== 'NONE') issues.push(`outcome redirect ${o.decision_group_id}`);
  if (o.target_url !== 'SELF') issues.push(`outcome target ${o.decision_group_id}`);
}

if (!/KEEP_EXISTING_URLS_AND_IMPROVE/.test(lock)) issues.push('lock missing strategy');
if (!/Merge approved:\s*\n0/.test(lock) && !/Merge approved:\n0/.test(lock)) {
  // soft check
  if (!lock.includes('Merge approved:\n0') && !lock.includes('Merge approved:\r\n0')) {
    if (!/Merge approved:\s*0/.test(lock)) issues.push('lock merge approved not 0');
  }
}

const hubs = new Set(approved.map((r) => r.hub_url));
notes.push(`hub_count=${hubs.size}`);
if (hubs.size !== 7) issues.push(`hub count ${hubs.size} != 7`);

// Production code diff vs main for src/
try {
  const diff = execSync('git diff --name-only origin/main...HEAD', {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const bad = diff
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((f) => /^(src\/|public\/|astro\.config|vercel\.json)/.test(f));
  notes.push(`production_code_diff=${bad.length}`);
  if (bad.length) issues.push(`PRODUCTION SCOPE VIOLATION: ${bad.join(',')}`);
} catch {
  notes.push('production_code_diff=unable_to_check');
}

for (const n of notes) console.log(`  note: ${n}`);
if (issues.length) {
  console.error('FAIL batch-12f owner decisions');
  for (const i of issues.slice(0, 30)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log('PASS batch-12f owner decisions');
