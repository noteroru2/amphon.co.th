import fs from 'node:fs';
import path from 'node:path';

const origin = new URL(process.argv[2] || 'https://amphon.co.th');
if (origin.protocol !== 'https:' && origin.hostname !== '127.0.0.1' && origin.hostname !== 'localhost') {
  throw new Error('Only HTTPS or localhost is supported');
}
const outputFile = process.argv[3] || 'artifacts/cloudflare-migration/production-http-baseline.json';
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const rules = vercel.redirects.filter((r) => r.source !== '/:path+/');
const now = new Date().toISOString();

function normalUrl(input) {
  try {
    const url = new URL(input, origin);
    const pathName = decodeURIComponent(url.pathname);
    return pathName.replace(/\/+$/, '') || '/';
  } catch {
    return 'INVALID';
  }
}
async function httpGet(pathName, body = false) {
  const url = new URL(pathName, origin).href;
  try {
    const r = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(12000),
      headers: { 'User-Agent': 'AMPHON-Migration-ReadOnly-QA/1.0' },
    });
    const text = body ? (await r.text()).slice(0, 1_000_000) : '';
    return {
      status: r.status,
      location: r.headers.get('location') || '',
      contentType: r.headers.get('content-type') || '',
      robots: r.headers.get('x-robots-tag') || '',
      cacheControl: r.headers.get('cache-control') || '',
      body: text,
    };
  } catch (e) {
    return { error: e?.name === 'TimeoutError' ? 'timeout' : String(e?.message || e).slice(0, 180) };
  }
}

const results = Array(rules.length);
let cursor = 0;
async function worker() {
  while (cursor < rules.length) {
    const i = cursor++;
    const rule = rules[i];
    const response = await httpGet(rule.source);
    const expectedStatus = rule.statusCode ?? (rule.permanent ? 308 : 307);
    results[i] = {
      source: rule.source,
      expectedStatus,
      expectedLocation: rule.destination,
      status: response.status ?? null,
      actualLocation: response.location || '',
      statusMatch: response.status === expectedStatus,
      locationMatch: Boolean(response.location) && normalUrl(response.location) === normalUrl(rule.destination),
      error: response.error || null,
    };
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
}
await Promise.all(Array.from({ length: 5 }, worker));

const mustCheck = [
  '/', '/about', '/contact',
  '/บริการ/รับซื้อโน๊ตบุ๊ค',
  '/บริการ/รับซื้อคอมพิวเตอร์',
  '/บริการ/รับซื้อ-macbook',
  '/รับซื้อ/รับเหมาประมูลอุปกรณ์ไอที-อุบลราชธานี',
  '/บริการ/รับซื้อคอมบริษัท',
  '/พื้นที่ให้บริการ',
  '/robots.txt', '/llms.txt', '/sitemap-index.xml',
];
function extract(html) {
  const canonical = html.match(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*\bhref\s*=\s*["']([^"']+)["']/i)?.[1]
    || html.match(/<link\b(?=[^>]*\bhref\s*=\s*["']([^"']+)["'])(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i)?.[1]
    || '';
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
  const noindex = /<meta\s+[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(html);
  const description = html.match(/<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i)?.[1] || '';
  return { title, canonical, description, noindex };
}
const pages = [];
for (const route of mustCheck) {
  const res = await httpGet(route, true);
  const isHtml = String(res.contentType || '').includes('html');
  let local = null;
  if (isHtml) {
    const root = path.join('dist', 'client');
    const decodedRoute = decodeURIComponent(new URL(route, origin).pathname);
    const file = decodedRoute === '/' ? path.join(root, 'index.html') : path.join(root, decodedRoute, 'index.html');
    if (fs.existsSync(file)) local = extract(fs.readFileSync(file, 'utf8'));
  }
  const remote = isHtml ? extract(res.body || '') : null;
  pages.push({
    route, status: res.status ?? null, contentType: res.contentType ?? '',
    redirectLocation: res.location || '', error: res.error || null,
    canonical: remote?.canonical || '', localCanonical: local?.canonical || '',
    titleMatch: !!(remote && local && remote.title === local.title),
    canonicalMatch: !!(remote && local && remote.canonical === local.canonical),
    noindex: remote?.noindex ?? null,
    localNoindex: local?.noindex ?? null,
    bodyBytes: Buffer.byteLength(res.body || ''),
    xRobots: res.robots || '',
  });
}
const slashRoutes = [
  '/about/', '/contact/', '/บริการ/รับซื้อโน๊ตบุ๊ค/',
  '/บริการ/รับซื้อคอมพิวเตอร์/', '/บริการ/รับซื้อ-macbook/',
  '/รับซื้อ/รับเหมาประมูลอุปกรณ์ไอที-อุบลราชธานี/',
];
const slash = [];
for (const route of slashRoutes) {
  const res = await httpGet(route);
  slash.push({ route, status: res.status ?? null, location: res.location || '', error: res.error || null });
}
const www = origin.hostname === 'amphon.co.th' ? await (async () => {
  try {
    const r = await fetch('https://www.amphon.co.th/', { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    return { status: r.status, location: r.headers.get('location') || '' };
  } catch (e) { return { error: String(e?.message || e).slice(0, 180) }; }
})() : null;

const summary = {
  expectedRedirects: rules.length,
  testedRedirects: results.length,
  matchingRedirects: results.filter((r) => r.statusMatch && r.locationMatch).length,
  mismatchingRedirects: results.filter((r) => !(r.statusMatch && r.locationMatch)).length,
  networkErrors: results.filter((r) => !!r.error).length,
  pagesChecked: pages.length,
  pageStatus200: pages.filter((r) => r.status === 200).length,
  htmlCanonicalsDifferentFromCandidate: pages.filter((r) => r.localCanonical && r.canonical && !r.canonicalMatch).length,
};
const report = { sampledAt: now, origin: origin.origin, summary, redirects: results, pages, slash, www };
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('=== HTTP BASELINE (read-only) ===');
console.log(JSON.stringify({ origin: origin.origin, summary, slash, www }, null, 2));
console.log('Redirect mismatches (first 20):');
for (const r of results.filter((r) => !(r.statusMatch && r.locationMatch)).slice(0, 20)) {
  console.log(JSON.stringify(r));
}
console.log('Key page samples:');
for (const p of pages) console.log(JSON.stringify(p));
// Baseline measurements are reported rather than failing: the checked Production deployment
// may be older than the PR's main source, and blocking on drift would hide the evidence.
