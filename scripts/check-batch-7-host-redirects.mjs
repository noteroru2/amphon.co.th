/**
 * Batch 7 — host/protocol redirect normalization (F-12).
 *
 * Default: config/static assertions.
 * Runtime: BATCH7_RUNTIME=1 or --runtime
 *
 * Production reality (2026-08-01): Vercel platform HTTP→HTTPS (keeps www)
 * then Domain 301 www→apex. vercel.json host rules do not run before those
 * hops, so repo-only collapse of http://www is BLOCKED without Dashboard change.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANONICAL_HOST = 'amphon.co.th';
const WWW_HOST = 'www.amphon.co.th';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const runtime = process.argv.includes('--runtime') || process.env.BATCH7_RUNTIME === '1';
const allowBlocked =
  process.argv.includes('--allow-blocked') || process.env.BATCH7_ALLOW_BLOCKED === '1';

const issues = [];
const notes = [];
const warnings = [];

const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const redirects = vercel.redirects || [];
notes.push(`redirect_rules=${redirects.length}`);

const hostRules = redirects.filter(
  (r) =>
    Array.isArray(r.has) &&
    r.has.some((h) => h.type === 'host' && h.value === WWW_HOST),
);
// F-12 Phase A+: host-aware WWW rules are intentional (effective after Domain→Production).
if (hostRules.length === 0) {
  warnings.push(
    'www host rules missing — F-12 file-based remediation expects exact WWW rules + catch-all',
  );
}
notes.push(`www_host_rules=${hostRules.length}`);

const catchAllHome = redirects.filter(
  (r) =>
    (r.source === '/:path*' || r.source === '/(.*)') &&
    !r.has &&
    (r.destination === '/' ||
      r.destination === 'https://amphon.co.th/' ||
      r.destination === 'https://amphon.co.th'),
);
if (catchAllHome.length) issues.push('forbidden catch-all redirect to homepage detected');

const pathRules = redirects.filter((r) => !r.has);
if (pathRules.length < 184) issues.push(`legacy/path redirect count ${pathRules.length} < 184`);
else notes.push(`path_redirect_rules=${pathRules.length}`);

const astro = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
if (!astro.includes(`site: 'https://amphon.co.th'`) && !astro.includes(`site: "https://amphon.co.th"`)) {
  issues.push('astro.config site is not https://amphon.co.th');
}
const siteTs = fs.readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8');
if (!siteTs.includes("url: 'https://amphon.co.th'")) issues.push('site.url is not https://amphon.co.th');

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

function isPermanent(status) {
  return status === 301 || status === 308;
}

if (runtime) {
  notes.push('runtime=production');
  const currentPaths = ['/', '/contact', '/about', '/blog'];
  for (const p of currentPaths) {
    const variants = [
      { label: 'https-apex', url: `https://${CANONICAL_HOST}${p}`, maxHops: 0 },
      { label: 'http-apex', url: `http://${CANONICAL_HOST}${p}`, maxHops: 1 },
      { label: 'https-www', url: `https://${WWW_HOST}${p}`, maxHops: 1 },
      { label: 'http-www', url: `http://${WWW_HOST}${p}`, maxHops: 2 },
    ];
    for (const v of variants) {
      const hops = trace(v.url);
      const redirectCount = Math.max(0, hops.length - 1);
      const final = hops[hops.length - 1];
      notes.push(`${v.label}${p}: hops=${redirectCount} final=${final.status} ${final.url}`);
      if (redirectCount > v.maxHops) issues.push(`${v.label}${p}: hops ${redirectCount} > max ${v.maxHops}`);
      if (v.label !== 'https-apex' && !isPermanent(hops[0].status)) {
        issues.push(`${v.label}${p}: first hop status ${hops[0].status} not permanent`);
      }
      if (!final.url.startsWith(CANONICAL_ORIGIN)) {
        issues.push(`${v.label}${p}: final host not canonical: ${final.url}`);
      }
    }
  }

  const missing = '/random-url-that-does-not-exist-batch7';
  const missHops = trace(`http://${WWW_HOST}${missing}`);
  const missFinal = missHops[missHops.length - 1];
  notes.push(`http-www-404: hops=${missHops.length - 1} final=${missFinal.status} ${missFinal.url}`);
  if (missFinal.status !== 404) issues.push(`http www missing path final ${missFinal.status} !== 404`);
  if (missFinal.url === `${CANONICAL_ORIGIN}/` || missFinal.url === CANONICAL_ORIGIN) {
    issues.push('soft 404: missing path redirected to homepage');
  }

  const q = '?source=batch-7-qa&utm_medium=redirect';
  const qFinal = trace(`http://${WWW_HOST}/contact${q}`).at(-1);
  const qUrl = new URL(qFinal.url);
  if (qUrl.searchParams.get('source') !== 'batch-7-qa' || qUrl.searchParams.get('utm_medium') !== 'redirect') {
    issues.push(`query not preserved: ${qFinal.url}`);
  } else notes.push('query_preserved=yes');

  const legacyEncoded = '/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD';
  const legacyApexHops = trace(`https://${CANONICAL_HOST}${legacyEncoded}`).length - 1;
  if (legacyApexHops !== 1) issues.push(`https apex legacy hops ${legacyApexHops} !== 1`);
  else notes.push('https_apex_legacy_hops=1');

  const legacyWwwHops = trace(`http://${WWW_HOST}${legacyEncoded}`).length - 1;
  notes.push(`http_www_legacy_hops=${legacyWwwHops}`);
  if (legacyWwwHops > 2) {
    const msg = `http www legacy hops ${legacyWwwHops} > 2 (requires Vercel Domain/alias change; repo host rule cannot run before platform HTTPS+domain redirect)`;
    if (allowBlocked) warnings.push(msg);
    else issues.push(msg);
  }

  const httpsWwwLegacy = trace(`https://${WWW_HOST}${legacyEncoded}`).length - 1;
  notes.push(`https_www_legacy_hops=${httpsWwwLegacy}`);
  if (httpsWwwLegacy > 2) issues.push(`https www legacy hops ${httpsWwwLegacy} > 2`);

  // Evidence: first hop of http www must still be same-host HTTPS if platform-limited
  const firstHttpWww = trace(`http://${WWW_HOST}/`)[0];
  if (firstHttpWww.location === `https://${WWW_HOST}/`) {
    notes.push('platform_limit=http_www_upgrades_to_https_www_first');
  }
} else {
  notes.push('runtime=PENDING (pass --runtime)');
  notes.push('finding_status=BLOCKED_PENDING_DOMAIN_CONFIGURATION');
}

console.log('Batch 7 host redirect validation');
for (const note of notes) console.log(`  note: ${note}`);
for (const w of warnings) console.warn(`  warning: ${w}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log(runtime ? (warnings.length ? 'PASS WITH WARNING' : 'PASS') : 'PASS (config; BLOCKED pending domain for full F-12 close)');
