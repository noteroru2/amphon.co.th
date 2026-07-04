import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'src/content',
  'src/pages',
  'src/layouts',
  'src/components',
];
const pattern = /(อันดับ\s*1|ราคาสูงสุด|ดีที่สุด|รับทุกสภาพ)/giu;
const findings = [];

function walk(dirPath) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const resolved = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(resolved);
      continue;
    }

    if (!/\.(astro|md|mdx)$/u.test(entry.name)) continue;

    const lines = fs.readFileSync(resolved, 'utf8').split(/\r?\n/u);
    lines.forEach((line, index) => {
      if (/^\s*slug\s*:/u.test(line)) return;

      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        findings.push({
          file: resolved,
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}

if (findings.length === 0) {
  console.log('PASS claim-risk: no banned claim phrases found in content/pages/layouts/components');
  process.exit(0);
}

console.error(`FAIL claim-risk: ${findings.length} match(es) found`);
for (const finding of findings.slice(0, 40)) {
  console.error(`- ${finding.file}:${finding.line} ${finding.text}`);
}
process.exit(1);
