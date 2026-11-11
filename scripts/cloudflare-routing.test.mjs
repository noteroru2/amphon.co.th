import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { generateCloudflareRouting } from './cloudflare-routing.mjs';

test('Preview routing preserves exact redirect rules and blocks indexing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-cf-routing-'));
  try {
    // Astro can produce its own redirect and cache header rules before conversion.
    fs.writeFileSync(path.join(dir, '_redirects'), '/astro-legacy /astro-new 301\n');
    fs.writeFileSync(path.join(dir, '_headers'), '/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n');
    const data = generateCloudflareRouting(dir);
    assert.equal(data.staticRedirectCount, 260);
    assert.equal(data.excludedDynamic, 1);
    assert.equal(data.dynamicRedirectCount, 1);
    assert.equal(data.headerRuleCount, 8);
    assert.equal(data.previewNoindex, true);
    const lines = fs.readFileSync(path.join(dir, '_redirects'), 'utf8').split('\n');
    assert.equal(lines.filter((line) => line.startsWith('/')).length, 262);
    assert.ok(lines.includes('/*/ /:splat 308'));
    assert.ok(lines.includes('/astro-legacy /astro-new 301'));
    assert.ok(lines.indexOf('/astro-legacy /astro-new 301') > lines.findIndex((line) => line.startsWith('/บริการ/รับซื้อ-gopro ')));

    // Keep the percent-encoded Location byte-for-byte as specified in Vercel.
    const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
    const gopro = vercel.redirects.find((entry) => entry.source === '/บริการ/รับซื้อ-gopro');
    assert.ok(gopro, 'GoPro redirect fixture missing in vercel.json');
    assert.ok(lines.includes(gopro.source + ' ' + gopro.destination + ' 308'));
    assert.ok(lines.some((line) => line.startsWith('/%E0%B8') && line.endsWith(' 308')));
    assert.ok(!lines.some((line) => line.includes('/:path+/')));
    const headers = fs.readFileSync(path.join(dir, '_headers'), 'utf8');
    assert.ok(headers.includes('/_astro/*\n  Cache-Control: public, max-age=31536000, immutable'));
    assert.ok(headers.includes('/images/*\n'));
    assert.ok(headers.includes('X-Content-Type-Options: nosniff'));
    assert.ok(headers.includes('X-Robots-Tag: noindex, nofollow'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
