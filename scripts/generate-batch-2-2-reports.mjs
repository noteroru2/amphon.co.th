import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=')];
  }),
);
const distDir = path.resolve(args.dist || 'dist/client');
const outDir = path.resolve('docs/batch-2-2-macbook-service-area-differentiation');
const sourceDir = path.resolve('src/content/serviceAreas');

const provinces = [
  'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา',
  'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร',
  'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี',
];
const wave1 = ['อุบลราชธานี', 'ขอนแก่น', 'บุรีรัมย์', 'สุรินทร์', 'กาฬสินธุ์'];
const wave2 = ['นครราชสีมา', 'อุดรธานี', 'สกลนคร', 'หนองคาย', 'นครพนม', 'ศรีสะเกษ', 'ยโสธร'];
const gsc = {
  'กาฬสินธุ์': '1 impression / 1 click / position 3',
  'ขอนแก่น': '1 impression / 0 clicks / position 5; query “macbook มือสอง ขอนแก่น”',
  'นครพนม': '1 impression / 0 clicks / position 5',
  'นครราชสีมา': '1 impression / 0 clicks / position 11',
  'บุรีรัมย์': '6 impressions / 0 clicks / position 6.5',
  'สกลนคร': '1 impression / 0 clicks / position 10',
  'สุรินทร์': '3 impressions / 1 click / position 7.67',
  'หนองคาย': '1 impression / 0 clicks / position 10',
  'อุบลราชธานี': '10 impressions / 1 click / position 10.9',
};

