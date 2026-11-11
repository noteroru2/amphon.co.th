import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const host = 'http://127.0.0.1:8790';
const out = 'artifacts/cloudflare-migration/local-worker-http-smoke.json';
const child = spawn('npx', [
  'wrangler', 'dev', '--config', 'dist/server/wrangler.json',
  '--local', '--ip', '127.0.0.1', '--port', '8790',
], { env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
child.stdout.on('data', (data) => { logs += String(data).slice(-3000); logs = logs.slice(-6000); });
child.stderr.on('data', (data) => { logs += String(data).slice(-3000); logs = logs.slice(-6000); });

async function fetchRoute(route) {
  try {
    const r = await fetch(host + route, { redirect: 'manual', signal: AbortSignal.timeout(7000) });
    return { route, status: r.status, contentType: r.headers.get('content-type') || '', xRobots: r.headers.get('x-robots-tag') || '', cache: r.headers.get('cache-control') || '', location: r.headers.get('location') || '', text: route === '/api/google-reviews' ? (await r.text()).slice(0, 1200) : '' };
  } catch (e) {
    return { route, error: String(e?.message || e).slice(0, 150) };
  }
}
const report = { inspectedAt: new Date().toISOString(), host, evidence: [], errors: [], warnings: [] };
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) throw new Error('Wrangler exited before preview started: ' + logs.slice(-1200));
    const probe = await fetchRoute('/robots.txt');
    if (probe.status === 200) { ready = true; break; }
    await sleep(500);
  }
  assert.ok(ready, 'Local Wrangler preview did not become ready: ' + logs.slice(-1500));
  for (const route of [
    '/', '/about', '/contact', '/บริการ/รับซื้อโน๊ตบุ๊ค',
    '/บริการ/รับซื้อคอมพิวเตอร์', '/บริการ/รับซื้อ-macbook',
    '/รับซื้อ/รับเหมาประมูลอุปกรณ์ไอที-อุบลราชธานี',
    '/robots.txt', '/llms.txt', '/sitemap-index.xml',
    '/about/', '/บริการ/รับซื้อโน๊ตบุ๊ค/', '/บริการ/รับซื้อ-gopro',
    '/api/google-reviews',
  ]) {
    const item = await fetchRoute(route);
    report.evidence.push(item);
    const staticExpected = !route.endsWith('/') || route === '/';
    if (staticExpected && !route.startsWith('/api/') && route !== '/บริการ/รับซื้อ-gopro') {
      if (item.status !== 200) report.errors.push(route + ' expected 200 but got ' + item.status);
      if (!item.xRobots.toLowerCase().includes('noindex')) {
        report.errors.push(route + ' static Preview is not marked noindex');
      }
    }
    if (route === '/api/google-reviews') {
      if (item.status !== 503) report.errors.push('Unconfigured Google Reviews API must return 503; got ' + item.status);
      if (!item.cache.includes('no-store')) report.errors.push('Google Reviews API cache-control must be no-store');
      if (!item.xRobots.includes('noindex')) report.errors.push('Google Reviews API response must be noindex');
      if (!item.text.includes('not_configured')) report.errors.push('Google Reviews fallback error contract changed');
    }
    if (route.endsWith('/') && route !== '/' && item.status !== 308) report.warnings.push(route + ' slash status ' + item.status + ' versus Production 308');
    if (route === '/บริการ/รับซื้อ-gopro' && item.status !== 308) report.warnings.push('GoPro legacy redirect returned ' + item.status + ', expected 308');
  }
  console.log('Local Wrangler HTTP smoke:', JSON.stringify({ passed: report.errors.length === 0, warnings: report.warnings, sample: report.evidence.map(({route,status,location,xRobots})=>({route,status,location,noindex:xRobots.includes('noindex')})) }, null, 2));
  assert.equal(report.errors.length, 0, report.errors.join('\n'));
} finally {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n', 'utf8');
  child.kill('SIGTERM');
  await sleep(600);
  if (child.exitCode === null) child.kill('SIGKILL');
}
