import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import { setTimeout } from 'node:timers/promises';

// Public, READ-ONLY verification of the CURRENT live site.
// Does NOT infer deployed Git SHA, Cloudflare Worker version, proxy origin,
// origin binding, or deployed code from public TLS/HTML.
const base='https://amphon.co.th';
const out='artifacts/cloudflare-migration/current-live-readonly-preflight.json';
const report={checkedAt:new Date().toISOString(),mode:'PUBLIC_READ_ONLY_NO_DEPLOY',
  sourceSHA:process.env.GITHUB_SHA||null,
  checks:[],criticalFailures:[],advisories:[],notes:[
    'Public probes cannot attest the exact Cloudflare Worker script version or Git SHA',
    'A Vercel READY deployment can be a rollback candidate while Cloudflare serves the apex domain',
    'No request changes DNS, deployment, Workers scripts, secrets, cache or zone rules',
    'Old live content may intentionally differ from the unreleased unified candidate',
  ]};
async function request(route,{redirect='manual'}={}){
 const url=base+route;
 try {
  const r=await fetch(url,{redirect,signal:AbortSignal.timeout(15000),
    headers:{'User-Agent':'AMPHON-Release-ReadOnly-QA/1.0',Accept:'text/html,application/xml,*/*'}});
  const ct=r.headers.get('content-type')||'';
  const text=ct.includes('html')||ct.includes('xml')||ct.includes('text')
    ? (await r.text()).slice(0,240000):'';
  return{url,status:r.status,location:r.headers.get('location')||'',
    contentType:ct,robots:r.headers.get('x-robots-tag')||'',body:text};
 }catch(e){return{url,status:0,error:String(e?.message||e)};}
}
function add(name,r,pass,critical=false,detail=''){
 report.checks.push({name,status:r.status,pass,location:r.location||undefined,detail,error:r.error||undefined});
 if(!pass)(critical?report.criticalFailures:report.advisories).push(name+(detail?': '+detail:''));
}
function robotsBlocked(r){
 return /noindex/i.test(r.robots||'')||
 /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(r.body||'');
}
try{
 const home=await request('/');
 add('apex homepage',home,home.status===200&&!robotsBlocked(home),true,'expected 200, indexable');
 if(home.status===200){
   add('home LINE @webuy',home,/line\.me\/ti\/p\/~@webuy/i.test(home.body),false,'check seller contact link');
   add('home storefront hours',home,/09:00\s*[–-]\s*19:00/.test(home.body),false,'expected reviewed Ubon hours');
   add('home canonical',home,/rel=["']canonical["']/i.test(home.body),false,'must render canonical');
 }
 const wwwUrl='https://www.amphon.co.th/%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A?utm_source=readonly-preflight';
 let www;
 try{
   const r=await fetch(wwwUrl,{redirect:'manual',signal:AbortSignal.timeout(15000)});
   www={status:r.status,location:r.headers.get('location')||''};
 }catch(e){www={status:0,error:String(e?.message||e)};}
 add('www to apex preserves encoded path and query',www,www.status===301&&
   (www.location||'').startsWith(base+'/%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A')&&
   www.location.includes('utm_source=readonly-preflight'),true,'required 301/Location query parity');
 for(const [route,critical] of [['/robots.txt',true],['/sitemap-index.xml',true],
    ['/บริการ/รับซื้อโน๊ตบุ๊ค',false],['/บริการ/รับซื้อคอมพิวเตอร์',false],
    ['/บริการ/รับซื้อ-macbook',false],['/บริการ/รับซื้อคอมบริษัท',false],
    ['/บริการ/รับเหมาประมูลอุปกรณ์ไอที',false]]){
   const r=await request(route);
   add(route,r,r.status===200&&(!route.startsWith('/บริการ/')||!robotsBlocked(r)),critical,'expected 200 without noindex on HTML');
 }
 for(const route of ['/บริการ/รับซื้อกล้องฟิลัม','/บริการ/รับซื้อกล้องฟีล์ม','/บริการ/รับซื้อกล้องฟิล์ล']){
   const r=await request(route);
   add('legacy redirect '+route,r,[301,308].includes(r.status)&&Boolean(r.location),false,'check Location/Status live');
 }
 const api=await request('/api/google-reviews');
 add('/api/google-reviews safe response',api,[200,304,401,403,404,429,503].includes(api.status),
   false,'report status only; never read API secrets or assert reviews exist');
 // This read is diagnostic, not proof that a certificate pack belongs to a given Worker version.
 try{
   const cert=await new Promise((resolve,reject)=>{
     const s=tls.connect({host:'amphon.co.th',port:443,servername:'amphon.co.th',rejectUnauthorized:true,timeout:12000},()=>{
        const c=s.getPeerCertificate();resolve({authorized:s.authorized,valid_to:c.valid_to,subject:c.subject?.CN});s.end();});
     s.on('error',reject);s.on('timeout',()=>{s.destroy();reject(new Error('TLS timeout'))});
   });
   report.tls=cert;
   if(!cert.authorized)report.criticalFailures.push('TLS chain unauthorized');
 }catch(e){report.criticalFailures.push('TLS '+String(e?.message||e))}
}catch(e){report.criticalFailures.push('Uncaught QA '+String(e?.stack||e))}
finally{
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('AMPHON_LIVE_READONLY_PREFLIGHT '+JSON.stringify({checkedAt:report.checkedAt,
   pass:report.criticalFailures.length===0,checks:report.checks.length,
   failed:report.criticalFailures,advisories:report.advisories,tls:report.tls}));
 if(report.criticalFailures.length)process.exitCode=1;
}
