import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = path.join(root, 'vercel.json');

/** A preview-only copy of Vercel routing. Keep the source of truth in vercel.json. */
export function generateCloudflareRouting(outputDir = path.join(root, 'dist', 'client')) {
  const { redirects = [], headers = [] } = JSON.parse(fs.readFileSync(baseline, 'utf8'));
  const redirectLines = [
    '# GENERATED FROM vercel.json — DO NOT EDIT. Issue #54.',
    '# Preview only: incomplete trailing-slash wildcard parity blocks production cutover.',
  ];
  let excludedDynamic = 0;
  for (const rule of redirects) {
    if (typeof rule.source !== 'string' || typeof rule.destination !== 'string') {
      throw new Error('Invalid Vercel redirect rule');
    }
    if (/:([A-Za-z][A-Za-z0-9_]*)(\+)?/u.test(rule.source) || rule.source.includes('*')) {
      if (rule.source !== '/:path+/') throw new Error('Unmapped dynamic redirect: ' + rule.source);
      excludedDynamic += 1;
      continue;
    }
    const status = rule.statusCode ?? (rule.permanent ? 308 : 307);
    if (![301, 302, 303, 307, 308].includes(status)) throw new Error('Unsupported redirect code: ' + status);
    for (const value of [rule.source, rule.destination]) {
      if (/\s/u.test(value)) throw new Error('Whitespace in redirect URL: ' + value);
    }
    redirectLines.push(rule.source + ' ' + rule.destination + ' ' + status);
  }

  // Cloudflare _headers accepts globs, not Vercel's regex-like (.*) rules.
  const headerBlocks = ['# GENERATED FROM vercel.json — PREVIEW ONLY. Issue #54.'];
  for (const rule of headers) {
    if (!rule.source || !Array.isArray(rule.headers)) throw new Error('Invalid Vercel header rule');
    const matcher = rule.source.replaceAll('(.*)', '*');
    if (/[()]/u.test(matcher)) throw new Error('Unmapped header expression: ' + rule.source);
    headerBlocks.push(matcher);
    for (const header of rule.headers) {
      if (!header.key || typeof header.value !== 'string') throw new Error('Invalid header value');
      headerBlocks.push('  ' + header.key + ': ' + header.value);
    }
    // An accidental preview exposure must never be indexable.
    if (matcher === '/*') headerBlocks.push('  X-Robots-Tag: noindex, nofollow');
    headerBlocks.push('');
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const redirectFile = path.join(outputDir, '_redirects');
  const headerFile = path.join(outputDir, '_headers');
  const oldRedirects = fs.existsSync(redirectFile) ? fs.readFileSync(redirectFile, 'utf8') : '';
  const oldHeaders = fs.existsSync(headerFile) ? fs.readFileSync(headerFile, 'utf8') : '';
  const redirectMarker = '# GENERATED FROM vercel.json — DO NOT EDIT. Issue #54.';
  const headerMarker = '# GENERATED FROM vercel.json — PREVIEW ONLY. Issue #54.';
  // Preserve the adapter's existing redirects and immutable hashed-asset cache headers.
  const keptRedirects = oldRedirects.includes(redirectMarker) ? '' : oldRedirects.trim();
  const keptHeaders = oldHeaders.includes(headerMarker)
    ? oldHeaders.slice(0, oldHeaders.indexOf(headerMarker)).trim()
    : oldHeaders.trim();
  fs.writeFileSync(redirectFile,
    redirectLines.join('\n') + '\n' + (keptRedirects ? keptRedirects + '\n' : ''), 'utf8');
  fs.writeFileSync(headerFile,
    (keptHeaders ? keptHeaders + '\n\n' : '') + headerBlocks.join('\n') + '\n', 'utf8');
  return {
    staticRedirectCount: redirectLines.length - 2,
    excludedDynamic,
    headerRuleCount: headers.length,
    previewNoindex: headerBlocks.some((line) => line.includes('X-Robots-Tag: noindex')),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  console.log(JSON.stringify(generateCloudflareRouting(outputDir), null, 2));
}
