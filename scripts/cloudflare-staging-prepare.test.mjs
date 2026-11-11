import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { prepareCloudflareStaging, STAGING_WORKER, STAGING_HOST, STAGING_SESSION_KV_ID } from './cloudflare-staging-prepare.mjs';

function mockBuild(override = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'amphon-stage-54-'));
  fs.mkdirSync(path.join(dir, 'dist/client'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'dist/server'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'dist/client/_headers'),
    override.headers ?? [
      '/_astro/*',
      '  Cache-Control: public, max-age=31536000, immutable',
      '# GENERATED FROM vercel.json — PRODUCTION. Issue #54.',
      '/*',
      '  X-Content-Type-Options: nosniff',
      '',
    ].join('\n'));
  fs.writeFileSync(path.join(dir, 'dist/client/_redirects'),
    Array.from({length:260},(_,i) => '/old-'+i+' /new-'+i+' 308')
      .concat(['/*/ /:splat 308']).join('\n'));
  fs.writeFileSync(path.join(dir, 'vercel.json'), JSON.stringify({
    redirects: Array.from({length:260},(_,i) => ({
      source:'/old-'+i, destination:'/new-'+i, statusCode:308,
    })).concat([{source:'/:path+/',destination:'/:path+',statusCode:308}]),
  }));
  fs.writeFileSync(path.join(dir,'dist/server/wrangler.json'),
    JSON.stringify(override.config ?? { name:'amphon-co-th-staging', main:'./entry.mjs',
      assets:{directory:'../client',binding:'ASSETS'},
      kv_namespaces:[{binding:'SESSION'}] }));
  return dir;
}

test('staging converts guarded production artifact and only staging gets noindex', () => {
  const d=mockBuild();
  try {
    const report=prepareCloudflareStaging(d);
    assert.equal(report.stagingWorker,STAGING_WORKER);
    assert.equal(report.plannedStagingHost,STAGING_HOST);
    assert.equal(report.customDomainConfigured,false);
    const header=fs.readFileSync(path.join(d,'dist/client/_headers'),'utf8');
    assert.match(header,/^\/\*[\r\n]+  X-Robots-Tag: noindex, nofollow/m);
    assert.match(header,/X-Content-Type-Options: nosniff/);
    const config=JSON.parse(fs.readFileSync(path.join(d,'dist/server/wrangler.staging.json'),'utf8'));
    assert.equal(config.name,'amphon-co-th-staging');
    assert.equal(config.workers_dev,true);
    assert.equal(config.keep_vars,true);
    assert.deepEqual(config.kv_namespaces,[{binding:'SESSION',id:STAGING_SESSION_KV_ID}]);
    assert.ok(!config.routes && !config.route);
    assert.equal(config.assets.binding,'ASSETS');
  } finally {fs.rmSync(d,{recursive:true,force:true});}
});

test('Cloudflare deploy guard removes adapter duplicate source rules, preserves 260 mappings and unique redirects', () => {
  const d=mockBuild();
  try {
    const redirectFile=path.join(d,'dist/client/_redirects');
    const original=fs.readFileSync(redirectFile,'utf8');
    fs.appendFileSync(redirectFile,'\n/old-3 /overridden 301\n/old-17 /new-17 308\n/astro-one /target 301\n/astro-two /other 302\n');
    const report=prepareCloudflareStaging(d);
    assert.equal(report.duplicateRedirectsRemoved,2);
    assert.equal(report.conflictingAdapterRulesRemoved,1);
    assert.equal(report.adapterExtraRedirects,2);
    assert.equal(report.redirectRulesAfterDeduplication,263);
    const lines=fs.readFileSync(redirectFile,'utf8').split(/\r?\n/).filter(s=>s.startsWith('/'));
    const sources=lines.map(s=>s.split(/\s+/)[0]);
    assert.equal(new Set(sources).size,lines.length);
    assert.equal(lines.length,263);
    assert.ok(lines.includes('/old-3 /new-3 308'));
    assert.ok(!lines.includes('/old-3 /overridden 301'));
    assert.ok(lines.includes('/astro-one /target 301'));
    assert.ok(lines.includes('/astro-two /other 302'));
    for(const l of original.split(/\r?\n/).filter(s=>s.startsWith('/')))
      assert.ok(lines.includes(l),'Missing original redirect: '+l);
    // Running staging preparation again must not change redirect semantics.
    assert.throws(()=>prepareCloudflareStaging(d),/CLEAN Production candidate/);
  } finally { fs.rmSync(d,{recursive:true,force:true}); }
});

