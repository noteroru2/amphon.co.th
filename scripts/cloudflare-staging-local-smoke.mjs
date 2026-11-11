import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';

const host='http://127.0.0.1:8792';
const output='artifacts/cloudflare-migration/local-staging-http-qa.json';
const config=JSON.parse(fs.readFileSync('dist/server/wrangler.staging.json','utf8'));
const cfg=JSON.parse(fs.readFileSync('vercel.json','utf8'));
assert.equal(config.name,'amphon-co-th-staging');
assert.ok(!config.routes && !config.route);
const exact=cfg.redirects.filter(x=>x.source!=='/:path+/');
assert.equal(exact.length,260);

const child=spawn(process.execPath,[
  'node_modules/wrangler/bin/wrangler.js',
  'dev','--config','dist/server/wrangler.staging.json',
  '--local','--ip','127.0.0.1','--port','8792',
],{env:{...process.env,WRANGLER_SEND_METRICS:'false'},stdio:['ignore','pipe','pipe']});
let outputLog='';
for (const stream of [child.stdout,child.stderr]) stream.on('data',d=>{outputLog=(outputLog+String(d)).slice(-5000);});
const report={checkedAt:new Date().toISOString(),worker:config.name,mode:'staging-local',pages:[],redirects:{tested:0,passed:0,bad:[]},slash:[],errors404:[],api:null,failures:[]};
async function request(route,body=false) {
  try {
    const res=await fetch(new URL(route,host),{redirect:'manual',signal:AbortSignal.timeout(12000)});
    return {route,status:res.status,robots:res.headers.get('x-robots-tag')||'',
      contentType:res.headers.get('content-type')||'',location:res.headers.get('location')||'',
      cache:res.headers.get('cache-control')||'',
      body:body?(await res.text()).slice(0,250000):''};
  } catch(e){return {route,status:0,error:String(e?.message||e)};}
}
const norm=(v)=>{try{return decodeURIComponent(new URL(v,host).pathname).replace(/\/+$/u,'')||'/';}catch{return 'INVALID';}};
try{
  let ready=false;
  for(let i=0;i<30;i++){
    if(child.exitCode!==null)throw Error('Wrangler staging exited: '+outputLog.slice(-1200));
    const r=await request('/robots.txt');
    if(r.status===200){ready=true;break;}
    await sleep(500);
  }
  assert.ok(ready,'Staging Worker did not start: '+outputLog.slice(-1000));
  const pages=['/','/about','/contact','/บริการ/รับซื้อโน๊ตบุ๊ค',
    '/บริการ/รับซื้อคอมพิวเตอร์','/บริการ/รับซื้อ-macbook',
    '/บริการ/รับซื้อคอมบริษัท','/บริการ/รับเหมาประมูลอุปกรณ์ไอที',
    '/พื้นที่ให้บริการ/ภูเก็ต','/llms.txt','/robots.txt','/sitemap-index.xml'];
  for(const route of pages){
    const r=await request(route,true);
    const robotsNoindex=/noindex/i.test(r.robots||'');
    report.pages.push({route,status:r.status,robotsNoindex});
    if(r.status!==200||!robotsNoindex) report.failures.push(route+': expected HTTP 200 and staging noindex, got '+r.status+'/'+r.robots);
    if(r.contentType?.includes('text/html')){
      const canonical=r.body.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1];
      const expected='https://amphon.co.th'+(route==='/'?'':route);
      if(canonical!==expected)report.failures.push(route+': canonical mismatch '+canonical+' expected '+expected);
    }
  }
  for(const route of ['/about/','/contact/','/บริการ/รับซื้อโน๊ตบุ๊ค/','/พื้นที่ให้บริการ/ภูเก็ต/']){
    const r=await request(route);
    const match=r.status===308&&norm(r.location)===norm(route);
    report.slash.push({route,status:r.status,match});
    if(!match)report.failures.push(route+': expected trailing slash 308');
  }
  let cursor=0;
  const found=Array(exact.length);
  await Promise.all(Array.from({length:5},async()=>{
    while(cursor<exact.length){
      const i=cursor++,rule=exact[i],r=await request(rule.source);
      const status=rule.statusCode??(rule.permanent?308:307);
      found[i]={route:rule.source,status:r.status,match:r.status===status&&norm(r.location)===norm(rule.destination)};
    }
  }));
  report.redirects={tested:exact.length,passed:found.filter(r=>r.match).length,bad:found.filter(r=>!r.match).slice(0,30)};
  if(report.redirects.bad.length)report.failures.push('Legacy redirects mismatch: '+report.redirects.bad.length);
  for(const route of ['/__amphon_issue54_missing_staging__','/บริการ/__missing54__']){
    const r=await request(route);
    report.errors404.push({route,status:r.status,noindex:/noindex/i.test(r.robots||'')});
    if(r.status!==404||!/noindex/i.test(r.robots||''))report.failures.push(route+': 404/noindex mismatch');
  }
  const api=await request('/api/google-reviews',true);
  let code='';
  try{const j=JSON.parse(api.body);code=j.error==='not_configured'?'not_configured':'other';}catch{}
  report.api={status:api.status,noindex:/noindex/i.test(api.robots||''),noStore:/no-store/i.test(api.cache||''),errorCode:code};
  if(api.status!==503||code!=='not_configured'||!report.api.noindex||!report.api.noStore)report.failures.push('Local staging API must fail securely without configured secrets');
  console.log(JSON.stringify({pass:report.failures.length===0,worker:report.worker,
    pages:report.pages.length,redirects:report.redirects,slash:report.slash.length,
    missingPages:report.errors404.length,api:report.api,failures:report.failures},null,2));
  assert.equal(report.failures.length,0,report.failures.join('\n'));
}finally{
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  child.kill('SIGTERM');
  await sleep(450);
  if(child.exitCode===null)child.kill('SIGKILL');
  child.stdout.destroy();
  child.stderr.destroy();
}
