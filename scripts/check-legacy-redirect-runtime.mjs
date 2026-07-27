const baseUrl = process.argv[2];
const skipSitemap = process.argv.includes('--skip-sitemap');

if (!baseUrl) {
  console.error('Usage: node scripts/check-legacy-redirect-runtime.mjs <base-url>');
  process.exit(2);
}

const permanentStatuses = new Set([301, 308]);
const cases = [
  {
    label: 'GoPro',
    source: '/บริการ/รับซื้อ-gopro',
    destination: '/บริการ/รับซื้อ-gopro-action-camera',
  },
  {
    label: 'HDD',
    source: '/บริการ/รับซื้อ-hdd',
    destination: '/บริการ/รับซื้อ-ssd',
  },
];

function decodeLocationHeader(value) {
  if (!value || !/[\u00c0-\u00ff]/u.test(value)) return value;
  const repaired = Buffer.from(value, 'latin1').toString('utf8');
  return repaired.includes('\uFFFD') ? value : repaired;
}

function normalize(url) {
  if (!url) return '';
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.search = '';
  if (parsed.pathname !== '/') parsed.pathname = parsed.pathname.replace(/\/+$/u, '');
  return parsed.href;
}

function pathname(url) {
  if (!url) return '';
  return decodeURIComponent(new URL(url).pathname).replace(/\/+$/u, '') || '/';
}

async function fetchManual(url) {
  const response = await fetch(url, { redirect: 'manual' });
  return {
    response,
    location: decodeLocationHeader(response.headers.get('location')),
  };
}

async function follow(url, maxHops = 5) {
  const hops = [];
  let current = url;

  for (let index = 0; index <= maxHops; index += 1) {
    const { response, location } = await fetchManual(current);
    hops.push({ status: response.status, url: current, location: location || '' });

    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, current).href;
      continue;
    }

    return { response, finalUrl: current, hops };
  }

  throw new Error(`redirect limit exceeded for ${url}`);
}

function canonicalFrom(html) {
  const first = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu);
  const second = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/iu);
  return first?.[1] || second?.[1] || '';
}

const issues = [];
const audit = [];

let sitemapPaths = null;
if (!skipSitemap) {
  const sitemapIndex = await fetch(new URL('/sitemap-index.xml', baseUrl));
  const sitemapIndexBody = await sitemapIndex.text();
  const sitemapFiles = [...sitemapIndexBody.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
  const sitemapBodies = await Promise.all(
    sitemapFiles.map(async (url) => {
      const response = await fetch(new URL(new URL(url).pathname, baseUrl));
      return response.text();
    }),
  );
  const sitemap = sitemapBodies.join('\n');
  sitemapPaths = new Set(
    [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => pathname(match[1])),
  );
}

for (const testCase of cases) {
  const sourceUrl = new URL(testCase.source, baseUrl).href;
  const destinationUrl = new URL(testCase.destination, baseUrl).href;
  const first = await fetchManual(sourceUrl);
  const firstLocation = first.location ? new URL(first.location, sourceUrl).href : '';
  const result = await follow(sourceUrl);
  const finalHtml = await result.response.text();
  const canonical = canonicalFrom(finalHtml);

  if (!permanentStatuses.has(first.response.status)) {
    issues.push(`${testCase.label}: source status ${first.response.status} is not permanent`);
  }
  if (normalize(firstLocation) !== normalize(destinationUrl)) {
    issues.push(`${testCase.label}: Location ${firstLocation} != ${destinationUrl}`);
  }
  if (result.hops.length - 1 !== 1) {
    issues.push(`${testCase.label}: redirect count ${result.hops.length - 1} != 1`);
  }
  if (result.response.status !== 200) {
    issues.push(`${testCase.label}: final status ${result.response.status} != 200`);
  }
  if (normalize(result.finalUrl) !== normalize(destinationUrl)) {
    issues.push(`${testCase.label}: final URL ${result.finalUrl} != ${destinationUrl}`);
  }
  if (pathname(canonical) !== pathname(destinationUrl)) {
    issues.push(`${testCase.label}: canonical ${canonical} != ${destinationUrl}`);
  }
  if (sitemapPaths?.has(testCase.source)) {
    issues.push(`${testCase.label}: legacy source is present in sitemap`);
  }
  if (sitemapPaths && !sitemapPaths.has(testCase.destination)) {
    issues.push(`${testCase.label}: final destination is missing from sitemap`);
  }

  const slashResult = await follow(`${sourceUrl}/`);
  if (slashResult.response.status !== 200 || normalize(slashResult.finalUrl) !== normalize(destinationUrl)) {
    issues.push(`${testCase.label}: trailing-slash variant does not reach the final destination`);
  }
  if (slashResult.hops.length - 1 !== 2) {
    issues.push(
      `${testCase.label}: trailing-slash redirect count ${slashResult.hops.length - 1} != 2 under trailingSlash=never`,
    );
  }

  audit.push({
    route: testCase.label,
    source: testCase.source,
    status: first.response.status,
    location: firstLocation,
    redirects: result.hops.length - 1,
    finalStatus: result.response.status,
    finalUrl: result.finalUrl,
    canonical,
    trailingSlashRedirects: slashResult.hops.length - 1,
  });
}

if (issues.length > 0) {
  console.error(`FAIL legacy redirect runtime: ${issues.length} issue(s)`);
  for (const issue of issues) console.error(`- ${issue}`);
  console.error(JSON.stringify(audit, null, 2));
  process.exit(1);
}

console.log('PASS legacy redirect runtime: permanent redirects, final pages, canonicals and sitemap verified');
console.log(JSON.stringify(audit, null, 2));
