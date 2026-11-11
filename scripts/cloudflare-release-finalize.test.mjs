import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {finalizeReleaseCandidate} from './cloudflare-release-finalize.mjs';
function fixture(options={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'amphon-rc54-'));
 fs.mkdirSync(path.join(root,'dist/client'),{recursive:true});
 fs.mkdirSync(path.join(root,'dist/server'),{recursive:true});
 const arr=Array.from({length:260},(_,i)=>({source:'/old-'+i,destination:'/new-'+i,statusCode:308}));
 fs.writeFileSync(path.join(root,'vercel.json'),JSON.stringify({redirects:[...arr,
   {source:'/:path+/',destination:'/:path+',statusCode:308}]}));
 fs.writeFileSync(path.join(root,'dist/client/_redirects'),[...arr.map(r=>r.source+' '+r.destination+' 308'),
  '/*/ /:splat 308','/old-2 /wrong 301','/extra /new 301'].join('\n')+'\n');
 fs.writeFileSync(path.join(root,'dist/client/_headers'),options.headers||
  '# GENERATED FROM vercel.json — PRODUCTION. Issue #54.\n/*\n  X-Content-Type-Options: nosniff\n');
 fs.writeFileSync(path.join(root,'dist/server/wrangler.json'),JSON.stringify({
  name:'amphon-co-th-rc-audit',kv_namespaces:[{binding:'SESSION'}],
  assets:{binding:'ASSETS',directory:'../client'},...(options.config||{})
 }));
 return root;
}
function withFixture(args,fn){const d=fixture(args);try{fn(d)}finally{fs.rmSync(d,{recursive:true,force:true})}}
test('dedup removes only later Astro redirect and retains original Vercel mapping',()=>{
 withFixture({},d=>{
  const result=finalizeReleaseCandidate(d);
  assert.equal(result.legacyRedirects,260);
  assert.equal(result.duplicatesRemoved,1);
  assert.equal(result.redirectRules,262);
  assert.equal(result.indexable,true);
  const content=fs.readFileSync(path.join(d,'dist/client/_redirects'),'utf8');
  assert.ok(content.includes('/old-2 /new-2 308'));
  assert.ok(!content.includes('/old-2 /wrong 301'));
  const cfg=JSON.parse(fs.readFileSync(path.join(d,'dist/server/wrangler.rc-audit.json')));
  assert.equal(cfg.name,'amphon-co-th-rc-audit');
  assert.ok(!cfg.route&&!cfg.routes);
 });
});
test('noindex production header fails closed',()=>withFixture({
 headers:'# GENERATED FROM vercel.json — PRODUCTION. Issue #54.\n/*\n X-Robots-Tag: noindex\n'
},d=>assert.throws(()=>finalizeReleaseCandidate(d),/must be indexable/)));
test('attached production route fails closed',()=>withFixture({
 config:{routes:[{pattern:'amphon.co.th',custom_domain:true}]}
},d=>assert.throws(()=>finalizeReleaseCandidate(d),/cannot attach domain routes/)));
test('reuse of staging KV fails closed',()=>withFixture({
 config:{kv_namespaces:[{binding:'SESSION',id:'6563771299d44a43844dcb4e8e9093ec'}]}
},d=>assert.throws(()=>finalizeReleaseCandidate(d),/must not use existing/)));
test('reuse of preview worker identity fails closed',()=>withFixture({
 config:{name:'amphon-co-th'}
},d=>assert.throws(()=>finalizeReleaseCandidate(d),/cannot deploy to an existing/)));
