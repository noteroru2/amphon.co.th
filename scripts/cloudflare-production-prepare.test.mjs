import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { prepareProductionCandidate, RC_WORKER } from './cloudflare-production-prepare.mjs';

function fixture({headers,config,adapterExtra=16}={}) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'amphon-rc-no-deploy-'));
  fs.mkdirSync(path.join(dir,'dist/client'),{recursive:true});
  fs.mkdirSync(path.join(dir,'dist/server'),{recursive:true});
  fs.writeFileSync(path.join(dir,'dist/client/_headers'), headers ??
    '# GENERATED FROM vercel.json — PRODUCTION. Issue #54.\n/*\n  X-Content-Type-Options: nosniff\n');
  const legacy=Array.from({length:260},(_,i)=>({
    source:'/legacy-'+i,destination:'/new-'+i,statusCode:308
  }));
  fs.writeFileSync(path.join(dir,'vercel.json'),
    JSON.stringify({redirects:[...legacy,{source:'/:path+/',destination:'/:path+',statusCode:308}]}));
  const rules=legacy.map(x=>x.source+' '+x.destination+' 308').concat(['/*/ /:splat 308']);
  if(adapterExtra)rules.push(...legacy.slice(0,14).map(x=>x.source+' /wrong 301'));
  if(adapterExtra>=16)rules.push('/adapter-only /adapter-target 301','/other-unique /other 302');
  fs.writeFileSync(path.join(dir,'dist/client/_redirects'),rules.join('\n')+'\n');
  fs.writeFileSync(path.join(dir,'dist/server/wrangler.json'),
    JSON.stringify(config??{name:RC_WORKER,assets:{binding:'ASSETS'},kv_namespaces:[{binding:'SESSION'}]}));
  return dir;
}
function closed(dir,fn){try{fn();}finally{fs.rmSync(dir,{force:true,recursive:true});}}

test('builds INERT indexable prod candidate and preserves 260 legacy routes',()=>{
  const dir=fixture();
  closed(dir,()=>{
    const p=prepareProductionCandidate(dir);
    assert.equal(p.removedDuplicateRules,14);
    assert.equal(p.totalRedirectRules,263);
    const w=JSON.parse(fs.readFileSync(path.join(dir,'dist/server/wrangler.production.candidate.json')));
    assert.equal(w.name,RC_WORKER);
    assert.equal(w.workers_dev,false);
    assert.equal(w.preview_urls,false);
    assert.equal(w.keep_vars,true);
    assert.ok(!w.routes&&!w.route&&!w.custom_domain);
    assert.deepEqual(w.kv_namespaces,[{binding:'SESSION'}]);
    const rules=fs.readFileSync(path.join(dir,'dist/client/_redirects'),'utf8').trim().split('\n');
    assert.equal(rules.length,263);
    assert.equal(new Set(rules.map(s=>s.split(' ')[0])).size,263);
    assert.ok(rules.includes('/legacy-0 /new-0 308'));
    assert.ok(!rules.includes('/legacy-0 /wrong 301'));
  });
});

test('rejects preview noindex headers',()=>{
  const d=fixture({headers:'# GENERATED FROM vercel.json — PRODUCTION. Issue #54.\n/*\n  X-Robots-Tag: noindex, nofollow'});
  closed(d,()=>assert.throws(()=>prepareProductionCandidate(d),/must not inherit/));
});
test('rejects staging/preview worker identity',()=>{
  const d=fixture({config:{name:'amphon-co-th-staging',assets:{binding:'ASSETS'},kv_namespaces:[{binding:'SESSION'}]}});
  closed(d,()=>assert.throws(()=>prepareProductionCandidate(d),/WRONG Worker/));
});
test('refuses previously attached apex or www routes',()=>{
  const d=fixture({config:{name:RC_WORKER,assets:{binding:'ASSETS'},kv_namespaces:[{binding:'SESSION'}],routes:[{pattern:'amphon.co.th/*'}]}});
  closed(d,()=>assert.throws(()=>prepareProductionCandidate(d),/NO domain/));
});
test('rejects altered redirect list rather than silently dropping SEO paths',()=>{
  const d=fixture({adapterExtra:0});
  closed(d,()=>assert.throws(()=>prepareProductionCandidate(d),/duplication count changed/));
});
test('requires newly provisioned production KV and rejects existing staging KV',()=>{
  const d=fixture();
  closed(d,()=>{
    assert.throws(()=>prepareProductionCandidate(d,{mode:'release',productionKvId:''}),/Owner must provision/);
    assert.throws(()=>prepareProductionCandidate(d,{
      mode:'release',productionKvId:'6563771299d44a43844dcb4e8e9093ec',
    }),/Never reuse the staging/);
    const p=prepareProductionCandidate(d,{
      mode:'release',productionKvId:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    });
    assert.equal(p.sessionKVMode,'separate-owner-provisioned');
  });
});
