/**
 * QA: Thai redirect destinations must be percent-encoded (ASCII Location).
 */
import { execFileSync } from 'node:child_process';
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
const ORIGIN = 'https://amphon.co.th';
const UA = 'AmphonGsc404EncodingQA/1';

const GSC_FIX = [
  '/รับซื้อ/รับซื้อ-hdd-สกลนคร',
  '/รับซื้อ/รับซื้อ-hdd-นครพนม',
  '/รับซื้อ/รับซื้อ-gopro-เลย',
  '/รับซื้อ/รับซื้อเลนส์-อุดรธานี',
  '/รับซื้อ/รับซื้อเลนส์-นครพนม',
  '/รับซื้อ/รับซื้อ-gopro-อุดรธานี',
  '/รับซื้อ/รับซื้อ-hdd-หนองบัวลำภู',
  '/รับซื้อ/รับซื้อ-gopro-บึงกาฬ',
  '/รับซื้อ/รับซื้อเลนส์-ชัยภูมิ',
  '/รับซื้อ/รับซื้อเลนส์-หนองคาย',
  '/รับซื้อ/รับซื้อ-hdd-อุบลราชธานี',
  '/บริการ/รับซื้อสินค้าไอที',
  '/รับซื้อ/รับซื้อ-hdd-บึงกาฬ',
  '/รับซื้อ/รับซื้อเลนส์-ร้อยเอ็ด',
  '/บริการ/รับซื้อ-storage-nas',
  '/บริการ/รับซื้อ-gopro',
  '/บริการ/รับซื้อเลนส์',
  '/บริการ/รับซื้อ-hdd',
];
const BLOG_KEEP = ['/blog/how-to-reset-playstation', '/blog/check-nintendo-joycon'];

