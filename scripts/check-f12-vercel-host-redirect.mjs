/**
 * F-12 Phase A/B — validate host-aware WWW redirects in vercel.json.
 * Config-only by default; pass --runtime for live HTTP checks after domain switch.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WWW = 'www.amphon.co.th';
const APEX = 'amphon.co.th';
const ORIGIN = `https://${APEX}`;
const runtime = process.argv.includes('--runtime') || process.env.F12_RUNTIME === '1';
const expect308 = process.argv.includes('--expect-308') || process.env.F12_EXPECT_308 === '1';
const expectedStatus = expect308 ? 308 : 307;

const issues = [];
const notes = [];
const warnings = [];

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const redirects = vercel.redirects || [];
notes.push(`redirect_rules_total=${redirects.length}`);

const wwwRules = redirects.filter(
  (r) => Array.isArray(r.has) && r.has.some((h) => h.type === 'host' && h.value === WWW),
);
const pathRules = redirects.filter((r) => !r.has);
const catchAll = wwwRules.filter((r) => r.source === '/(.*)' || r.source === '/:path*');
const exact = wwwRules.filter((r) => r.source !== '/(.*)' && r.source !== '/:path*');

notes.push(`path_rules=${pathRules.length}`);
notes.push(`www_exact=${exact.length}`);
notes.push(`www_catchall=${catchAll.length}`);
notes.push(`expected_status=${expectedStatus}`);

if (pathRules.length < 184) issues.push(`path rules ${pathRules.length} < 184 (existing redirects missing?)`);
if (exact.length === 0) issues.push('exact WWW legacy rules = 0');
if (catchAll.length !== 1) issues.push(`generic WWW catch-all count ${catchAll.length} !== 1`);

// Order: all exact www before any path rule? Spec: exact WWW → existing → catch-all
const firstCatch = redirects.findIndex(
  (r) =>
    Array.isArray(r.has) &&
    r.has.some((h) => h.value === WWW) &&
    (r.source === '/(.*)' || r.source === '/:path*'),
);
const lastExactWww = (() => {
  let idx = -1;
  redirects.forEach((r, i) => {
    if (
      Array.isArray(r.has) &&
      r.has.some((h) => h.value === WWW) &&
      r.source !== '/(.*)' &&
      r.source !== '/:path*'
    ) {
      idx = i;
    }
  });
  return idx;
})();
const firstPath = redirects.findIndex((r) => !r.has);
if (firstCatch === -1) issues.push('catch-all missing');
if (firstCatch !== -1 && lastExactWww !== -1 && firstCatch < lastExactWww) {
  issues.push('catch-all appears before an exact WWW rule');
}
if (firstCatch !== redirects.length - 1) {
  issues.push(`catch-all not last (index ${firstCatch} of ${redirects.length - 1})`);
}
if (firstPath !== -1 && lastExactWww !== -1 && firstPath < lastExactWww) {
  // exact www must come before path rules
  issues.push('path rule appears before last exact WWW rule (order violated)');
}
notes.push(`order_ok_last_catchall=${firstCatch === redirects.length - 1}`);

// Duplicates source+host
const keys = new Set();
for (const r of wwwRules) {
  const k = `www|${r.source}`;
  if (keys.has(k)) issues.push(`duplicate WWW source ${r.source}`);
  keys.add(k);
}

for (const r of exact) {
  if (!String(r.destination).startsWith(ORIGIN)) {
    issues.push(`non-apex WWW dest: ${r.source} → ${r.destination}`);
  }
  if (String(r.destination).includes(WWW)) {
    issues.push(`WWW destination points to www: ${r.source}`);
  }
  if (String(r.destination).startsWith('http://')) {
    issues.push(`HTTP destination: ${r.source}`);
  }
  if (!r.destination.startsWith('http')) {
    issues.push(`relative WWW exact destination: ${r.source} → ${r.destination}`);
  }
  if (r.preserveQueryParams !== true) {
    issues.push(`query preservation disabled: ${r.source}`);
  }
  if (r.statusCode !== expectedStatus) {
    issues.push(`status ${r.statusCode} !== ${expectedStatus} for ${r.source}`);
  }
  if (r.permanent === true) {
    issues.push(`permanent true not allowed in current phase for ${r.source}`);
  }
}
for (const r of catchAll) {
  if (r.preserveQueryParams !== true) issues.push('catch-all missing preserveQueryParams');
  if (r.statusCode !== expectedStatus) issues.push(`catch-all status ${r.statusCode}`);
  if (!String(r.destination).startsWith(ORIGIN)) issues.push('catch-all dest not apex https');
}

// Loop check among www exact: destination path should not equal source under www bounce
for (const r of exact) {
  try {
    const destPath = new URL(r.destination).pathname.replace(/\/$/, '') || '/';
    const src = r.source.replace(/\/$/, '') || '/';
    // final target may equal source only if no-op; still ok if apex. Detect self-host loop risk:
    if (r.destination.includes(WWW)) issues.push(`loop risk www dest ${r.source}`);
  } catch {
    issues.push(`invalid URL dest ${r.source}`);
  }
}

// Astro canonical host unchanged
const astro = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
if (!astro.includes(`site: 'https://amphon.co.th'`) && !astro.includes(`site: "https://amphon.co.th"`)) {
  issues.push('astro site not apex');
}

function curlHeaders(url) {
  try {
    return execFileSync('curl.exe', ['-sS', '-D', '-', '-o', 'NUL', '--max-redirs', '0', url], {
      encoding: 'utf8',
      maxBuffer: 2e6,
    });
  } catch (err) {
    const out = err.stdout || '';
    if (String(out).includes('HTTP/')) return out;
    throw err;
  }
}
function parse(raw) {
  const block = String(raw).split(/\r?\n\r?\n/)[0] || '';
  const status = Number((block.match(/HTTP\/\d(?:\.\d)?\s+(\d+)/) || [])[1] || 0);
  const location = ((block.match(/^location:\s*(.+)$/im) || [])[1] || '').trim();
  return { status, location };
}
function trace(url) {
  const hops = [];
  let current = url;
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    if (seen.has(current)) {
      hops.push({ url: current, status: 0, location: 'LOOP' });
      break;
    }
    seen.add(current);
    const { status, location } = parse(curlHeaders(current));
    hops.push({ url: current, status, location });
    if (!status || status < 300 || status >= 400 || !location) break;
    current = new URL(location, current).href;
  }
  return hops;
}

if (runtime) {
  notes.push('runtime=1');
  const samples = [
    { label: 'https-www-home', url: `https://${WWW}/`, max: 1 },
    { label: 'https-www-contact', url: `https://${WWW}/contact`, max: 1 },
    { label: 'http-www-home', url: `http://${WWW}/`, max: 2 },
    {
      label: 'https-www-legacy-hdd',
      url: `https://${WWW}/${encodeURI('บริการ/รับซื้อ-hdd')}`,
      max: 1,
      expectPath: '/บริการ/รับซื้อ-ssd',
    },
    {
      label: 'http-www-legacy-hdd',
      url: `http://${WWW}/${encodeURI('บริการ/รับซื้อ-hdd')}`,
      max: 2,
      expectPath: '/บริการ/รับซื้อ-ssd',
    },
    {
      label: 'https-www-collectibles',
      url: `https://${WWW}/${encodeURI('รับซื้อ/รับซื้อของสะสม-ร้อยเอ็ด')}`,
      max: 1,
      expectPath: '/บริการ/รับซื้อของสะสม',
    },
  ];
  for (const s of samples) {
    const hops = trace(s.url);
    const redirectsCount = Math.max(0, hops.length - 1);
    const final = hops.at(-1);
    notes.push(`${s.label}: hops=${redirectsCount} final=${final.status} ${final.url}`);
    if (redirectsCount > s.max) issues.push(`${s.label} hops ${redirectsCount} > ${s.max}`);
    if (!final.url.startsWith(ORIGIN)) issues.push(`${s.label} final not apex`);
    if (final.status === 200 && new URL(final.url).hostname === WWW) {
      issues.push(`${s.label} WWW returned 200`);
    }
    if (s.expectPath) {
      const p = decodeURIComponent(new URL(final.url).pathname.replace(/\/$/, '') || '/');
      if (p !== s.expectPath) issues.push(`${s.label} wrong target ${p} !== ${s.expectPath}`);
    }
    // first hop from https www should be expectedStatus after domain switch
    if (s.label.startsWith('https-www') && hops[0].status && hops[0].status !== expectedStatus) {
      warnings.push(`${s.label} first status ${hops[0].status} (expected ${expectedStatus} after cutover)`);
    }
  }
  const q = trace(`https://${WWW}/contact?source=f12&utm_campaign=host`);
  const qFinal = new URL(q.at(-1).url);
  if (qFinal.searchParams.get('source') !== 'f12' || qFinal.searchParams.get('utm_campaign') !== 'host') {
    issues.push(`query not preserved: ${q.at(-1).url}`);
  } else notes.push('query_preserved=yes');
} else {
  notes.push('runtime=PENDING (domain switch required for live WWW host-rule proof)');
}

console.log('F-12 vercel host redirect QA');
for (const n of notes) console.log(`  note: ${n}`);
for (const w of warnings) console.warn(`  warning: ${w}`);
if (issues.length) {
  console.error('FAIL');
  for (const i of issues.slice(0, 40)) console.error(`  - ${i}`);
  process.exit(1);
}
console.log(runtime ? (warnings.length ? 'PASS WITH WARNING' : 'PASS') : 'PASS (config Phase A)');
