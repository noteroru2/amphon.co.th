#!/usr/bin/env node
// Authorized AMPHON 2-stage release. Runs only on owner's authenticated PC.
// Builds exact reviewed SHA in isolated git worktrees. NEVER touches DNS,
// other Workers, GitHub main, Vercel, or displays Cloudflare tokens.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ACCOUNT='2382f4589cd2452e9e3b7b83c25d4fc0';
const ZONE='a30f34d72af28e9df1e369a45a4c8a16';
const WORKER='amphon-co-th-production';
const SESSION_KV='2e5195ef3f3b4557bd50776e1d492154';
const INITIAL_VERSION='e231e3ce-7016-49cb-9882-403c666debe4';
const HOURS_SHA='5d4bf2541e0ef1b06e2c1d33a7b4b36fafbbc465';
const SEO_SHA='8835065fca73934917bf816bf77d2376b3547efc';
const EXPLICIT=process.argv.includes('--execute');
const TOKEN=process.env.CLOUDFLARE_API_TOKEN;
const API='https://api.cloudflare.com/client/v4';
const scriptPath='/accounts/'+ACCOUNT+'/workers/scripts/'+WORKER;
const deployPath=scriptPath+'/deployments';
const releaseLog=[];

function run(exe,args,cwd,{silent=false}={}) {
  // Windows cannot reliably execFile() a .cmd shim without cmd.exe.
  const cmdShim=process.platform==='win32'&&['npm','npx'].includes(exe);
  const cmd=cmdShim?'cmd.exe':exe;
  const cmdArgs=cmdShim?['/d','/s','/c',[exe,...args.map(a=>'"'+String(a).replaceAll('"','')+'"')].join(' ')]:args;
  if(!silent) console.log('EXEC',exe,args.join(' '));
  try {
    return execFileSync(cmd,cmdArgs,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:48*1024*1024,windowsHide:true}).trim();
  } catch(e) {
    const tail=String(e.stderr||e.message||'').slice(-1300);
    throw new Error(exe+' failed: '+tail);
  }
}
async function cf(route,method='GET',body) {
  assert.ok(TOKEN,'Cloudflare token unavailable on this PC process. Never paste token into chat.');
  const response=await fetch(API+route,{method,headers:{Authorization:'Bearer '+TOKEN,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  if(!response.ok)throw new Error('Cloudflare '+method+' '+route+' returned HTTP '+response.status);
  const json=await response.json();
  assert.ok(json.success,'Cloudflare API returned non-success: '+route);
  return json.result;
}
async function deployedVersion() {
  const x=await cf(deployPath);
  const v=x.deployments?.[0]?.versions;
  assert.equal(v?.length,1,'Production Worker must have a single active version');
  assert.equal(v[0].percentage,100,'Worker currently split across versions');
  return v[0].version_id;
}
async function assertProductionConfig() {
  const [settings,secrets,domains,dns,redirects]=await Promise.all([
    cf(scriptPath+'/settings'),cf(scriptPath+'/secrets'),
    cf('/accounts/'+ACCOUNT+'/workers/domains'),
    cf('/zones/'+ZONE+'/dns_records'),
    cf('/zones/'+ZONE+'/rulesets/phases/http_request_dynamic_redirect/entrypoint')
  ]);
  assert.ok(settings.bindings.some(x=>x.name==='SESSION'&&x.namespace_id===SESSION_KV),'Wrong SESSION KV on active Worker');
  assert.ok(settings.bindings.some(x=>x.name==='ASSETS'&&x.type==='assets'),'Assets binding missing');
  for(const name of ['GOOGLE_PLACE_ID','GOOGLE_PLACES_API_KEY'])assert.ok(secrets.some(s=>s.name===name),'Secret binding missing: '+name);
  assert.ok(domains.some(x=>x.hostname==='amphon.co.th'&&x.service===WORKER&&x.enabled),'Production apex domain not attached to target Worker');
  for(const name of ['amphon.co.th','www.amphon.co.th'])assert.ok(dns.some(x=>x.name===name&&x.proxied),'Production hostname not Cloudflare proxied: '+name);
  assert.ok(redirects.rules.some(x=>x.enabled&&x.action==='redirect'&&x.expression.includes('www.amphon.co.th')&&x.action_parameters?.from_value?.status_code===301&&x.action_parameters?.from_value?.preserve_query_string),'www 301 redirect missing');
}
function assertLocalWrangler(file){
  const cfg=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(cfg.name,WORKER,'Wrong worker in local wrangler.production.json');
  assert.equal(cfg.main,'./dist/server/entry.mjs','Unexpected worker entry module');
  assert.equal(cfg.assets?.directory,'./dist/client','Unexpected build assets path');
  assert.equal(cfg.kv_namespaces?.find(x=>x.binding==='SESSION')?.id,SESSION_KV,'Wrong SESSION KV in local production config');
  assert.equal(cfg.workers_dev,false,'workers_dev must remain off');
  assert.equal(cfg.preview_urls,false,'preview URLs must remain off');
  assert.ok(!cfg.routes&&!cfg.route,'Config must not add or alter domain routes');
}
function candidate(repo,config,sha,label){
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'amphon-'+label+'-'));
  fs.rmdirSync(folder);
  run('git',['worktree','add','--detach',folder,sha],repo,{silent:true});
  assert.equal(run('git',['rev-parse','HEAD'],folder,{silent:true}),sha);
  fs.copyFileSync(config,path.join(folder,'wrangler.production.json'));
  assertLocalWrangler(path.join(folder,'wrangler.production.json'));
  run('npm',['ci','--no-fund'],folder,{silent:true});
  run('npm',['run','test:google-reviews'],folder,{silent:true});
  run('node',['scripts/cloudflare-lock-verify.mjs'],folder,{silent:true});
  run('npx',['astro','build','--config','astro.config.cloudflare.production.mjs'],folder,{silent:true});
  run('npm',['run','validate:seo'],folder,{silent:true});
  run('node',['scripts/cloudflare-release-finalize.mjs'],folder,{silent:true});
  const root=path.join(folder,'dist','client');
  const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(home.includes('09:00–19:00')&&!home.includes('09:00–21:00'),'Built homepage hours wrong');
  const sitemap=fs.readFileSync(path.join(root,'sitemap-0.xml'),'utf8');
  const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  assert.equal(locs.length,1189,'Local sitemap must be exactly 1189 URLs');
  assert.equal(new Set(locs).size,1189,'Duplicate sitemap locations');
  const redirs=fs.readFileSync(path.join(root,'_redirects'),'utf8').split(/\r?\n/).filter(x=>x.startsWith('/'));
  assert.ok(redirs.length>=260,'Less than 260 legacy redirects');
  assert.equal(new Set(redirs.map(x=>x.split(/\s+/)[0])).size,redirs.length,'Duplicate redirect sources');
  const headers=fs.readFileSync(path.join(root,'_headers'),'utf8');
  assert.ok(!/^X-Robots-Tag:.*noindex/im.test(headers),'Global noindex detected');
  if(sha===SEO_SHA){
    run('node',['scripts/check-issue50-rendered-truth.mjs'],folder,{silent:true});
    run('node',['scripts/audit-serviceareas-1020.mjs'],folder,{silent:true});
    const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
    assert.ok(!/User-agent: GPTBot\s*\nAllow:\s*\//i.test(robots),'Origin robots still contradicts Cloudflare training policy');
  }
  run('npx',['wrangler','deploy','--config','wrangler.production.json','--dry-run'],folder,{silent:true});
  console.log('LOCAL_QA_PASS',label,sha,'sitemap=',locs.length,'redirects=',redirs.length);
  return folder;
}
async function smoke(label) {
  const request=async (url,redirect='follow')=>fetch(url,{redirect,headers:{'User-Agent':'AMPHON-owner-release-qa'}});
  const homepage=await request('https://amphon.co.th/');
  assert.equal(homepage.status,200,'Homepage HTTP '+homepage.status);
  const html=await homepage.text();
  assert.ok(html.includes('09:00–19:00')&&!html.includes('09:00–21:00'),'Storefront hours mismatch');
  assert.ok(html.includes('line.me/ti/p/~@webuy'),'LINE CTA missing');
  assert.ok(!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html),'Homepage noindex');
  const www=await request('https://www.amphon.co.th/%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A?utm_source=qa','manual');
  assert.equal(www.status,301,'www must return 301');
  assert.ok((www.headers.get('location')||'').startsWith('https://amphon.co.th/')&&(www.headers.get('location')||'').includes('utm_source=qa'),'www path/query lost');
  const xml=await request('https://amphon.co.th/sitemap-0.xml');
  assert.equal(xml.status,200,'Sitemap not 200');
  const urls=[...(await xml.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  assert.equal(urls.length,1189,'Live sitemap count changed');
  let reviewOK=false;
  for(let i=0;i<3;i++){
    const reviews=await request('https://amphon.co.th/api/google-reviews');
    if(reviews.status===200&&(reviews.headers.get('cache-control')||'').includes('no-store')){reviewOK=true;break}
  }
  assert.ok(reviewOK,'Google Reviews API not consistently returning 200');
  for(const suffix of ['/about','/contact','/บริการ/รับซื้อโน๊ตบุ๊ค','/บริการ/รับซื้อคอมพิวเตอร์','/บริการ/รับซื้อ-macbook']){
    const x=await request('https://amphon.co.th'+suffix);
    assert.equal(x.status,200,'Critical URL fails: '+suffix);
    assert.ok(!/noindex/i.test(x.headers.get('x-robots-tag')||''),'Critical URL noindex: '+suffix);
  }
  const missing=await request('https://amphon.co.th/__owner_cutover_404_check__');
  assert.equal(missing.status,404,'Missing route should return 404');
  if(label==='SEO_INTEGRATION'){
    const robots=await request('https://amphon.co.th/robots.txt');
    assert.equal(robots.status,200);
    const t=await robots.text();
    for(const bot of ['GPTBot','ClaudeBot','CCBot','Google-Extended'])assert.ok(!new RegExp('User-agent: '+bot+'\\s*\\nAllow:\\s*/','i').test(t),'Training robots contradiction for '+bot);
    const area=await request('https://amphon.co.th/รับซื้อ/รับซื้อ-server-ศรีสะเกษ');
    assert.equal(area.status,200);
    assert.ok((await area.text()).includes('regional-intake-disclosure'),'Updated truthful service-area disclosure missing');
  }
}
async function rollback(version){
  console.error('ROLLING BACK to exact previous Worker version',version);
  await cf(deployPath,'POST',{strategy:'percentage',versions:[{version_id:version,percentage:100}],annotations:{'workers/message':'AMPHON automatic rollback after failed smoke test'}});
  assert.equal(await deployedVersion(),version,'CRITICAL: rollback did not restore intended version');
}
async function main() {
  const repo=run('git',['rev-parse','--show-toplevel'],process.cwd(),{silent:true});
  const config=path.resolve(process.env.AMPHON_PRODUCTION_WRANGLER||path.join(repo,'wrangler.production.json'));
  assert.ok(fs.existsSync(config),'Original private wrangler.production.json missing. Set AMPHON_PRODUCTION_WRANGLER to its existing path. DO NOT invent configuration.');
  assertLocalWrangler(config);
  await assertProductionConfig();
  assert.equal(await deployedVersion(),INITIAL_VERSION,'Production Worker version changed; stop before overwriting another release');
  console.log('PREFLIGHT_PASS. Frozen source SHAs:',HOURS_SHA,SEO_SHA);
  if(!EXPLICIT){console.log('Read-only check only. To run authorized two-stage release use: node scripts/deploy-amphon-two-stages.mjs --execute');return}
  run('git',['fetch','origin','hotfix/cloudflare-store-hours-20261115','integration/cloudflare-issue50-180-20261116'],repo,{silent:true});
  for(const [label,sha] of [['HOURS',HOURS_SHA],['SEO_INTEGRATION',SEO_SHA]]){
    const previous=await deployedVersion();
    console.log('BUILDING',label,sha);
    const folder=candidate(repo,config,sha,label);
    await assertProductionConfig();
    assert.equal(await deployedVersion(),previous,'Worker changed during build; abort');
    console.log('DEPLOYING',label,'SHA',sha);
    let attempted=false;
    try {
      attempted=true;
      run('npx',['wrangler','deploy','--config','wrangler.production.json','--keep-vars'],folder,{silent:true});
      const after=await deployedVersion();
      assert.notEqual(after,previous,'No new Worker version was activated');
      await assertProductionConfig();
      await smoke(label);
      const record={status:'PASS',stage:label,source_sha:sha,worker:WORKER,previous_version:previous,deployed_version:after,checked_utc:new Date().toISOString()};
      releaseLog.push(record);
      console.log('PRODUCTION_STAGE_PASS',JSON.stringify(record));
    } catch(error) {
      console.error('DEPLOYMENT_SMOKE_FAILED',label,String(error.message).slice(0,1000));
      if(attempted){
        try {if(await deployedVersion()!==previous)await rollback(previous)}catch(e){console.error('CRITICAL_ROLLBACK_FAILED',e.message);process.exitCode=2}
      }
      throw error;
    }
  }
  const file=path.join(repo,'amphon-two-stage-deploy-result-'+new Date().toISOString().slice(0,10)+'.json');
  fs.writeFileSync(file,JSON.stringify({success:true,releases:releaseLog},null,2)+'\n');
  console.log('BOTH_DEPLOYS_CONFIRMED',file,'Do NOT revoke token before postdeploy checks finish.');
}
main().catch(e=>{console.error('CUTOVER_BLOCKED_OR_ROLLED_BACK:',e.message);process.exitCode ||= 1});
