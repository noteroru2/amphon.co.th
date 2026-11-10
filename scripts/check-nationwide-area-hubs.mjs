/**
 * PR #39 nationwide area expansion: source-level release guard.
 * No network, external secrets or production writes.
 * Full Astro build and rendered QA are separate release gates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const areaDir = path.join(root, 'src/content/areas');
const servicesDir = path.join(root, 'src/content/services');
const regionFile = path.join(root, 'src/config/area-regions.ts');

const newAreas = [
  'กระบี่', 'กรุงเทพมหานคร', 'นครปฐม', 'นครศรีธรรมราช',
  'นนทบุรี', 'นราธิวาส', 'ปทุมธานี', 'ปัตตานี',
  'พระนครศรีอยุธยา', 'พิษณุโลก', 'ระยอง', 'สงขลา',
  'สมุทรปราการ', 'สุราษฎร์ธานี', 'เชียงราย', 'เชียงใหม่',
  'ตรัง', 'ชุมพร', 'สระบุรี', 'ฉะเชิงเทรา',
  'ปราจีนบุรี', 'ลำปาง', 'ราชบุรี', 'ประจวบคีรีขันธ์',
];

const problems = [];
function verify(condition, message) {
  if (!condition) problems.push(message);
}

const areaFiles = fs.readdirSync(areaDir).filter((name) => name.endsWith('.md'));
const slugs = new Map();
for (const file of areaFiles) {
  const body = fs.readFileSync(path.join(areaDir, file), 'utf8');
  const slug = body.match(/^slug:\s*["']?(.+?)["']?\s*$/m)?.[1];
  verify(Boolean(slug), file + ': missing slug');
  if (slug) {
    verify(!slugs.has(slug), file + ': duplicate slug ' + slug);
    slugs.set(slug, file);
  }
}
verify(areaFiles.length === 56, 'Expected 32 original + 24 new area hubs; found ' + areaFiles.length);

const regionSource = fs.readFileSync(regionFile, 'utf8');
const regionLists = [...regionSource.matchAll(/slugs:\s*\[([\s\S]*?)\]/g)];
verify(regionLists.length === 6, 'Expected 6 geographic region groups');
const groupedSlugs = regionLists.flatMap((match) => [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]));
verify(new Set(groupedSlugs).size === groupedSlugs.length, 'Regional navigation lists repeated slugs');
for (const slug of groupedSlugs) verify(slugs.has(slug), 'Region links to nonexistent area hub: ' + slug);
for (const slug of slugs.keys()) verify(groupedSlugs.includes(slug), 'Area missing from region directory: ' + slug);


// Protect the exact user-requested geographic coverage, including Hat Yai
// as a separately preserved established district URL in Songkhla.
const requiredLocations = [
  'ภูเก็ต','สงขลา','หาดใหญ่','ยะลา','ปัตตานี','นราธิวาส','พัทลุง',
  'นครศรีธรรมราช','สุราษฎร์ธานี','กระบี่','ตรัง','ชุมพร',
  'กรุงเทพมหานคร','นนทบุรี','ปทุมธานี','สมุทรปราการ','นครปฐม',
  'พระนครศรีอยุธยา','สระบุรี','สุพรรณบุรี',
  'ชลบุรี','ระยอง','ฉะเชิงเทรา','จันทบุรี','ตราด','ปราจีนบุรี',
  'เชียงใหม่','เชียงราย','ลำปาง','พิษณุโลก','นครสวรรค์','ตาก',
  'อุบลราชธานี','ขอนแก่น','นครราชสีมา','อุดรธานี','บุรีรัมย์',
  'สุรินทร์','ศรีสะเกษ','ร้อยเอ็ด','มหาสารคาม','สกลนคร',
  'กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์',
];
verify(requiredLocations.length === 46, 'Expected 46 requested province/city entries');
for (const location of requiredLocations) verify(slugs.has(location), 'User-requested page missing: ' + location);
const serviceFiles = new Set(fs.readdirSync(servicesDir).filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3)));
for (const slug of newAreas) {
  const file = path.join(areaDir, slug + '.md');
  verify(fs.existsSync(file), 'Missing new area file: ' + slug);
  if (!fs.existsSync(file)) continue;
  const body = fs.readFileSync(file, 'utf8');
  const frontmatter = body.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  verify(frontmatter.includes('slug: "' + slug + '"'), slug + ': slug not self-consistent');
  for (const field of ['title', 'h1', 'description', 'mainKeyword', 'province']) {
    verify(new RegExp('^' + field + ':', 'm').test(frontmatter), slug + ': missing ' + field);
  }
  verify(/draft:\s*false/.test(frontmatter), slug + ': draft flag must be false');
  verify((frontmatter.match(/^\s*-\s*question:/gm) || []).length === 5, slug + ': expected 5 visible FAQs');
  const h2 = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  verify(h2.length >= 5, slug + ': insufficient structured sections');
  verify(new Set(h2).size === h2.length, slug + ': duplicated H2');
  verify(body.includes('อุบลราชธานี') && body.includes('หน้าร้านจริง'), slug + ': missing actual storefront disclosure');
  verify(body.includes('ไม่มีสาขา') || body.includes('ไม่ได้มีสาขา'), slug + ': missing non-branch disclosure');
  verify(body.includes('LINE @webuy'), slug + ': missing visible LINE inquiry');
  verify(!/รับประกันราคา|จ่ายเงินหน้างานทันที/.test(body), slug + ': unsupported price/payment promise');
  const links = [...body.matchAll(/\]\((\/(?:บริการ|พื้นที่ให้บริการ)\/[^)#?\s]+)\)/g)].map((match) => decodeURI(match[1]));
  verify(links.filter((link) => link.startsWith('/บริการ/')).length >= 2, slug + ': too few service links');
  verify(links.filter((link) => link.startsWith('/พื้นที่ให้บริการ/')).length >= 2, slug + ': too few nearby-area links');
  for (const link of links) {
    const dest = link.split('/').filter(Boolean);
    if (dest[0] === 'บริการ') verify(serviceFiles.has(dest[1]), slug + ': broken service link ' + link);
    if (dest[0] === 'พื้นที่ให้บริการ') verify(slugs.has(dest[1]), slug + ': broken area link ' + link);
  }
}
if (problems.length) {
  console.error('Nationwide area source QA FAILED (' + problems.length + '):\n' + problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Nationwide area source QA PASS: 56 unique areas, 6 regions, 24 new pages, FAQ/slug/link/branch-claim guards.');
  console.log('This is source QA only; Build, mobile Preview, canonical, sitemap and production checks remain REQUIRED.');
}
