/**
 * Cloudflare Workers Builds deploy command, production branch only.
 * Run AFTER scripts/cloudflare-builds-production-build.mjs has passed QA.
 * No DNS, domain binding, or GitHub branch mutation.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';

const NAME='amphon-co-th-production';
const CONFIG='dist/server/wrangler.production.json';
const SHA=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.match(SHA,/^[0-9a-f]{40}$/,'Checkout must have a complete immutable Git SHA');
const branch=process.env.CF_BRANCH||process.env.CLOUDFLARE_BUILD_BRANCH||'';
if(branch)assert.equal(branch,'release/cloudflare-production','Stop: unapproved production branch');
const x=JSON.parse(fs.readFileSync(CONFIG,'utf8'));
assert.equal(x.name,NAME,'Refuse deployment to a different Worker');
assert.equal(x.account_id,'2382f4589cd2452e9e3b7b83c25d4fc0','Wrong Cloudflare account');
assert.equal(x.kv_namespaces?.find(y=>y.binding==='SESSION')?.id,'2e5195ef3f3b4557bd50776e1d492154','Production SESSION KV mismatch');
assert.equal(x.assets?.binding,'ASSETS','Cloudflare assets binding missing');
assert.equal(x.keep_vars,true,'Secrets/vars must be preserved on deploy');
assert.equal(x.workers_dev,false,'Worker dev URL must not be newly enabled');
assert.equal(x.preview_urls,false,'Worker preview URLs must stay off');
assert.ok(!x.route&&!x.routes,'Do not modify DNS/route bindings');
const home=fs.readFileSync('dist/client/index.html','utf8');
assert.ok(home.includes('09:00–19:00')&&!home.includes('09:00–21:00'),'Store hours incorrect');
const xml=fs.readFileSync('dist/client/sitemap-0.xml','utf8');
assert.equal([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].length,1189,'Sitemap count unexpectedly changed');
const entryPoint=fs.existsSync('dist/server/entry.mjs');
assert.ok(entryPoint,'Compiled Worker entrypoint missing');
console.log('AMPHON_DEPLOY_GATED',{worker:NAME,source_sha:SHA,mode:'Cloudflare Workers Builds production branch'});

// Wrangler uses the Cloudflare-managed Builds authentication for the existing
// Worker. No plaintext API token is committed or logged.
const wrangler='node_modules/wrangler/bin/wrangler.js';
let deployed=false;
try {
  execFileSync(process.execPath,[wrangler,'deploy','--config',CONFIG,'--keep-vars'],{stdio:'inherit',maxBuffer:64*1024*1024});
  deployed=true;
  const get=async (url,redirect='follow')=>fetch(url,{redirect,headers:{'User-Agent':'AMPHON-Cloudflare-Builds-live-smoke'}});
  let success=false;let last='';
  for(let attempt=0;attempt<4;attempt++){
    try{
      const page=await get('https://amphon.co.th/');
      assert.equal(page.status,200,'Homepage is not HTTP 200');
      const html=await page.text();
      assert.ok(html.includes('09:00–19:00')&&!html.includes('09:00–21:00'),'Storefront hours mismatch after release');
      assert.ok(html.includes('line.me/ti/p/~@webuy'),'LINE CTA missing');
      assert.ok(!/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),'Homepage noindexed');
      const www=await get('https://www.amphon.co.th/%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A?utm_source=build-check','manual');
      assert.equal(www.status,301,'www to apex redirect not 301');
      const dest=www.headers.get('location')||'';
      assert.ok(dest.includes('utm_source=build-check')&&dest.startsWith('https://amphon.co.th/'),'www query/path lost');
      const sitemap=await get('https://amphon.co.th/sitemap-0.xml');
      assert.equal(sitemap.status,200,'Sitemap unavailable');
      assert.equal([...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].length,1189,'Live sitemap count changed');
      const robots=await get('https://amphon.co.th/robots.txt');
      assert.equal(robots.status,200);
      const rob=await robots.text();
      assert.ok(rob.includes('User-agent: Googlebot')&&rob.includes('User-agent: OAI-SearchBot'),'Search bot access missing');
      for(const bot of ['GPTBot','ClaudeBot','CCBot','Google-Extended'])
        assert.ok(!new RegExp('User-agent: '+bot+'\\s*\\nAllow:\\s*/','i').test(rob),'Conflicting Cloudflare managed training policy for '+bot);
      const review=await get('https://amphon.co.th/api/google-reviews');
      assert.equal(review.status,200,'Google Reviews endpoint not HTTP 200');
      assert.ok((review.headers.get('cache-control')||'').includes('no-store'),'Google Reviews caching changed');
      const area=await get('https://amphon.co.th/รับซื้อ/รับซื้อ-server-ศรีสะเกษ');
      assert.equal(area.status,200,'Service area page not 200');
      assert.ok((await area.text()).includes('regional-intake-disclosure'),'Integrated regional disclosure missing on live site');
      success=true;
      break;
    }catch(e){last=String(e.message||e);if(attempt<3)await sleep(3000);}
  }
  if(!success)throw Error('Production live smoke failed after four attempts: '+last);
  console.log('AMPHON_CLOUDFLARE_PRODUCTION_SMOKE_PASS',JSON.stringify({source_sha:SHA,worker:NAME,checked_at_utc:new Date().toISOString(),sitemap_urls:1189}));
} catch(error) {
  console.error('AMPHON_RELEASE_FAILED',String(error?.message||error));
  if(deployed){
    console.error('Production was changed. Trying to restore previous Worker version with Wrangler rollback.');
    try {
      execFileSync(process.execPath,[wrangler,'rollback','--name',NAME,'--message','AMPHON automatic rollback after failing post-release smoke'],{stdio:'inherit',maxBuffer:64*1024*1024});
      console.error('ROLLBACK_COMMAND_COMPLETED; independently verify production before concluding rollback success.');
    }catch(e){
      console.error('CRITICAL: automatic rollback command failed. Open Cloudflare Worker Deployments and immediately restore previous known-good version.');
    }
  }
  process.exitCode=1;
}