const esc = (s) => {
  const t = String(s ?? '');
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
const csv = (rows) => rows.map((r) => r.map(esc).join(',')).join('\n') + '\n';
const encodePathOnce = (p) => p.split('/').map((s) => (s ? encodeURIComponent(s) : '')).join('/');

function curlHeaders(url) {
  try {
    const buf = execFileSync(
      'curl.exe',
      ['--path-as-is', '-sS', '-D', '-', '-o', 'NUL', '--max-redirs', '0', '--connect-timeout', '10', '--max-time', '20', '-A', UA, url],
      { encoding: 'buffer', timeout: 25000, windowsHide: true },
    );
    const latin = buf.toString('latin1');
    const block = latin.split('\r\n\r\n')[0] || '';
    const status = Number((block.match(/HTTP\/\d(?:\.\d)?\s+(\d+)/) || [])[1] || 0);
    const locM = block.match(/^location:\s*(.+)\r?$/im);
    let locationRaw = '';
    let locationUtf8 = '';
    let asciiOnly = true;
    if (locM) {
      locationRaw = locM[1].replace(/\r$/, '');
      const locBuf = Buffer.from(locationRaw, 'latin1');
      locationUtf8 = locBuf.toString('utf8');
      asciiOnly = [...locBuf].every((b) => b < 0x80);
    }
    return { status, locationRaw, locationUtf8, asciiOnly };
  } catch (e) {
    return { status: 0, locationRaw: '', locationUtf8: '', asciiOnly: true, error: String(e) };
  }
}

function findRule(redirects, pathname) {
  const enc = encodePathOnce(pathname);
  return redirects.find((r) => r.source === pathname || r.source === enc) || null;
}

const issues = [];
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const redirects = vercel.redirects || [];

const mapPath = path.join(OUT, 'destination-encoding-map.csv');
if (!fs.existsSync(mapPath)) {
  issues.push('missing destination-encoding-map.csv — run apply script first');
}

// Inventory invariants
const rawUnicode = redirects.filter((r) => !isExternalDestination(r.destination) && hasNonAscii(r.destination));
const doubles = redirects.filter((r) => looksDoubleEncoded(r.destination));
const badPercent = redirects.filter((r) => /%[^0-9A-Fa-f]|%[0-9A-Fa-f](?:$|[^0-9A-Fa-f])/.test(r.destination));

if (rawUnicode.length) issues.push(`raw non-ASCII internal destinations: ${rawUnicode.length}`);
if (doubles.length) issues.push(`double-encoded destinations: ${doubles.length}`);
if (badPercent.length) issues.push(`invalid percent sequences: ${badPercent.length}`);
if (redirects.length !== 222) issues.push(`unexpected redirect count ${redirects.length} (expected 222)`);

// Blog unchanged
for (const blog of BLOG_KEEP) {
  const rule = redirects.find((r) => r.source === blog);
  if (!rule) issues.push(`missing blog rule ${blog}`);
  else if (rule.destination !== '/blog') issues.push(`blog destination changed: ${blog} -> ${rule.destination}`);
}

// Logical round-trip for all destinations
for (const [i, rule] of redirects.entries()) {
  const encoded = encodeRedirectDestination(rule.destination);
  if (encoded !== rule.destination && hasNonAscii(logicalPathname(rule.destination))) {
    // already encoded path should be stable under re-encode
    if (logicalPathname(encoded) !== logicalPathname(rule.destination)) {
      issues.push(`logical drift rule ${i}: ${rule.source}`);
    }
  }
  // re-encoding already-encoded must be idempotent
  if (encodeRedirectDestination(rule.destination) !== rule.destination) {
    issues.push(`not idempotent rule ${i}: ${rule.source}`);
  }
  if (rule.source !== redirects[i].source) issues.push(`source order drift at ${i}`);
}

// Trailing slash dynamic token
const trail = redirects.find((r) => r.source === '/:path+/');
if (trail && trail.destination !== '/:path+') {
  issues.push(`dynamic token corrupted: ${trail.destination}`);
}

fs.mkdirSync(OUT, { recursive: true });

const strictRows = [[
  'source', 'initial_status', 'location_raw', 'ascii_only', 'percent_encoding_valid',
  'logical_target', 'expected_target', 'follow_status', 'final_url', 'query_preserved', 'result',
]];
const gscRows = [[
  'url', 'variant', 'initial_status', 'location_ascii_only', 'location', 'hops', 'final_status',
  'final_logical', 'expected_logical', 'query_ok', 'result',
]];

const runtime = process.argv.includes('--runtime');

if (runtime) {
  for (const p of GSC_FIX) {
    const rule = findRule(redirects, p);
    const expected = rule ? logicalPathname(rule.destination) : '';
    for (const [variant, url] of [
      ['unicode', ORIGIN + p],
      ['encoded', ORIGIN + encodePathOnce(p)],
      ['query', ORIGIN + p + '?source=encodingfix'],
    ]) {
      const hops = [];
      let cur = url;
      for (let i = 0; i < 6; i++) {
        const h = curlHeaders(cur);
        hops.push(h);
        if (!h.status || h.status < 300 || h.status >= 400 || !h.locationUtf8) break;
        if (!h.asciiOnly) {
          issues.push(`non-ASCII Location for ${p} (${variant})`);
          break;
        }
        if (looksDoubleEncoded(h.locationUtf8)) {
          issues.push(`double-encoded Location for ${p}`);
          break;
        }
        cur = new URL(h.locationUtf8, cur).href;
      }
      const first = hops[0];
      const last = hops.at(-1);
      const count = Math.max(0, hops.length - 1);
      let finalLogical = '';
      try {
        finalLogical = decodeURIComponent(new URL(cur).pathname.replace(/\/$/, '') || '/');
      } catch {
        finalLogical = cur;
      }
      let qp = 'n/a';
      if (variant === 'query') {
        try {
          qp = new URL(cur).searchParams.get('source') === 'encodingfix' ? 'yes' : 'no';
          if (qp !== 'yes') issues.push(`query lost ${p}`);
        } catch {
          qp = 'error';
          issues.push(`query parse error ${p}`);
        }
      }
      const ok =
        first.status >= 300 &&
        first.status < 400 &&
        first.asciiOnly &&
        last.status === 200 &&
        count === 1 &&
        finalLogical === expected &&
        (variant !== 'query' || qp === 'yes');
      if (!ok) issues.push(`GSC runtime fail ${variant} ${p}`);
      gscRows.push([
        ORIGIN + p, variant, first.status, first.asciiOnly ? 'yes' : 'no', first.locationUtf8,
        count, last.status, finalLogical, expected, qp, ok ? 'PASS' : 'FAIL',
      ]);
      strictRows.push([
        url, first.status, first.locationUtf8, first.asciiOnly ? 'yes' : 'no',
        !looksDoubleEncoded(first.locationUtf8) && !/%[^0-9A-Fa-f]/.test(first.locationUtf8) ? 'yes' : 'no',
        finalLogical, expected, last.status, cur, qp, ok ? 'PASS' : 'FAIL',
      ]);
    }
  }

  // Blog must remain unchanged functionally
  for (const p of BLOG_KEEP) {
    const h = curlHeaders(ORIGIN + p);
    if (h.status !== 308 || h.locationUtf8 !== '/blog') {
      issues.push(`blog redirect changed: ${p} -> ${h.status} ${h.locationUtf8}`);
    }
  }
} else {
  // Static validation of GSC mapping from config
  for (const p of GSC_FIX) {
    const rule = findRule(redirects, p);
    if (!rule) {
      issues.push(`missing redirect for ${p}`);
      continue;
    }
    if (hasNonAscii(rule.destination)) issues.push(`GSC target still unicode: ${p}`);
    if (looksDoubleEncoded(rule.destination)) issues.push(`GSC target double-encoded: ${p}`);
    gscRows.push([
      ORIGIN + p, 'config', '', 'n/a', rule.destination, '1', 'pending_runtime',
      logicalPathname(rule.destination), logicalPathname(rule.destination), 'n/a', 'CONFIG_OK',
    ]);
  }
  console.log('note: pass --runtime for live Location/ASCII checks');
}

fs.writeFileSync(path.join(OUT, 'gsc-url-validation.csv'), csv(gscRows));
if (runtime) fs.writeFileSync(path.join(OUT, 'strict-client-validation.csv'), csv(strictRows));

if (issues.length) {
  console.error(`FAIL gsc-404-thai-location-encoding: ${issues.length} issue(s)`);
  for (const i of issues.slice(0, 40)) console.error(`- ${i}`);
  process.exit(1);
}

console.log(
  `PASS gsc-404-thai-location-encoding: rules=${redirects.length} rawUnicode=0 doubles=0 blogKeep=2 gscFix=${GSC_FIX.length}${runtime ? ' runtime=OK' : ' runtime=SKIPPED'}`,
);
