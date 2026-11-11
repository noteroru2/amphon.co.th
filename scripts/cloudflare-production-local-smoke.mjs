import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

// This smoke test starts a disposable LOCAL Worker. It never deploys or edits DNS.
const host = 'http://127.0.0.1:8791';
const out = 'artifacts/cloudflare-migration/local-production-candidate-smoke.json';
const generatedHeaderFile = fs.readFileSync('dist/client/_headers', 'utf8');
assert.doesNotMatch(generatedHeaderFile, /^\s*X-Robots-Tag:\s*[^\n]*\bnoindex\b/im,
  'Production static _headers must not contain noindex');
const localConfig = 'dist/server/wrangler.production-local-test.json';
const originalConfig = JSON.parse(fs.readFileSync('dist/server/wrangler.json', 'utf8'));
fs.writeFileSync(localConfig, JSON.stringify({
  ...originalConfig, compatibility_date: '2026-06-18',
}, null, 2) + '\n');

const worker = spawn(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js',
  'dev', '--config', localConfig, '--local', '--ip', '127.0.0.1', '--port', '8791',
], {
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
for (const stream of [worker.stdout, worker.stderr]) {
  stream.on('data', d => {logs = (logs + String(d)).slice(-6000);});
}
const report = { checkedAt: new Date().toISOString(), origin: host, routes: [], failed: [] };
async function request(route) {
  try {
    const res = await fetch(host + route, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    const body = (res.headers.get('content-type') || '').includes('text/html')
      ? (await res.text()).slice(0, 200000)
      : '';
    return { route, status: res.status, robots: res.headers.get('x-robots-tag') || '',
      location: res.headers.get('location') || '', body };
  } catch(e) { return { route, status: 0, robots: '', location: '', error: String(e?.message || e) }; }
}
try {
  let ready = false;
  for (let i = 0; i < 25; i++) {
    if (worker.exitCode !== null) throw new Error('Local Wrangler exited: '+logs.slice(-1400));
    const r = await request('/robots.txt');
    if (r.status === 200) {ready = true; break;}
    await sleep(500);
  }
  assert.ok(ready, 'Local Cloudflare production-candidate Worker failed to start: '+logs.slice(-1400));

  const pages = [
    '/', '/about', '/contact', '/บริการ/รับซื้อโน๊ตบุ๊ค',
    '/บริการ/รับซื้อคอมพิวเตอร์', '/บริการ/รับซื้อ-macbook',
    '/บริการ/รับซื้อคอมบริษัท', '/บริการ/รับเหมาประมูลอุปกรณ์ไอที',
    '/พื้นที่ให้บริการ/ภูเก็ต', '/robots.txt', '/sitemap-index.xml',
  ];
  for (const route of pages) {
    const r = await request(route);
    report.routes.push({route, status:r.status, noindex:/noindex/i.test(r.robots)});
    if (r.status!==200) report.failed.push(route+' expected 200 got '+r.status);
    if (/noindex/i.test(r.robots)) report.failed.push(route+' has forbidden Production X-Robots-Tag noindex');
    if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(r.body||'')) {
      report.failed.push(route+' has forbidden HTML meta robots noindex');
    }
  }

  for (const route of ['/about/', '/บริการ/รับซื้อโน๊ตบุ๊ค/', '/พื้นที่ให้บริการ/ภูเก็ต/']) {
    const r = await request(route);
    report.routes.push({route,status:r.status,location:r.location});
    if(r.status!==308) report.failed.push(route+' expected 308 got '+r.status);
  }
  for (const route of [
    '/บริการ/รับซื้อกล้องฟิลัม',
    '/บริการ/รับซื้อกล้องฟีล์ม',
    '/บริการ/รับซื้อกล้องฟิล์ล',
  ]) {
    const r=await request(route);
    report.routes.push({route,status:r.status,location:r.location});
    if(r.status!==308 || !r.location) report.failed.push(route+' expected 308 with Location');
  }
  for(const route of ['/__amp_invalid_production_smoke__','/บริการ/__amp_invalid_production_smoke__']) {
    const r=await request(route);
    report.routes.push({route,status:r.status});
    if(r.status!==404) report.failed.push(route+' expected 404 got '+r.status);
  }

  const api=await request('/api/google-reviews');
  report.routes.push({route:api.route,status:api.status,robots:api.robots});
  // API-only noindex is intentionally allowed for Google Reviews JSON, not HTML pages.
  if(api.status!==503 || !/noindex/i.test(api.robots)) {
    report.failed.push('local Google Reviews API must fail safely without secrets');
  }

  console.log(JSON.stringify({pass:report.failed.length===0,
    checked:report.routes.length,failed:report.failed,
    pagesIndexable:pages.length,
  },null,2));
  assert.equal(report.failed.length,0,report.failed.join('\n'));
} finally {
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n','utf8');
  worker.kill('SIGTERM');
  await sleep(450);
  if(worker.exitCode===null)worker.kill('SIGKILL');
  worker.stdout.destroy();
  worker.stderr.destroy();
}
