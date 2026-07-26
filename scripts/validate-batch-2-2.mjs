import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.argv[2] || 'dist/client');
const contentDir = path.resolve('src/content/serviceAreas');
const provinces = [
  'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา',
  'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร',
  'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี',
];

function decode(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function match(html, regex) {
  return decode(html.match(regex)?.[1] ?? '');
}

const rows = provinces.map((province) => {
  const slug = `รับซื้อ-macbook-${province}`;
  const urlPath = `/รับซื้อ/${slug}`;
  const file = path.join(distDir, 'รับซื้อ', slug, 'index.html');
  const source = path.join(contentDir, `${slug}.md`);
  const exists = fs.existsSync(file);
  const html = exists ? fs.readFileSync(file, 'utf8') : '';
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '');
  const description = match(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const robots = match(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
  const article = html.match(/<article class="prose">([\s\S]*?)<\/article>/i)?.[1] ?? '';
  const articleText = decode(article.replace(/<[^>]+>/g, ' '));
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  const canonicalExpected = `https://amphon.co.th${urlPath}`;
  const linksHub = article.includes('href="/บริการ/รับซื้อ-macbook"');
  const linksParent = html.includes('href="/บริการ/รับซื้อ-macbook"');
  const hasFaqSchema = html.includes('"@type":"FAQPage"');
  const hasProvince = [title, h1, description, articleText].every((value) => value.includes(province));
  const hasDistrictGuidance = articleText.includes('อำเภอ');
  const hasServiceGuidance = articleText.includes('ส่งมอบ') && articleText.includes('ประเมิน');
  const hasUbonTruth = province === 'อุบลราชธานี'
    ? html.includes('มีหน้าร้านจริงอยู่ในจังหวัดนี้')
    : html.includes('อุบลราชธานี');
  const hasRiskyPositiveClaim = province !== 'อุบลราชธานี'
    && (
      articleText.includes(`มีหน้าร้านจริงอยู่ใน${province}`)
      || articleText.includes(`มีทีมประจำใน${province}`)
    );
  const pass = exists
    && fs.existsSync(source)
    && h1Count === 1
    && title.includes(province)
    && h1.includes(province)
    && description.includes(province)
    && canonical === canonicalExpected
    && !/noindex/i.test(robots)
    && linksHub
    && linksParent
    && hasFaqSchema
    && hasProvince
    && hasDistrictGuidance
    && hasServiceGuidance
    && hasUbonTruth
    && !hasRiskyPositiveClaim;

  return {
    province,
    slug,
    url: canonicalExpected,
    source,
    exists,
    title,
    h1,
    description,
    canonical,
    robots: robots || 'indexable (no robots override)',
    h1Count,
    linksHub,
    linksParent,
    hasFaqSchema,
    hasDistrictGuidance,
    hasServiceGuidance,
    hasUbonTruth,
    hasRiskyPositiveClaim,
    pass,
  };
});

const summary = {
  distDir,
  expectedPages: provinces.length,
  foundPages: rows.filter((row) => row.exists).length,
  passedPages: rows.filter((row) => row.pass).length,
  uniqueTitles: new Set(rows.map((row) => row.title)).size,
  uniqueH1s: new Set(rows.map((row) => row.h1)).size,
  uniqueDescriptions: new Set(rows.map((row) => row.description)).size,
  allPass: rows.every((row) => row.pass),
};

console.log(JSON.stringify({ summary, rows }, null, 2));
process.exitCode = summary.allPass ? 0 : 1;
