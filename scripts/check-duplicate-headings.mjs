import {
  collectBuiltPages,
  extractFirstH1,
  extractTitle,
  readText,
} from './lib/site-audit.mjs';

const builtPages = collectBuiltPages();
const titleMap = new Map();
const h1Map = new Map();

for (const [pathname, filePath] of builtPages.entries()) {
  const html = readText(filePath);
  const title = extractTitle(html);
  const h1 = extractFirstH1(html);

  if (title) {
    titleMap.set(title, [...(titleMap.get(title) ?? []), pathname]);
  }

  if (h1) {
    h1Map.set(h1, [...(h1Map.get(h1) ?? []), pathname]);
  }
}

const duplicateTitles = [...titleMap.entries()].filter(([, pages]) => pages.length > 1);
const duplicateH1s = [...h1Map.entries()].filter(([, pages]) => pages.length > 1);

if (duplicateTitles.length === 0 && duplicateH1s.length === 0) {
  console.log(`PASS headings: ${builtPages.size} built page(s) checked, no duplicate titles or H1s found`);
  process.exit(0);
}

if (duplicateTitles.length > 0) {
  console.error(`FAIL headings: ${duplicateTitles.length} duplicate title(s) found`);
  for (const [title, pages] of duplicateTitles.slice(0, 20)) {
    console.error(`- title "${title}" -> ${pages.join(', ')}`);
  }
}

if (duplicateH1s.length > 0) {
  console.error(`FAIL headings: ${duplicateH1s.length} duplicate H1(s) found`);
  for (const [h1, pages] of duplicateH1s.slice(0, 20)) {
    console.error(`- h1 "${h1}" -> ${pages.join(', ')}`);
  }
}

process.exit(1);
