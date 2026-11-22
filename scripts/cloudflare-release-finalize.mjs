// Issue #54 — production RC static artifact guard. NO DEPLOY, NO DNS CHANGES.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function finalizeReleaseCandidate(base=root) {
 const hdr=path.join(base,'dist/client/_headers');
 const red=path.join(base,'dist/client/_redirects');
 const wr=path.join(base,'dist/server/wrangler.json');
 for (const x of [hdr,red,wr]) assert.ok(fs.existsSync(x),'Missing release build artifact '+x);
 const head=fs.readFileSync(hdr,'utf8');
 assert.match(head,/# GENERATED FROM vercel\.json — PRODUCTION\. Issue #54\./);
 assert.doesNotMatch(head,/^\s*X-Robots-Tag:[^\n]*noindex/im,'RC must be indexable');
 const config=JSON.parse(fs.readFileSync(wr,'utf8'));
 assert.equal(config.name,'amphon-co-th-rc-audit','RC cannot deploy to an existing Worker');
 assert.ok(!config.routes&&!config.route,'RC cannot attach domain routes');
 assert.ok(!(config.kv_namespaces||[]).some(x=>x.binding==='SESSION'&&x.id),
   'RC must not use existing Staging/Preview/Production SESSION KV');
 const vercel=JSON.parse(fs.readFileSync(path.join(base,'vercel.json'),'utf8'));
 const exact=vercel.redirects.filter(r=>r.source!=='/:path+/');
 assert.equal(exact.length,260);
 const encoded=new Set(['/บริการ/รับซื้อกล้องฟิลัม','/บริการ/รับซื้อกล้องฟีล์ม','/บริการ/รับซื้อกล้องฟิล์ล']);
 const lines=fs.readFileSync(red,'utf8').split(/\r?\n/),seen=new Set(),kept=[],removed=[];
 for(const line of lines){
   if(!line.trim()||line.trimStart().startsWith('#')){kept.push(line);continue;}
   const parts=line.trim().split(/\s+/);
   assert.ok(parts.length>=3&&/^\d{3}$/.test(parts[2]),'Invalid _redirects rule');
   if(seen.has(parts[0])){removed.push(parts[0]);continue;}
   seen.add(parts[0]);kept.push(line.trim());
 }
 const rules=kept.filter(x=>x.trim()&&x.trim().startsWith('/'));
 assert.equal(new Set(rules.map(x=>x.split(/\s+/)[0])).size,rules.length);
 for(const r of exact){
   const src=encoded.has(r.source)?encodeURI(r.source):r.source;
   const expected=src+' '+r.destination+' '+(r.statusCode??(r.permanent?308:307));
   assert.ok(rules.includes(expected),'Lost Vercel redirect: '+r.source);
 }
 assert.ok(rules.includes('/*/ /:splat 308'));
 assert.ok(rules.length>=261&&rules.length<=280);
 const cfg={...config,name:'amphon-co-th-rc-audit',workers_dev:true,preview_urls:false};
 delete cfg.routes;delete cfg.route;
 fs.writeFileSync(red,kept.join('\n').replace(/\n*$/u,'\n'));
 fs.writeFileSync(path.join(base,'dist/server/wrangler.rc-audit.json'),JSON.stringify(cfg,null,2)+'\n');
 const result={mode:'AUDIT_ONLY_NO_DEPLOY',indexable:true,worker:cfg.name,
   legacyRedirects:260,duplicatesRemoved:removed.length,redirectRules:rules.length,
   customDomains:0,releaseKvConfigured:false};
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
 finalizeReleaseCandidate();
