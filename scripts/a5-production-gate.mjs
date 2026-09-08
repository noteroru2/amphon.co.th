const ORIGIN = (process.env.A5_ORIGIN || 'https://amphon.co.th').replace(/\/$/, '');
const EXPECTED_SOURCE_COMMIT = '00ee115c7ea54246463db0b814b9fc6b80f97841';
const EXPECTED_BASELINE_DATE = '2026-09-06';

const checks = [];
const add = (name, ok, detail = '') => checks.push({ name, ok, detail });

async function get(path, { redirect = 'follow' } = {}) {
  const url = new URL(path, ORIGIN);
  const response = await fetch(url, {
    redirect,
    headers: {
      'user-agent': 'AMPHON-A5-Production-Gate/1.0',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  });
  const text = await response.text();
  return { response, text, url };
}

function decoded(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

let markerExact = false;
try {
  const { response, text } = await get('/a5-recovery-gate.json');
  add('fingerprint.status', response.status === 200, `status=${response.status}`);
  if (response.status === 200) {
    const marker = JSON.parse(text);
    markerExact =
      marker.batch === 'A5' &&
      marker.includesThrough === 'A4' &&
      marker.sourceCommit === EXPECTED_SOURCE_COMMIT &&
      marker.baselineFinalizedGscDate === EXPECTED_BASELINE_DATE;
    add('fingerprint.exact', markerExact, JSON.stringify(marker));
  }
} catch (error) {
  add('fingerprint.fetch', false, error instanceof Error ? error.message : String(error));
}

if (!markerExact) {
  console.log(JSON.stringify({
    batch: 'A5',
    verdict: 'WAIT_FOR_DEPLOY_OR_RECRAWL',
    observationClockActive: false,
    expectedSourceCommit: EXPECTED_SOURCE_COMMIT,
    checks,
  }, null, 2));
  process.exit(2);
}

async function checkPage(name, path, bodyIncludes) {
  try {
    const { response, text } = await get(path);
    add(`${name}.status`, response.status === 200, `status=${response.status}`);
    if (response.status === 200 && bodyIncludes) {
      add(`${name}.output`, text.includes(bodyIncludes), `expects=${bodyIncludes}`);
    }
  } catch (error) {
    add(`${name}.fetch`, false, error instanceof Error ? error.message : String(error));
  }
}

await checkPage(
  'a1.ram',
  '/บริการ/รับซื้อแรม',
  'ลูกค้าต่างจังหวัดสามารถตกลงวิธีจัดส่งหรือนัดรับตามพื้นที่',
);
await checkPage(
  'a2.udon',
  '/พื้นที่ให้บริการ/อุดรธานี',
  'รับซื้อคอมพิวเตอร์และคอมมือสองในอุดรธานี',
);
await checkPage(
  'a3.computer',
  '/บริการ/รับซื้อคอมพิวเตอร์',
  'เตรียมข้อมูล Gaming PC ก่อนส่งประเมิน',
);
await checkPage(
  'a3.tablet',
  '/บริการ/รับซื้อแท็บเล็ต',
  'Surface มีตำหนิแล้วยังประเมินได้ไหม',
);
await checkPage('a4.owner', '/บริการ/รับซื้อคอมบริษัท', 'รับซื้อคอมบริษัท');

for (const malformed of [
  '/บริการ/รัปซื้อคอมบริษัฟ',
  '/บริการ/รัปีงอกคอมบริษัท',
]) {
  try {
    const { response } = await get(malformed, { redirect: 'manual' });
    const location = response.headers.get('location') || '';
    const permanent = response.status === 301 || response.status === 308;
    let targetOk = false;
    if (location) {
      const target = new URL(location, ORIGIN);
      targetOk = decodeURI(target.pathname).replace(/\/$/, '') === '/บริการ/รับซื้อคอมบริษัท';
    }
    add(`a4.redirect:${malformed}`, permanent && targetOk, `status=${response.status}; location=${location}`);
  } catch (error) {
    add(`a4.redirect:${malformed}`, false, error instanceof Error ? error.message : String(error));
  }
}

try {
  const { response, text } = await get('/robots.txt');
  const openEnough = response.status === 200 && /User-agent:/i.test(text) && !/^Disallow:\s*\/$/im.test(text);
  add('robots', openEnough, `status=${response.status}`);
} catch (error) {
  add('robots', false, error instanceof Error ? error.message : String(error));
}

try {
  let sitemap = await get('/sitemap-index.xml');
  if (sitemap.response.status !== 200) sitemap = await get('/sitemap-0.xml');
  const body = decoded(sitemap.text);
  const hasRam = body.includes('/บริการ/รับซื้อแรม');
  const hasCorporate = body.includes('/บริการ/รับซื้อคอมบริษัท');
  add('sitemap.status', sitemap.response.status === 200, `status=${sitemap.response.status}`);
  add('sitemap.targets', hasRam && hasCorporate, `ram=${hasRam}; corporate=${hasCorporate}`);
} catch (error) {
  add('sitemap', false, error instanceof Error ? error.message : String(error));
}

const failed = checks.filter((check) => !check.ok);
const verdict = failed.length === 0 ? 'PASS' : 'NO_GO';

console.log(JSON.stringify({
  batch: 'A5',
  verdict,
  observationClockActive: verdict === 'PASS',
  baselineFinalizedGscDate: EXPECTED_BASELINE_DATE,
  minimumNewFinalizedDays: 7,
  primaryDecisionWindowDays: 14,
  checks,
}, null, 2));

process.exit(verdict === 'PASS' ? 0 : 1);
