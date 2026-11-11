import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { generateCloudflareRouting } from './cloudflare-routing.mjs';

test('Preview routing preserves exact redirect rules and blocks indexing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-cf-routing-'));
  try {
    const data = generateCloudflareRouting(dir);
    assert.equal(data.staticRedirectCount, 260);
    assert.equal(data.excludedDynamic, 1);
    assert.equal(data.headerRuleCount, 8);
    assert.equal(data.previewNoindex, true);
    const lines = fs.readFileSync(path.join(dir, '_redirects'), 'utf8').split('\n');
    assert.equal(lines.filter((line) => line.startsWith('/')).length, 260);
    assert.ok(lines.some((line) => line.startsWith('/บริการ/รับซื้อ-gopro /บริการ/รับซื้อ-gopro-action-camera 308')));
    assert.ok(lines.some((line) => line.startsWith('/%E0%B8') && line.endsWith(' 308')));
    assert.ok(!lines.some((line) => line.includes('/:path+/')));
    const headers = fs.readFileSync(path.join(dir, '_headers'), 'utf8');
    assert.ok(headers.includes('/images/*\n'));
    assert.ok(headers.includes('X-Content-Type-Options: nosniff'));
    assert.ok(headers.includes('X-Robots-Tag: noindex, nofollow'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
