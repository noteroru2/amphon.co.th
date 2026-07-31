/**
 * Batch 1 regression: every F-01 Thai legacy URL must resolve in one hop
 * to a confirmed destination (unicode + percent-encoded + query + negative).
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  collectBuiltPages,
  loadRedirects,
  normalizePathname,
  resolveRedirectChain,
} from './lib/site-audit.mjs';

const repoRoot = process.cwd();
const SITE = 'https://amphon.co.th';

const encodePath = (pathname) =>
  pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : ''))
    .join('/');

const provinces = fs
  .readdirSync(path.join(repoRoot, 'src/content/serviceAreas'))
  .filter((file) => file.startsWith('รับซื้อ-ssd-') && file.endsWith('.md'))
  .map((file) => file.replace(/^รับซื้อ-ssd-/, '').replace(/\.md$/, ''))
  .sort((a, b) => a.localeCompare(b, 'th'));

function buildCases() {
  const cases = [];

  const exact = [
    { unicode: '/รับซื้อ', destination: '/รับซื้อสินค้าไอที', group: 'hub' },
    { unicode: '/บริการ/รับซื้อสินค้าไอที', destination: '/รับซื้อสินค้าไอที', group: 'hub' },
    { unicode: '/รับซื้อ/รับซื้อ-hdd', destination: '/บริการ/รับซื้อ-ssd', group: 'service-exact' },
    {
      unicode: '/รับซื้อ/รับซื้อ-gopro',
      destination: '/บริการ/รับซื้อ-gopro-action-camera',
      group: 'service-exact',
    },
    { unicode: '/รับซื้อ/รับซื้อเลนส์', destination: '/บริการ/รับซื้อเลนส์กล้อง', group: 'service-exact' },
    { unicode: '/รับซื้อ/รับซื้อ-storage-nas', destination: '/บริการ/รับซื้อ-nas', group: 'service-exact' },
  ];

  for (const item of exact) {
    cases.push({
      request: item.unicode,
      form: 'unicode',
      expected: item.destination,
      group: item.group,
      queryTest: false,
    });
    cases.push({
      request: encodePath(item.unicode),
      form: 'percent-encoded',
      expected: item.destination,
      group: item.group,
      queryTest: false,
    });
  }

  // Query preservation on hub (config-level: destination has no `?`, Vercel keeps query)
  cases.push({
    request: '/รับซื้อ?source=test',
    form: 'unicode+query',
    expected: '/รับซื้อสินค้าไอที',
    group: 'query',
    queryTest: true,
    expectedQuery: 'source=test',
  });
  cases.push({
    request: `${encodePath('/รับซื้อ')}?source=test`,
    form: 'percent-encoded+query',
    expected: '/รับซื้อสินค้าไอที',
    group: 'query',
    queryTest: true,
    expectedQuery: 'source=test',
  });

  for (const province of provinces) {
    const provinceCases = [
      {
        unicode: `/รับซื้อ/รับซื้อ-hdd-${province}`,
        destination: `/รับซื้อ/รับซื้อ-ssd-${province}`,
        group: 'service-x-province-hdd',
      },
      {
        unicode: `/รับซื้อ/รับซื้อ-gopro-${province}`,
        destination: '/บริการ/รับซื้อ-gopro-action-camera',
        group: 'service-x-province-gopro',
      },
      {
        unicode: `/รับซื้อ/รับซื้อเลนส์-${province}`,
        destination: '/บริการ/รับซื้อเลนส์กล้อง',
        group: 'service-x-province-lens',
      },
      {
        unicode: `/รับซื้อ/รับซื้อ-storage-nas-${province}`,
        destination: '/บริการ/รับซื้อ-nas',
        group: 'service-x-province-nas',
      },
    ];

    for (const item of provinceCases) {
      cases.push({
        request: item.unicode,
        form: 'unicode',
        expected: item.destination,
        group: item.group,
        queryTest: false,
      });
      cases.push({
        request: encodePath(item.unicode),
        form: 'percent-encoded',
        expected: item.destination,
        group: item.group,
        queryTest: false,
      });
    }
  }

  return cases;
}

function splitRequest(request) {
  const [rawPath, query = ''] = request.split('?');
  let pathname = rawPath;
  try {
    pathname = decodeURIComponent(rawPath);
  } catch {
    pathname = rawPath;
  }
  return { rawPath, pathname, query };
}

function matchRule(requestPath, redirects) {
  // Prefer exact source match against raw (encoded) then decoded unicode.
  const bySource = new Map(redirects.map((rule) => [rule.source, rule]));
  if (bySource.has(requestPath)) return bySource.get(requestPath);

  let decoded = requestPath;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {
    decoded = requestPath;
  }
  if (bySource.has(decoded)) return bySource.get(decoded);

  // Fall back to compiled matcher (supports :path+ trailing slash only in this batch)
  const result = resolveRedirectChain(decoded, redirects);
  if (result.chain.length === 0) return null;
  return {
    source: result.chain[0].source,
    destination: result.chain[0].destination,
    permanent: result.chain[0].permanent,
  };
}

const redirects = loadRedirects();
const cases = buildCases();
const issues = [];
const results = [];

const knownDestinations = new Set([
  '/รับซื้อสินค้าไอที',
  '/บริการ/รับซื้อ-ssd',
  '/บริการ/รับซื้อ-gopro-action-camera',
  '/บริการ/รับซื้อเลนส์กล้อง',
  '/บริการ/รับซื้อ-nas',
  ...provinces.map((province) => `/รับซื้อ/รับซื้อ-ssd-${province}`),
]);

const pages = collectBuiltPages();
const hasBuild = pages.size > 0;

for (const testCase of cases) {
  const { rawPath, pathname, query } = splitRequest(testCase.request);
  const rule = matchRule(rawPath, redirects);

  if (!rule) {
    issues.push(`no redirect rule for ${testCase.request}`);
    results.push({ ...testCase, status: 'FAIL', note: 'no rule' });
    continue;
  }

  if (!rule.permanent) {
    issues.push(`redirect not permanent for ${testCase.request}`);
  }

  const destination = normalizePathname(rule.destination) || rule.destination;
  if (destination !== testCase.expected) {
    issues.push(`wrong destination for ${testCase.request}: ${destination} != ${testCase.expected}`);
  }

  // One-hop: destination must not itself be a redirect source (except trailing-slash catch-all)
  const hop = resolveRedirectChain(destination, redirects);
  if (hop.loop) {
    issues.push(`loop involving destination of ${testCase.request}`);
  }
  if (hop.chain.length > 0) {
    issues.push(
      `redirect chain for ${testCase.request}: ${testCase.request} -> ${destination} -> ${hop.chain
        .map((step) => step.destination)
        .join(' -> ')}`,
    );
  }

  if (!knownDestinations.has(destination)) {
    issues.push(`destination not in confirmed map: ${destination} (from ${testCase.request})`);
  }

  if (hasBuild && !pages.has(destination)) {
    issues.push(`destination missing from build output: ${destination}`);
  }

  if (testCase.queryTest && query !== testCase.expectedQuery) {
    issues.push(`query parse failed for ${testCase.request}`);
  }

  // Config-level query preservation: destination must not contain `?` (Vercel keeps original query)
  if (String(rule.destination).includes('?')) {
    issues.push(`destination hardcodes query (would drop original query): ${rule.destination}`);
  }

  results.push({
    request: testCase.request,
    form: testCase.form,
    group: testCase.group,
    expected: testCase.expected,
    actual: destination,
    hops: 1 + hop.chain.length,
    queryPreservedConfig: !String(rule.destination).includes('?'),
    status: destination === testCase.expected && hop.chain.length === 0 ? 'PASS' : 'FAIL',
  });
}

// Negative: random path must not match any F-01 rule / must not redirect to homepage
const negativePaths = [
  '/random-url-that-does-not-exist',
  '/this-page-should-not-exist-xyz',
  encodePath('/รับซื้อสินค้าที่ไม่มีจริง'),
];

for (const negative of negativePaths) {
  const { rawPath, pathname } = splitRequest(negative);
  const exactHit = redirects.find((rule) => rule.source === rawPath || rule.source === pathname);
  const chain = resolveRedirectChain(pathname, redirects);
  const redirectedHome = chain.finalPath === '/' || chain.finalPath === '/รับซื้อสินค้าไอที';
  if (exactHit) {
    issues.push(`negative path unexpectedly has exact redirect: ${negative}`);
  }
  if (chain.chain.length > 0 && redirectedHome) {
    issues.push(`negative path redirected to hub/home: ${negative} -> ${chain.finalPath}`);
  }
  // trailing-slash catch-all should not match paths without trailing slash
  if (chain.chain.length > 0 && !pathname.endsWith('/') && chain.chain[0].source.includes(':path+')) {
    issues.push(`negative path matched trailing-slash catch-all unexpectedly: ${negative}`);
  }
}

// Current URL regression: destinations and key live pages must not redirect away
const currentUrls = [
  '/',
  '/รับซื้อสินค้าไอที',
  '/บริการ/รับซื้อ-ssd',
  '/บริการ/รับซื้อ-macbook',
  '/บริการ/รับซื้อ-gopro-action-camera',
  '/บริการ/รับซื้อเลนส์กล้อง',
  '/บริการ/รับซื้อ-nas',
  '/contact',
  '/พื้นที่ให้บริการ/ขอนแก่น',
  `/รับซื้อ/รับซื้อ-ssd-${provinces[0]}`,
];

for (const current of currentUrls) {
  const chain = resolveRedirectChain(current, redirects);
  if (chain.chain.length > 0) {
    issues.push(`current URL is redirected: ${current} -> ${chain.finalPath}`);
  }
}

const outDir = path.join(repoRoot, 'docs/batch-1-thai-legacy-redirects');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'regression-results.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      provinces: provinces.length,
      caseCount: cases.length,
      passCount: results.filter((row) => row.status === 'PASS').length,
      failCount: results.filter((row) => row.status === 'FAIL').length,
      issueCount: issues.length,
      hasBuild,
      issues,
      results,
    },
    null,
    2,
  ),
);

if (issues.length === 0) {
  console.log(
    `PASS batch-1 redirects: ${cases.length} cases (unicode+encoded), ${provinces.length} provinces, 0 chains/loops, negatives OK`,
  );
  process.exit(0);
}

console.error(`FAIL batch-1 redirects: ${issues.length} issue(s)`);
for (const issue of issues.slice(0, 50)) {
  console.error(`- ${issue}`);
}
if (issues.length > 50) console.error(`- ... ${issues.length - 50} more`);
process.exit(1);
