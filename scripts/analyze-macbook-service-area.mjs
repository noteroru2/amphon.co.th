import fs from 'node:fs';
import path from 'node:path';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const distDir = path.resolve(args.get('--dist') ?? path.join(process.cwd(), 'dist', 'client'));
const provinces = [
  'กาฬสินธุ์', 'ขอนแก่น', 'ชัยภูมิ', 'นครพนม', 'นครราชสีมา',
  'บึงกาฬ', 'บุรีรัมย์', 'มหาสารคาม', 'มุกดาหาร', 'ยโสธร',
  'ร้อยเอ็ด', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี', 'อุบลราชธานี',
];

function stripHtml(html) {
  const article = html.match(/<article class="prose">([\s\S]*?)<\/article>/iu)?.[1] ?? '';
  return article
    .replace(/<script[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&(?:nbsp|amp|quot|#39);/gu, ' ')
    .replace(/https?:\/\/\S+/gu, ' ')
    .replace(/[()[\]{}*_>`#|]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalize(value) {
  let normalized = value.toLowerCase();
  for (const province of provinces) {
    normalized = normalized.replaceAll(province.toLowerCase(), '<location>');
  }
  return normalized
    .replace(/064[-\s]?257[-\s]?9353/gu, '<phone>')
    .replace(/@webuy/gu, '<contact>')
    .replace(/[^\p{L}\p{N}<>]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function shingles(tokens, size = 4) {
  const set = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    set.add(tokens.slice(index, index + size).join(' '));
  }
  return set;
}

function jaccard(left, right) {
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  const union = left.size + right.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const pages = provinces.map((province) => {
  const filePath = path.join(
    distDir,
    'รับซื้อ',
    `รับซื้อ-macbook-${province}`,
    'index.html',
  );
  if (!fs.existsSync(filePath)) throw new Error(`Missing built route: ${filePath}`);
  const text = stripHtml(fs.readFileSync(filePath, 'utf8'));
  const tokens = normalize(text).split(' ').filter(Boolean);
  return {
    province,
    url: `https://amphon.co.th/รับซื้อ/รับซื้อ-macbook-${province}`,
    text,
    tokens,
    shingles: shingles(tokens),
  };
});

const frequency = new Map();
for (const page of pages) {
  for (const item of page.shingles) frequency.set(item, (frequency.get(item) ?? 0) + 1);
}

const pageRows = pages.map((page) => {
  const uniqueShingles = [...page.shingles].filter((item) => frequency.get(item) === 1).length;
  return {
    url: page.url,
    wordCount: page.tokens.length,
    uniqueWordCount: new Set(page.tokens).size,
    shingleCount: page.shingles.size,
    uniqueShingleCount: uniqueShingles,
    uniqueContentRatio: page.shingles.size === 0 ? 0 : uniqueShingles / page.shingles.size,
  };
});

const pairs = [];
for (let leftIndex = 0; leftIndex < pages.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < pages.length; rightIndex += 1) {
    pairs.push({
      leftUrl: pages[leftIndex].url,
      rightUrl: pages[rightIndex].url,
      similarity: jaccard(pages[leftIndex].shingles, pages[rightIndex].shingles),
    });
  }
}

const sorted = pairs.map((pair) => pair.similarity).sort((a, b) => a - b);
const average = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
const median = (sorted[94] + sorted[95]) / 2;

const summary = {
  distDir,
  pages: pages.length,
  pairs: pairs.length,
  average,
  median,
  maximum: sorted.at(-1),
  above90: sorted.filter((value) => value > 0.9).length,
  above80: sorted.filter((value) => value > 0.8).length,
  above75: sorted.filter((value) => value > 0.75).length,
  averageUniqueContentRatio:
    pageRows.reduce((sum, row) => sum + row.uniqueContentRatio, 0) / pageRows.length,
};

console.log(JSON.stringify({ summary, pages: pageRows, pairs }, null, 2));
