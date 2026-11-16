import assert from 'node:assert/strict';
import fs from 'node:fs';

const ACCOUNT='2382f4589cd2452e9e3b7b83c25d4fc0';
const ZONE='a30f34d72af28e9df1e369a45a4c8a16';
const WORKER='amphon-co-th-production';
const SOURCE_SHA=process.argv[2];
const EXPECTED_VERSION=process.argv[3];
const CHECK_ROBOTS=process.argv.includes('--require-robots-aligned');
const TOKEN=process.env.CLOUDFLARE_API_TOKEN;
assert.match(SOURCE_SHA||'',/^[a-f0-9]{40}$/i,'Need exact reviewed source SHA, 40 hex');
assert.match(EXPECTED_VERSION||'',/^[a-f0-9]{8}-[a-f0-9-]{27,}$/i,'Need exact deployed Cloudflare version UUID');
assert.ok(TOKEN,'Set restricted CLOUDFLARE_API_TOKEN locally; NEVER paste token into logs');
const API='https://api.cloudflare.com/client/v4';

async function readAPI(path) {
  const r=await fetch(API+path,{headers:{Authorization:'Bearer '+TOKEN,Accept:'application/json'},redirect:'error'});
  if(!r.ok)throw new Error('Cloudflare API GET '+path+' failed HTTP '+r.status+' (do not bypass)');
  const d=await r.json();
  if(!d.success)throw new Error('Cloudflare API returned a non-success response for '+path);
  return d.result;
}
async function get(url,mode='follow') {
  const r=await fetch(url,{redirect:mode,headers:{'User-Agent':'AMPHON-owned-post-release-QA/1.0'}});
  return r;
}
const deployments=await readAPI('/accounts/'+ACCOUNT+'/workers/scripts/'+WORKER+'/deployments');
const current=deployments.deployments?.[0];
assert.ok(current,'No Worker deployment found');
assert.ok(current.versions?.some(v=>v.version_id===EXPECTED_VERSION&&v.percentage===100),'WRONG WORKER VERSION: do not call this release successful');
const domains=await readAPI('/accounts/'+ACCOUNT+'/workers/domains');
assert.ok(domains.some(d=>d.hostname==='amphon.co.th'&&d.service===WORKER&&d.enabled),'Production Worker custom domain missing');
const dns=await readAPI('/zones/'+ZONE+'/dns_records');
assert.ok(dns.some(d=>d.name==='amphon.co.th'&&d.proxied),'Apex not Cloudflare proxied');
assert.ok(dns.some(d=>d.name==='www.amphon.co.th'&&d.proxied),'www not Cloudflare proxied');
const redirect=await readAPI('/zones/'+ZONE+'/rulesets/phases/http_request_dynamic_redirect/entrypoint');
assert.ok(redirect.rules?.some(r=>r.enabled&&r.action==='redirect'&&r.expression.includes('www.amphon.co.th')&&r.action_parameters?.from_value?.status_code===301&&r.action_parameters?.from_value?.preserve_query_string===true),'www edge 301 rule missing');

const home=await get('https://amphon.co.th/');
assert.equal(home.status,200,'Homepage must be publicly available');
assert.ok(!/noindex/i.test(home.headers.get('x-robots-tag')||''),'Global X-Robots noindex');
const html=await home.text();
assert.ok(html.includes('09:00–19:00'),'Store hours not correct after deployment');
assert.ok(!html.includes('09:00–21:00'),'Wrong hours still on live homepage');
assert.ok(html.includes('line.me/ti/p/~@webuy'),'LINE CTA missing on live homepage');
assert.ok(!/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),'Home noindex meta');
const www=await get('https://www.amphon.co.th/%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A?utm_source=release-check','manual');
assert.equal(www.status,301,'www must redirect 301 at the edge');
const loc=www.headers.get('location')||'';
assert.ok(loc.startsWith('https://amphon.co.th/%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A'),'Raw encoded path not preserved');
assert.ok(loc.includes('utm_source=release-check'),'Query not preserved');

const sitemapRes=await get('https://amphon.co.th/sitemap-0.xml');
assert.equal(sitemapRes.status,200,'Sitemap unavailable');
const urls=[...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,1189,'Live sitemap changed');
assert.equal(new Set(urls).size,1189,'Duplicate URLs in live sitemap');
const reviews=await get('https://amphon.co.th/api/google-reviews');
assert.equal(reviews.status,200,'Google Reviews API failed');
assert.ok((reviews.headers.get('cache-control')||'').includes('no-store'),'Reviews API is cacheable unexpectedly');
const j=await reviews.json();
assert.ok(Number.isFinite(j.rating)&&Array.isArray(j.reviews),'Reviews API unexpected data shape');
const notfound=await get('https://amphon.co.th/__amphon_post_release_404_check');
assert.equal(notfound.status,404,'Missing URL must return HTTP 404');
const robotsRes=await get('https://amphon.co.th/robots.txt');
assert.equal(robotsRes.status,200,'robots.txt unavailable');
const robots=await robotsRes.text();
assert.ok(robots.includes('User-agent: Googlebot')&&robots.includes('User-agent: OAI-SearchBot'),'Search crawler declarations missing');
if(CHECK_ROBOTS){
  for(const bot of ['GPTBot','ClaudeBot','CCBot','Google-Extended']){
    assert.ok(!new RegExp('User-agent: '+bot+'\\s*\\nAllow:\\s*/','i').test(robots),'Conflicting AI training Allow: '+bot);
  }
}
const output={
  verification:'LIVE_PRODUCTION_QA_PASS',
  source_sha_as_asserted_by_operator:SOURCE_SHA,
  note:'SHA is supplied by operator; Worker API independently verifies deployed version, not source Git SHA. Cross-check release/upload log.',
  worker:WORKER,
  version:EXPECTED_VERSION,
  worker_deployed_at_utc:current.created_on,
  checked_at_utc:new Date().toISOString(),
  checks:{homepage_200:true,www_301_path_query:true,sitemap_1189:true,reviews_200_no_store:true,public_404:true,robots_google_searchbot:true,robots_policy_aligned:CHECK_ROBOTS?'PASS':'NOT_ENFORCED_FOR_HOURS_ONLY'},
  gsc_checkpoints:['2026-11-25','2026-12-02','2026-12-16']
};
fs.mkdirSync('artifacts/cloudflare-release',{recursive:true});
const filename='artifacts/cloudflare-release/live-verification-'+new Date().toISOString().slice(0,10)+'.json';
fs.writeFileSync(filename,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({result:output.verification,worker:WORKER,version:EXPECTED_VERSION,checked_at:output.checked_at_utc,manifest:filename},null,2));
