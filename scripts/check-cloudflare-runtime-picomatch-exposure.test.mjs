import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkRuntime } from './check-cloudflare-runtime-picomatch-exposure.mjs';

function fixture(fn) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'amphon-picomatch-'));
  for (const p of ['dist/server','.cf-integration-dryrun','src/lib']) fs.mkdirSync(path.join(dir,p),{recursive:true});
  fs.writeFileSync(path.join(dir,'dist/server/entry.mjs'),'// clean worker code\n'.repeat(600));
  fs.writeFileSync(path.join(dir,'.cf-integration-dryrun/index.js'),'// generated cloudflare worker\n'.repeat(600));
  fs.writeFileSync(path.join(dir,'src/lib/api.ts'),"export const ok = true;\n");
  try { return fn(dir); } finally { fs.rmSync(dir,{recursive:true,force:true}); }
}
test('clean emitted code has no detected parser signatures (not an audit waiver)', () => fixture(d => {
  const r=checkRuntime(d);
  assert.equal(r.passed,true);
  assert.equal(r.entrypoints.length,2);
  assert.ok(r.emitted.every(x=>x.sha256.length===64));
  assert.match(r.methodology,/Static/);
}));
test('detects picomatch token hidden inside emitted Worker', () => fixture(d => {
  fs.appendFileSync(path.join(d,'.cf-integration-dryrun/index.js'),'const loaded = "picomatch";\n');
  const r=checkRuntime(d);
  assert.equal(r.passed,false);
  assert.ok(r.hits.some(h=>h.signature==='picomatch'));
}));
test('detects vulnerable parser signature without package name', () => fixture(d => {
  fs.appendFileSync(path.join(d,'dist/server/entry.mjs'),'function analyzeRepeatedExtglob() {}\n');
  assert.ok(checkRuntime(d).hits.some(h=>h.signature==='analyzeRepeatedExtglob'));
}));
test('detects direct source imports even if bundled symbol is renamed', () => fixture(d => {
  fs.writeFileSync(path.join(d,'src/lib/api.ts'),"import matcher from 'picomatch';\n");
  const r=checkRuntime(d);
  assert.equal(r.passed,false);
  assert.equal(r.directSourceImports.length,1);
}));
test('requires real emitted output and does not pass missing bundles', () => fixture(d => {
  fs.rmSync(path.join(d,'.cf-integration-dryrun'),{recursive:true,force:true});
  assert.throws(()=>checkRuntime(d),/Missing emitted Cloudflare artifact directory/);
}));
test('rejects suspiciously tiny files / empty output', () => fixture(d => {
  fs.writeFileSync(path.join(d,'dist/server/entry.mjs'),'');
  assert.throws(()=>checkRuntime(d),/Suspiciously small emitted bundle/);
}));