test('never collapses encoded and raw-Thai source spellings; keeps both Vercel mappings', () => {
  const d=mockBuild();
  try {
    const redirectFile=path.join(d,'dist/client/_redirects');
    const v=JSON.parse(fs.readFileSync(path.join(d,'vercel.json'),'utf8'));
    const raw='/บริการ/รัปซื้อแรม',encoded=encodeURI(raw);
    v.redirects[0]={source:raw,destination:'/บริการ/รับซื้อแรม',statusCode:308};
    v.redirects[1]={source:encoded,destination:'/บริการ/รับซื้อแรม',statusCode:308};
    fs.writeFileSync(path.join(d,'vercel.json'),JSON.stringify(v));
    const other=Array.from({length:258},(_,i)=>'/old-'+(i+2)+' /new-'+(i+2)+' 308');
    fs.writeFileSync(redirectFile,[
      raw+' /บริการ/รับซื้อแรม 308',
      encoded+' /บริการ/รับซื้อแรม 308',
      ...other,
      '/*/ /:splat 308',
      raw+' /บริการ/รับซื้อแรม 301', // duplicate adapter, must be removed
      '',
    ].join('\n'));
    const report=prepareCloudflareStaging(d);
    assert.equal(report.exactRedirects,260);
    assert.equal(report.duplicateRedirectsRemoved,1);
    const lines=fs.readFileSync(redirectFile,'utf8').split(/\r?\n/);
    assert.ok(lines.includes(raw+' /บริการ/รับซื้อแรม 308'));
    assert.ok(lines.includes(encoded+' /บริการ/รับซื้อแรม 308'));
    assert.ok(!lines.includes(raw+' /บริการ/รับซื้อแรม 301'));
  } finally { fs.rmSync(d,{recursive:true,force:true}); }
});

test('reuses the already-provisioned isolated staging SESSION KV and refuses a foreign KV ID',()=>{
  const d=mockBuild({config:{name:'amphon-co-th-staging',
    kv_namespaces:[{binding:'SESSION',id:'ffffffffffffffffffffffffffffffff'}]}});
  try{assert.throws(()=>prepareCloudflareStaging(d),/Unexpected SESSION KV namespace/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects missing session binding instead of accidental auto-provisioning',()=>{
  const d=mockBuild({config:{name:'amphon-co-th-staging',kv_namespaces:[]}});
  try{assert.throws(()=>prepareCloudflareStaging(d),/Exactly one SESSION KV binding/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects Preview/noindex input so Production remains separately guarded',()=>{
  const d=mockBuild({headers:'/*\n  X-Robots-Tag: noindex\n# GENERATED FROM vercel.json — PRODUCTION. Issue #54.\n'});
  try{assert.throws(()=>prepareCloudflareStaging(d),/CLEAN Production candidate/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects worker identity/host-bound routes that might touch live DNS',()=>{
  const d=mockBuild({config:{name:'amphon-co-th-staging',routes:[{pattern:'amphon.co.th/*'}],kv_namespaces:[{binding:'SESSION'}]}});
  try{assert.throws(()=>prepareCloudflareStaging(d),/routes must be absent/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects accidental reuse of another existing worker',()=>{
  const d=mockBuild({config:{name:'other-website',kv_namespaces:[{binding:'SESSION'}]}});
  try{assert.throws(()=>prepareCloudflareStaging(d),/Refusing to transform/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('rejects staging run against missing Production marker',()=>{
  const d=mockBuild({headers:'/*\n  X-Content-Type-Options: nosniff\n'});
  try{assert.throws(()=>prepareCloudflareStaging(d),/guarded Production build/);}
  finally{fs.rmSync(d,{recursive:true,force:true});}
});
