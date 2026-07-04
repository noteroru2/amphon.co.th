import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const vercelPath = path.join(repoRoot, 'vercel.json');

function compileRedirectRule(rule) {
  let pattern = '^';

  for (let index = 0; index < rule.source.length; index += 1) {
    const char = rule.source[index];

    if (char !== ':') {
      pattern += char.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
      continue;
    }

    let cursor = index + 1;
    let key = '';

    while (cursor < rule.source.length && /[A-Za-z0-9_]/u.test(rule.source[cursor])) {
      key += rule.source[cursor];
      cursor += 1;
    }

    const isGreedy = rule.source[cursor] === '+';
    pattern += isGreedy ? `(?<${key}>.+)` : `(?<${key}>[^/]+)`;
    index = cursor + (isGreedy ? 0 : -1);
  }

  pattern += '$';

  return {
    ...rule,
    regex: new RegExp(pattern, 'u'),
  };
}

function fail(message) {
  console.error(`FAIL vercel-redirect-match: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(vercelPath)) {
  fail('vercel.json not found at repo root');
}

const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

if (!Array.isArray(vercelConfig.redirects)) {
  fail('top-level "redirects" array is missing');
}

const redirects = vercelConfig.redirects;
const compiled = redirects.map((rule, index) => ({ ...compileRedirectRule(rule), index }));

const trailingIndex = redirects.findIndex((rule) => rule.source === '/:path+/');
if (trailingIndex === -1) {
  fail('trailing slash catch-all rule "/:path+/" not found');
}

const dynamicIndexes = redirects
  .map((rule, index) => ({ rule, index }))
  .filter(({ rule }) => /:[A-Za-z0-9_]/u.test(rule.source))
  .map(({ index }) => index);

const firstDynamicIndex = dynamicIndexes[0] ?? Number.POSITIVE_INFINITY;

const cases = [
  {
    label: 'legacy-gopro',
    source: '/บริการ/รับซื้อ-gopro',
    destination: '/บริการ/รับซื้อ-gopro-action-camera',
  },
  {
    label: 'legacy-lens',
    source: '/บริการ/รับซื้อเลนส์',
    encodedSource: '/%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%80%E0%B8%A5%E0%B8%99%E0%B8%AA%E0%B9%8C',
    destination: '/บริการ/รับซื้อเลนส์กล้อง',
  },
  {
    label: 'legacy-hdd',
    source: '/บริการ/รับซื้อ-hdd',
    encodedSource: '/%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-hdd',
    destination: '/บริการ/รับซื้อ-ssd',
  },
  {
    label: 'legacy-computer-ubon',
    source: '/รับซื้อ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
    encodedSource:
      '/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B8%9E%E0%B8%B4%E0%B8%A7%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C-%E0%B8%AD%E0%B8%B8%E0%B8%9A%E0%B8%A5%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%B5',
    destination: '/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี',
  },
];

const issues = [];

for (const testCase of cases) {
  const candidates = [{ kind: 'unicode', path: testCase.source }];
  if (testCase.encodedSource) {
    candidates.push({ kind: 'encoded', path: testCase.encodedSource });
  }

  for (const candidate of candidates) {
    const matched = compiled.find((rule) => rule.regex.test(candidate.path));

    if (!matched) {
      issues.push(`${testCase.label}:${candidate.kind} no rule matched ${candidate.path}`);
      continue;
    }

    if (matched.source !== candidate.path) {
      issues.push(
        `${testCase.label}:${candidate.kind} matched "${matched.source}" before exact source "${candidate.path}"`,
      );
    }

    if (matched.destination !== testCase.destination) {
      issues.push(
        `${testCase.label}:${candidate.kind} destination mismatch "${matched.destination}" != "${testCase.destination}"`,
      );
    }

    if (!matched.permanent) {
      issues.push(`${testCase.label}:${candidate.kind} is not permanent`);
    }

    if (matched.index > trailingIndex) {
      issues.push(`${testCase.label}:${candidate.kind} is ordered after trailing slash catch-all`);
    }

    if (matched.index > firstDynamicIndex) {
      issues.push(`${testCase.label}:${candidate.kind} is ordered after a dynamic redirect rule`);
    }
  }
}

const goproExactIndex = redirects.findIndex(
  (rule) =>
    rule.source === '/บริการ/รับซื้อ-gopro' &&
    rule.destination === '/บริการ/รับซื้อ-gopro-action-camera' &&
    rule.permanent === true,
);

if (goproExactIndex === -1) {
  issues.push('legacy-gopro: exact unicode redirect rule is missing');
} else if (goproExactIndex !== 0) {
  issues.push('legacy-gopro: exact unicode redirect rule is not the first redirect rule');
}

if (
  redirects.some(
    (rule) =>
      rule.source.includes('gopro') &&
      rule.source.startsWith('/%E0%B8'),
  )
) {
  issues.push('legacy-gopro: encoded fallback rule still exists in vercel.json');
}

if (
  redirects.some(
    (rule) =>
      (rule.source.includes('gopro') || rule.destination.includes('gopro')) &&
      (rule.source.includes('à¸') || rule.destination.includes('à¸')),
  )
) {
  issues.push('legacy-gopro: mojibake text found in gopro redirect rule');
}

if (issues.length > 0) {
  console.error(`FAIL vercel-redirect-match: ${issues.length} issue(s) found`);
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `PASS vercel-redirect-match: checked ${cases.reduce((sum, testCase) => sum + (testCase.encodedSource ? 2 : 1), 0)} source variants, top-level redirects and rule order are correct`,
);
