/**
 * Generate OG image SVGs from Markdown frontmatter.
 * Run: node scripts/generate-og-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const contentDir = path.join(root, 'src/content');

const COLLECTIONS = ['services', 'areas', 'serviceAreas', 'blog'];

const COLLECTION_LABELS = {
  services: 'บริการรับซื้อ',
  areas: 'พื้นที่ให้บริการ',
  serviceAreas: 'รับซื้อในพื้นที่',
  blog: 'บทความ',
};

function readUtf8(filePath) {
  let raw = fs.readFileSync(filePath);
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    raw = raw.subarray(3);
  }
  return raw.toString('utf8');
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = match[1];
  const data = {};
  const titleMatch = fm.match(/^title:\s*(.+)$/m);
  const slugMatch = fm.match(/^slug:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  if (titleMatch) data.title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
  if (slugMatch) data.slug = slugMatch[1].trim();
  if (descMatch) data.description = descMatch[1].trim().replace(/^["']|["']$/g, '');
  const ogMatch = fm.match(/^ogImage:\s*(.+)$/m);
  if (ogMatch) data.ogImage = ogMatch[1].trim();
  return data;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapText(text, maxChars = 28) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + word).length > maxChars) {
      if (line) lines.push(line.trim());
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

function createOgSvg(title, subtitle, categoryLabel) {
  const titleLines = wrapText(title, 22);
  const subtitleLines = wrapText(subtitle, 32);
  const titleY = 220 - (titleLines.length - 1) * 20;
  const titleTspans = titleLines
    .map((line, i) => `<tspan x="600" dy="${i === 0 ? 0 : 44}">${escapeXml(line)}</tspan>`)
    .join('');
  const subTspans = subtitleLines
    .map((line, i) => `<tspan x="600" dy="${i === 0 ? 0 : 32}">${escapeXml(line)}</tspan>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(title)}">
  <rect width="1200" height="630" fill="#111827"/>
  <rect x="0" y="520" width="1200" height="110" fill="#f97316"/>
  <text x="600" y="80" text-anchor="middle" fill="#f97316" font-family="system-ui,sans-serif" font-size="28" font-weight="600">${escapeXml(categoryLabel)}</text>
  <text x="600" y="${titleY}" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="48" font-weight="700">${titleTspans}</text>
  <text x="600" y="${titleY + 60 + titleLines.length * 20}" text-anchor="middle" fill="#d1d5db" font-family="system-ui,sans-serif" font-size="26">${subTspans}</text>
  <text x="600" y="580" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="24" font-weight="600">Amphon.co.th · ภาคอีสาน</text>
</svg>`;
}

function upsertOgImageFrontmatter(filePath, ogPath) {
  let raw = readUtf8(filePath);
  const ogLine = `ogImage: ${ogPath}`;

  if (/^ogImage:/m.test(raw)) {
    raw = raw.replace(/^ogImage:.*$/m, ogLine);
  } else {
    raw = raw.replace(/^(---\r?\n[\s\S]*?)(---)/, (_, fm, closing) => {
      return `${fm}${ogLine}\n${closing}`;
    });
  }

  writeUtf8(filePath, raw);
}

let generated = 0;

for (const collection of COLLECTIONS) {
  const dir = path.join(contentDir, collection);
  if (!fs.existsSync(dir)) continue;

  const outDir = path.join(root, 'public/images/og', collection);
  fs.mkdirSync(outDir, { recursive: true });

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const filePath = path.join(dir, file);
    const raw = readUtf8(filePath);
    const { title, slug, description, ogImage } = parseFrontmatter(raw);
    if (!slug || !title) continue;

    if (ogImage?.endsWith('.webp')) {
      console.log(`⊘ ${collection}/${file} — keep production ogImage`);
      continue;
    }

    const ogPath = `/images/og/${collection}/${slug}.svg`;
    const svg = createOgSvg(title, description ?? '', COLLECTION_LABELS[collection]);
    fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg, 'utf8');
    upsertOgImageFrontmatter(filePath, ogPath);
    generated++;
    console.log(`✓ ${collection}/${file} → ${ogPath}`);
  }
}

console.log(`\nGenerated ${generated} OG images and updated frontmatter.`);