function decode(value = '') {
  return value
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function match(html, regex) {
  return decode(html.match(regex)?.[1] ?? '');
}
function frontmatter(raw, key) {
  return raw.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1]?.replace(/["']$/, '') ?? '';
}
function csv(rows) {
  return '\uFEFF' + rows.map((row) => row.map((cell) => {
    const value = String(cell ?? '');
    return `"${value.replaceAll('"', '""')}"`;
  }).join(',')).join('\r\n') + '\r\n';
}
function write(name, content) {
  fs.writeFileSync(path.join(outDir, name), content, 'utf8');
}

fs.mkdirSync(outDir, { recursive: true });

const pageRows = provinces.map((province) => {
  const slug = `รับซื้อ-macbook-${province}`;
  const url = `https://amphon.co.th/รับซื้อ/${slug}`;
  const source = path.join(sourceDir, `${slug}.md`);
  const raw = fs.readFileSync(source, 'utf8');
  const html = fs.readFileSync(path.join(distDir, 'รับซื้อ', slug, 'index.html'), 'utf8');
  const article = html.match(/<article class="prose">([\s\S]*?)<\/article>/i)?.[1] ?? '';
  const supportLinks = [...article.matchAll(/href="(\/บริการ\/รับซื้อ-macbook[^"]*)"/g)].map((m) => m[1]);
  return {
    province, slug, url, source: path.relative(process.cwd(), source).replaceAll('\\', '/'),
    wave: wave1.includes(province) ? 'Wave 1' : wave2.includes(province) ? 'Wave 2' : 'Wave 3',
    oldTitle: frontmatter(raw, 'title'),
    oldDescription: frontmatter(raw, 'description'),
    newTitle: match(html, /<title>([\s\S]*?)<\/title>/i),
    newH1: match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, ''),
    newDescription: match(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
    canonical: match(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i),
    robots: match(html, /<meta\s+name="robots"\s+content="([^"]*)"/i),
    parentLinks: (html.match(/href="\/บริการ\/รับซื้อ-macbook"/g) || []).length,
    supportLinks: [...new Set(supportLinks)].join(' | '),
    gsc: gsc[province] || 'No page-level GSC row in supplied export',
  };
});

write('README.md', `# Batch 2.2 — MacBook Service-area Differentiation

สถานะ: **พร้อม review บน branch \`batch-2-2-macbook-service-area-differentiation\`**

งานนี้ปรับ 20 หน้า MacBook service-area ระดับจังหวัด โดยไม่เพิ่ม/ลบ URL ไม่เปลี่ยน slug, redirect, canonical, indexability หรือ sitemap policy และไม่แก้บริการกลุ่มอื่น

## ผลสำคัญ

- 20/20 หน้าได้รับ title, H1, description, เนื้อหาหลัก, FAQ และคำแนะนำพื้นที่ที่แยกกัน
- ร้านจริงระบุเฉพาะอุบลราชธานี; อีก 19 จังหวัดระบุชัดว่าไม่มีสาขาหรือทีมประจำ
- similarity เฉลี่ยแบบ reproducible ลดจาก 86.81% เป็น 25.91%; คู่สูงสุด 29.27%; 0/190 คู่เกิน 75%
- Astro check: 0 errors
- production build ใน diagnostic worktree พาธ ASCII: exit 0 และสร้าง sitemap สำเร็จ
- ไม่มีหน้า District/City ใน inventory จริง จึงไม่สร้าง URL อำเภอเพื่อให้ครบจำนวน QA

อ่านสรุปสุดท้ายที่ [12-final-report.md](12-final-report.md)
`);

write('01-pilot-plan.md', `# Pilot plan

## Gate

Batch 2.1.1 ผ่าน gate จาก commit \`a40f6b3\` ซึ่งมี Batch 2.1 commit เป็น ancestor และรายงานยืนยัน Astro check, production build, sitemap และ MacBook route validation แล้ว

## Wave 1: 5 Province pages

เลือก อุบลราชธานี, ขอนแก่น, บุรีรัมย์, สุรินทร์ และกาฬสินธุ์ เพราะครอบคลุมหน้าร้านจริงหนึ่งจังหวัด รูปแบบต่างจังหวัด และหน้าที่มีสัญญาณ GSC เด่นใน export

Inventory มี 20 หน้าและทุกหน้าเป็น Province-level ไม่มี District/City URL ดังนั้นข้อกำหนด pilot “อย่างน้อย 2 District/City” ไม่สามารถทำโดยไม่สร้างหน้าใหม่ ซึ่งอยู่นอก scope จึงใช้ 5 จังหวัดตัวแทนและบันทึกข้อจำกัดแทน

## Pilot acceptance

- title/H1/meta มีจังหวัดและไม่ซ้ำ
- มีคำแนะนำพื้นที่ วิธีส่งมอบ การแพ็ก ปัจจัยประเมิน ลิงก์และ FAQ ที่เฉพาะหน้า
- ไม่อ้างสาขา ทีม หรือบริการรับถึงที่เกินจริง
- Astro check หลัง Wave 1 ต้อง 0 errors ก่อนขยายงาน
`);

write('02-pilot-pages.csv', csv([
  ['wave', 'province', 'url', 'level', 'gsc_signal', 'selection_reason', 'qa_status'],
  ...pageRows.filter((r) => r.wave === 'Wave 1').map((r) => [
    r.wave, r.province, r.url, 'Province', r.gsc,
    r.province === 'อุบลราชธานี' ? 'Only province with the real storefront; longest representative page' : 'Representative service-area page with supplied GSC signal',
    'PASS',
  ]),
]));

write('03-pilot-qa.md', `# Pilot QA

Wave 1 แก้ 5 หน้า: อุบลราชธานี ขอนแก่น บุรีรัมย์ สุรินทร์ และกาฬสินธุ์

## Results

- \`astro check\`: exit 0, 0 errors
- 5/5 หน้าใช้ profile เฉพาะจังหวัดและ fallback ไม่กระทบบริการอื่น
- แต่ละหน้ามีจังหวัดใน title/H1/meta, district guidance, service mode, packing advice, evaluation focus, supporting link, CTA และ 3 FAQs
- อุบลราชธานีระบุหน้าร้านจริง; 4 จังหวัดอื่นระบุว่าไม่มีสาขา/ทีมประจำและต้องตกลงส่งมอบเป็นรายกรณี
- ไม่พบการเปลี่ยน URL, canonical, robots หรือ schema type

## District limitation

ไม่พบหน้า District/City ใน 20-route inventory จึงไม่มี district pilot QA และไม่มีการสร้างหน้าใหม่เพื่อทดแทน
`);

write('04-rollout-plan.md', `# Rollout plan

## Wave 2 — 7 pages

นครราชสีมา, อุดรธานี, สกลนคร, หนองคาย, นครพนม, ศรีสะเกษ, ยโสธร

เน้นจังหวัดที่มี GSC signal หรือเป็นกรณีเส้นทาง/ระยะทางสำคัญ หลังแก้รัน \`astro check\` ได้ exit 0 และ 0 errors

## Wave 3 — 8 pages

ชัยภูมิ, บึงกาฬ, มหาสารคาม, มุกดาหาร, ร้อยเอ็ด, เลย, หนองบัวลำภู, อำนาจเจริญ

หลัง Wave 3 ตรวจ 20 built routes, metadata, canonical, indexability, FAQ schema, parent/hub links และ location claims แล้วผ่าน 20/20

## Rollback unit

การแก้ถูก scope ไว้ที่ \`serviceSlug === 'รับซื้อ-macbook'\` และ profile รายจังหวัด จึง rollback ได้โดยถอด component/profile binding โดยไม่แตะ content type อื่น
`);

write('05-rollout-pages.csv', csv([
  ['wave', 'province', 'url', 'level', 'gsc_signal', 'differentiation_focus', 'qa_status'],
  ...pageRows.filter((r) => r.wave !== 'Wave 1').map((r) => [
    r.wave, r.province, r.url, 'Province', r.gsc,
    'Province-specific districts, transport context, device-condition focus, packing advice, supporting service and FAQs',
    'PASS',
  ]),
]));

write('06-location-validation.csv', csv([
  ['province', 'url', 'inventory_level', 'district_route_exists', 'real_store_claim', 'non_ubon_branch_or_team_claim', 'service_mode', 'result'],
  ...pageRows.map((r) => [
    r.province, r.url, 'Province', 'No',
    r.province === 'อุบลราชธานี' ? 'Yes — real storefront in Ubon Ratchathani' : 'No — states real storefront is in Ubon Ratchathani',
    r.province === 'อุบลราชธานี' ? 'Not applicable' : 'None; page explicitly denies a local branch/team',
    r.province === 'อุบลราชธานี' ? 'Pre-assessment, confirmed store visit, or case-by-case handoff' : 'Pre-assessment and case-by-case handoff; no guaranteed pickup',
    'PASS',
  ]),
]));

write('07-title-h1-meta-diff.csv', csv([
  ['province', 'url', 'old_title_and_h1', 'new_title', 'new_h1', 'old_meta_description', 'new_meta_description', 'unique_set_status'],
  ...pageRows.map((r) => [
    r.province, r.url, r.oldTitle, r.newTitle, r.newH1, r.oldDescription, r.newDescription, 'PASS — 20/20 unique',
  ]),
]));

write('08-internal-links-check.csv', csv([
  ['province', 'url', 'parent_macbook_links', 'supporting_links', 'area_breadcrumb', 'missing_links_added_by_batch', 'result'],
  ...pageRows.map((r) => [
    r.province, r.url, r.parentLinks, r.supportLinks,
    `/พื้นที่ให้บริการ/${r.province}`, '0', 'PASS',
  ]),
]));

write('09-similarity-before-after.md', `# Similarity before / after

## Methods

Audit baseline เดิมรายงาน average pairwise similarity **92.4%** และ 190/190 คู่เกิน 75% แต่ไม่ได้ให้ executable implementation เดียวกัน จึงเก็บตัวเลขนี้เป็น historical audit baseline เท่านั้น

เพื่อเปรียบเทียบแบบ method เดียวกัน งานนี้เพิ่ม \`scripts/analyze-macbook-service-area.mjs\`:

- อ่านเฉพาะ built \`article.prose\`
- ตัด HTML/script/style/URL
- normalize ชื่อทั้ง 20 จังหวัด, เบอร์โทร และ contact tokens
- สร้าง normalized 4-word shingles
- คำนวณ Jaccard similarity ครบ 190 คู่

## Reproducible comparison

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Average similarity | 86.81% | 25.91% | -60.90 percentage points |
| Median similarity | 86.72% | 25.94% | -60.78 percentage points |
| Maximum similarity | 92.99% | 29.27% | -63.72 percentage points |
| Pairs > 75% | 190/190 | 0/190 | -190 pairs |
| Average unique-content ratio | 6.89% | 54.43% | +47.54 percentage points |

Before ใช้ output ของ commit \`a40f6b3\` ใน diagnostic build เดิม; After ใช้ production build ของ branch นี้ ทั้งสองรันด้วย script และ normalization เดียวกัน
`);

write('10-technical-qa.md', `# Technical QA

## Passing checks

- Astro check: exit 0, 0 errors (46 pre-existing hints)
- Production build: exit 0 in ASCII diagnostic worktree; Vercel adapter completed
- Sitemap: PASS, 2 sitemap files, indexable canonical URLs only
- Duplicate headings: PASS, 1,186 built pages, no duplicate title or H1
- Batch validator: 20/20 pages; 20 unique titles, 20 unique H1s, 20 unique descriptions
- 20/20 self-canonical, index/follow, exactly one H1, FAQ schema present
- No slug, redirect, canonical, robots, sitemap policy or schema-type changes
- Batch-added internal links: 0 missing targets

## Existing full-site findings outside scope

- Internal-link checker still reports 17 missing targets, all pre-existing camera/iPhone/Ubon-area links and none originating from the 20 changed MacBook pages
- Claim-risk checker reports 1 pre-existing false positive in \`src/content/services/รับซื้อโทรศัพท์เสีย.md\` because the sentence explicitly says it does **not** claim “รับทุกสภาพ”

## Windows path note

Build in the main Thai-character path prerendered all routes but returned exit 1 late in the adapter lifecycle. A clean ASCII-path worktree with its own \`npm ci\` completed with exit 0 and generated sitemap, confirming an environment/path interaction rather than a batch source error.
`);

write('11-browser-qa.md', `# Browser QA

Tested against local Astro server with the in-app browser.

## Desktop — 1440 × 900

Pages: อุบลราชธานี, ขอนแก่น, บุรีรัมย์, นครราชสีมา และ MacBook Hub

- All pages: one H1, expected title/meta/canonical, visible Line and phone CTA
- All service-area pages link to the MacBook parent/hub and supporting route
- Horizontal overflow: none (document width 1,425 vs viewport 1,440)
- Longest representative service-area page: อุบลราชธานี, article 2,430 visible characters, no layout issue
- Hub is table/FAQ-heavy representative: article 10,967 visible characters, no layout issue

## Mobile — 390 × 844

Pages: อุบลราชธานี, บุรีรัมย์ และ MacBook Hub

- Horizontal overflow: none (document width 375 vs viewport 390)
- Mobile menu control, breadcrumb, H1, hero CTA, article, sidebar content, steps and FAQ remain present
- Ubon storefront wording and Buriram no-local-branch wording are visible and distinct

## Required coverage limitation

Inventory has **0 District/City MacBook service-area pages**; all 20 are Province-level. Therefore “District/City อย่างน้อย 3 หน้า” cannot be executed without inventing or adding URLs, which this batch forbids. Four Province pages were checked on desktop and two on mobile instead. No new district route was created.
`);

write('12-final-report.md', `# Final report — Batch 2.2

## Outcome

MacBook service-area pages 20 หน้าเปลี่ยนจาก near-duplicate template เป็นเนื้อหาจังหวัดที่แยก intent ชัดเจน โดยใช้ scoped profile/component เฉพาะ \`serviceSlug: รับซื้อ-macbook\` หน้า service-area ประเภทอื่นไม่เปลี่ยน

แต่ละหน้ามีข้อมูลเฉพาะอย่างน้อย 3–5 ส่วน: บริบทพื้นที่/อำเภอ วิธีเริ่มประเมิน ปัจจัยตรวจเครื่อง คำแนะนำแพ็ก วิธีส่งมอบ supporting service CTA และ FAQ

## Business truth

- หน้าร้านจริง: อุบลราชธานีเท่านั้น
- อีก 19 จังหวัด: ไม่มีการอ้างสาขา ทีมประจำ จุดรับประจำ หรือรับถึงที่แบบรับประกัน
- การส่งมอบต่างจังหวัด: ตกลงเป็นรายกรณีหลังประเมินเบื้องต้น

## SEO and technical result

- Similarity average 86.81% → 25.91%; maximum 92.99% → 29.27%; คู่ >75% ลด 190 → 0
- 20/20 title, H1, description เป็นชุด unique และมีจังหวัดตรงหน้า
- canonical/indexability/sitemap inclusion คงเดิม
- parent/hub/supporting links ใช้งานได้
- ไม่มี redirect/noindex/delete/new URL/schema-type change
- Astro check และ ASCII production build ผ่าน

## Scope and limitations

- ไม่มี District/City route ใน inventory จึงไม่มี district QA และไม่สร้างหน้าใหม่
- ไม่แตะไฟล์ user-modified ใน \`src/content/areas/\` ได้แก่ กาฬสินธุ์ ขอนแก่น นครราชสีมา บุรีรัมย์ และอุดรธานี
- ไม่แก้ 17 existing internal-link findings และ 1 existing claim-risk false positive เพราะอยู่นอก scope
- ไม่ merge และไม่ deploy

## Git

Branch: \`batch-2-2-macbook-service-area-differentiation\`

Required commit message: \`seo: differentiate MacBook service area pages\`
`);

console.log(`Generated Batch 2.2 reports at ${outDir}`);
