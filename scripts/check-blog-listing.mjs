import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogIndexPath = path.join(root, 'dist', 'client', 'blog', 'index.html');
const sourceIndexPath = path.join(root, 'src', 'pages', 'blog', 'index.astro');
const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
const sitemapDirectory = path.join(root, 'dist', 'client');

const expectedPosts = [
  'ขายโทรศัพท์มือสองใกล้ฉัน',
  'ขายกล้อง-sony-มือสอง-ต้องเช็กอะไรบ้าง',
  'mac-mini-m4-มือสอง',
  'แรมมือสองขายได้เท่าไหร่',
];

const issues = [];

function fail(message) {
  issues.push(message);
}

function read(file) {
  if (!fs.existsSync(file)) {
    fail(`missing file: ${path.relative(root, file)}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function relativeLuminance(hex) {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/gu)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const html = read(blogIndexPath);
const indexSource = read(sourceIndexPath);
const globalCss = read(globalCssPath);
const sitemap = fs
  .readdirSync(sitemapDirectory)
  .filter((file) => /^sitemap-\d+\.xml$/u.test(file))
  .map((file) => read(path.join(sitemapDirectory, file)))
  .join('\n');

const cardMatches = [
  ...html.matchAll(/<article[^>]+class="[^"]*\barticle-card\b[^"]*"[\s\S]*?<\/article>/gu),
].map((match) => match[0]);

const cards = cardMatches.map((card) => ({
  href: card.match(/<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/u)?.[1] ?? '',
  dateTime: card.match(/<time[^>]+datetime="([^"]+)"/u)?.[1] ?? '',
  dateText: card.match(/<time[^>]*>([^<]+)<\/time>/u)?.[1]?.trim() ?? '',
}));

const firstFour = cards.slice(0, 4).map((card) => decodeURIComponent(card.href.split('/').pop()));
if (JSON.stringify(firstFour) !== JSON.stringify(expectedPosts)) {
  fail(`first four posts are ${JSON.stringify(firstFour)}, expected ${JSON.stringify(expectedPosts)}`);
}

if (new Set(cards.map((card) => card.href)).size !== cards.length) {
  fail('duplicate article card URL found');
}

for (const slug of expectedPosts) {
  const contentPath = path.join(root, 'src', 'content', 'blog', `${slug}.md`);
  const content = read(contentPath);
  const card = cards.find((item) => decodeURIComponent(item.href).endsWith(`/blog/${slug}`));

  if (!/^date: "2026-07-27"$/mu.test(content)) fail(`${slug}: date is not 2026-07-27`);
  if (!/^updated: "2026-07-27"$/mu.test(content)) fail(`${slug}: updated is not 2026-07-27`);
  if (!card) {
    fail(`${slug}: missing from blog listing`);
  } else {
    if (!card.dateTime.startsWith('2026-07-27')) fail(`${slug}: card datetime is ${card.dateTime}`);
    if (card.dateText !== '27 กรกฎาคม 2026') fail(`${slug}: displayed date is ${card.dateText}`);
  }

  const articleHtml = read(path.join(root, 'dist', 'client', 'blog', slug, 'index.html'));
  const canonical = articleHtml.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/u)?.[1] ?? '';
  if (decodeURIComponent(new URL(canonical).pathname) !== `/blog/${slug}`) {
    fail(`${slug}: canonical mismatch ${canonical}`);
  }
  if (!articleHtml.includes('"datePublished":"2026-07-27T00:00:00.000Z"')) {
    fail(`${slug}: datePublished is not 2026-07-27`);
  }
  if (!articleHtml.includes('"dateModified":"2026-07-27T00:00:00.000Z"')) {
    fail(`${slug}: dateModified is not 2026-07-27`);
  }
  if (!sitemap.includes(encodeURI(`https://amphon.co.th/blog/${slug}`))) {
    fail(`${slug}: missing from sitemap`);
  }
}

const heroHtml = html.match(/<header[^>]+class="[^"]*\bblog-hero\b[^"]*"[\s\S]*?<\/header>/u)?.[0] ?? '';
if (/ราคาที่สูงที่สุด|ได้ราคาดีที่สุด|รับประกันราคา/u.test(heroHtml)) {
  fail('risky price claim remains in blog hero');
}
if (!indexSource.includes('a.data.slug.localeCompare(b.data.slug')) {
  fail('deterministic slug tie-breaker is missing');
}
if (!indexSource.includes('Number.isFinite')) {
  fail('invalid date guard is missing');
}
if (!indexSource.includes('class="blog-hero__description"')) {
  fail('dedicated hero description class is missing');
}
if (!/\.article-card__meta\s*\{[\s\S]*?gap:\s*0\.5rem/u.test(globalCss)) {
  fail('article tag spacing rule is missing');
}

const minimumContrast = Math.min(
  contrast('#dbe4f0', '#0f172a'),
  contrast('#dbe4f0', '#1e293b'),
);
if (minimumContrast < 4.5) {
  fail(`hero description contrast ${minimumContrast.toFixed(2)}:1 is below 4.5:1`);
}

if (issues.length > 0) {
  console.error(`FAIL blog listing: ${issues.length} issue(s)`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `PASS blog listing: ${cards.length} unique cards, expected first four, dates/schema/canonicals/sitemap and ${minimumContrast.toFixed(2)}:1 minimum contrast verified`,
);
