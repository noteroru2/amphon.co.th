/**
 * Batch 7 — host/protocol redirect normalization (F-12).
 *
 * Default: config/static assertions only.
 * Runtime: set BATCH7_RUNTIME=1 or pass --runtime to hit production (or BATCH7_BASE).
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
const base = (process.env.BATCH7_BASE || CANONICAL_ORIGIN).replace(/\/$/, '');

const issues = [];
const notes = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const vercelPath = path.join(ROOT, 'vercel.json');
const vercel = readJson(vercelPath);
const redirects = vercel.redirects || [];
notes.push(`redirect_rules=${redirects.length}`);

const hostRules = redirects.filter(
  (r) =>
    Array.isArray(r.has) &&
    r.has.some((h) => h.type === 'host' && h.value === WWW_HOST),
);
if (hostRules.length !== 1) {
  issues.push(`expected exactly 1 www host redirect rule, found ${hostRules.length}`);
} else {
  const rule = hostRules[0];
  if (redirects[0] !== rule && redirects.indexOf(rule) !== 0) {
    issues.push('www host redirect rule must be first in redirects array');
  }
  if (rule.destination !== 'https://amphon.co.th/:path*') {
    issues.push(`unexpected www destination: ${rule.destination}`);
  }
  if (rule.permanent !== true) {
    issues.push('www host redirect must be permanent: true');
  }
  if (!String(rule.source).includes('path')) {
    issues.push(`unexpected www source pattern: ${rule.source}`);
  }
}

const catchAllHome = redirects.filter(
  (r) =>
    (r.source === '/:path*' || r.source === '/(.*)') &&
    !r.has &&
    (r.destination === '/' || r.destination === 'https://amphon.co.th/' || r.destination === 'https://amphon.co.th'),
);
if (catchAllHome.length) {
  issues.push('forbidden catch-all redirect to homepage detected');
}

const pathRules = redirects.filter((r) => !r.has);
if (pathRules.length < 184) {
  issues.push(`legacy/path redirect count ${pathRules.length} < 184`);
} else {
  notes.push(`path_redirect_rules=${pathRules.length}`);
}

const astro = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
if (!astro.includes(`site: 'https://amphon.co.th'`) && !astro.includes(`site: "https://amphon.co.th"`)) {
  issues.push('astro.config site is not https://amphon.co.th');
}
if (/www\.amphon\.co\.th/.test(astro)) {
  issues.push('astro.config references www host');
}

const siteTs = fs.readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8');
if (!siteTs.includes("url: 'https://amphon.co.th'")) {
  issues.push('site.url is not https://amphon.co.th');
}

// No middleware host hacks required for this batch when vercel.json host rule is present
const mw = path.join(ROOT, 'src/middleware.ts');
if (fs.existsSync(mw)) {
  notes.push('middleware_present=yes');
}

function curlHeaders(url) {
  try {
    return execFileSync(
      'curl.exe',
      ['-sS', '-D', '-', '-o', 'NUL', '--max-redirs', '0', url],
      { encoding: 'utf8', maxBuffer: 2e6 },
    );
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
  return { status, location, block };
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
  notes.push(`runtime_base=${base}`);
  const origin = new URL(base).origin;
  if (!origin.includes(CANONICAL_HOST)) {
    issues.push(`runtime base must be canonical host, got ${origin}`);
  }

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
      if (redirectCount > v.maxHops) {
        issues.push(`${v.label}${p}: hops ${redirectCount} > max ${v.maxHops}`);
      }
      if (v.label !== 'https-apex') {
        const first = hops[0];
        if (!isPermanent(first.status)) {
          issues.push(`${v.label}${p}: first hop status ${first.status} not permanent`);
        }
      }
      if (final.status !== 200 && final.status !== 404) {
        // current paths should end 200
        if (p !== '/random-missing') issues.push(`${v.label}${p}: unexpected final ${final.status}`);
      }
      if (final.url && !final.url.startsWith(CANONICAL_ORIGIN)) {
        issues.push(`${v.label}${p}: final host not canonical: ${final.url}`);
      }
      if (hops.some((h) => h.location === 'LOOP')) issues.push(`${v.label}${p}: redirect loop`);
    }
  }

  // 404 path must not soft-redirect to homepage
  const missing = '/random-url-that-does-not-exist-batch7';
  const missHops = trace(`http://${WWW_HOST}${missing}`);
  const missFinal = missHops[missHops.length - 1];
  notes.push(`http-www-404: hops=${missHops.length - 1} final=${missFinal.status} ${missFinal.url}`);
  if (missFinal.status !== 404) issues.push(`http www missing path final ${missFinal.status} !== 404`);
  if (missFinal.url === `${CANONICAL_ORIGIN}/` || missFinal.url === `${CANONICAL_ORIGIN}`) {
    issues.push('soft 404: missing path redirected to homepage');
  }

  // Query preservation
  const q = '?source=batch-7-qa&utm_medium=redirect';
  const qHops = trace(`http://${WWW_HOST}/contact${q}`);
  const qFinal = qHops[qHops.length - 1];
  const qUrl = new URL(qFinal.url);
  if (qUrl.searchParams.get('source') !== 'batch-7-qa' || qUrl.searchParams.get('utm_medium') !== 'redirect') {
    issues.push(`query not preserved on http www contact: ${qFinal.url}`);
  } else {
    notes.push('query_preserved=yes');
  }

  // Legacy HTTPS apex must stay 1 hop
  const legacyEncoded = '/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD';
  const legacyApex = trace(`https://${CANONICAL_HOST}${legacyEncoded}`);
  if (legacyApex.length - 1 !== 1) {
    issues.push(`https apex legacy hops ${legacyApex.length - 1} !== 1`);
  } else {
    notes.push('https_apex_legacy_hops=1');
  }

  // Legacy HTTP WWW: max 2 hops after fix (3 was baseline failure)
  const legacyWww = trace(`http://${WWW_HOST}${legacyEncoded}`);
  const legacyWwwHops = legacyWww.length - 1;
  notes.push(`http_www_legacy_hops=${legacyWwwHops}`);
  if (legacyWwwHops > 2) {
    issues.push(`http www legacy hops ${legacyWwwHops} > 2`);
  }

  // HTTPS WWW legacy: ideally <=2 (www→apex + path, or merged)
  const legacyHttpsWww = trace(`https://${WWW_HOST}${legacyEncoded}`);
  notes.push(`https_www_legacy_hops=${legacyHttpsWww.length - 1}`);
  if (legacyHttpsWww.length - 1 > 2) {
    issues.push(`https www legacy hops ${legacyHttpsWww.length - 1} > 2`);
  }
} else {
  notes.push('runtime=PENDING_PRODUCTION (pass --runtime or BATCH7_RUNTIME=1)');
}

console.log('Batch 7 host redirect validation');
for (const note of notes) console.log(`  note: ${note}`);
if (issues.length) {
  console.error(`FAIL (${issues.length} issue(s))`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log(runtime ? 'PASS' : 'PASS (config; runtime pending)');
