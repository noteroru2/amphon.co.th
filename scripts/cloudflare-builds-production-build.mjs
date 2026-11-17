/**
 * AMPHON Cloudflare Workers Builds production artifact preparation.
 * Run from a pinned Git checkout using:
 *   npm ci && node scripts/cloudflare-builds-production-build.mjs
 * Produces an isolated Worker config; never deploys or modifies DNS.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const PRODUCTION_BRANCH='release/cloudflare-production';
const WORKER='amphon-co-th-production';
const ACCOUNT='2382f4589cd2452e9e3b7b83c25d4fc0';
const SESSION_KV='2e5195ef3f3b4557bd50776e1d492154';
const BUILD_CONFIG='dist/server/wrangler.json';
const PRODUCTION_CONFIG='dist/server/wrangler.production.json';
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.match(sha,/^[a-f0-9]{40}$/);
const reportedBranch=process.env.CF_BRANCH||process.env.CLOUDFLARE_BUILD_BRANCH||'';
if(reportedBranch) assert.equal(reportedBranch,PRODUCTION_BRANCH,'Reject build for unexpected production branch');

function run(exe,args){
  console.log('AMPHON QA:',exe,args.join(' '));
  execFileSync(exe,args,{stdio:'inherit',maxBuffer:64*1024*1024});
}
run('node',['scripts/cloudflare-lock-verify.mjs']);
run('npm',['run','test:google-reviews']);
run('node',['--test','scripts/cloudflare-routing.test.mjs','scripts/cloudflare-release-finalize.test.mjs']);
run('npm',['exec','--','astro','build','--config','astro.config.cloudflare.production.mjs']);
run('npm',['run','validate:seo']);
run('node',['scripts/cloudflare-release-finalize.mjs']);
run('node',['scripts/check-issue50-rendered-truth.mjs']);
run('node',['scripts/audit-serviceareas-1020.mjs']);

const generated=JSON.parse(fs.readFileSync(BUILD_CONFIG,'utf8'));
assert.equal(generated.name,'amphon-co-th-rc-audit','Astro generated an unexpected Worker name');
assert.ok(generated.main,'Cloudflare generated Worker entrypoint missing');
assert.ok(generated.assets?.directory,'Cloudflare static asset directory missing');
assert.equal(generated.assets.binding,'ASSETS','Cloudflare ASSETS binding changed');
assert.ok(!(generated.kv_namespaces||[]).some(x=>x.binding==='SESSION'&&x.id),'Audit build cannot bind to an existing SESSION KV');
assert.ok(!generated.routes&&!generated.route,'Generated artifact must not change custom routes');
const codeFile=path.resolve(path.dirname(BUILD_CONFIG),generated.main);
assert.ok(fs.existsSync(codeFile),'Worker entry module missing: '+codeFile);
const assetsDir=path.resolve(path.dirname(BUILD_CONFIG),generated.assets.directory);
assert.ok(fs.existsSync(assetsDir),'Cloudflare assets path missing: '+assetsDir);
assert.equal(generated.compatibility_date,'2026-11-10','Unexpected compatibility date');
assert.ok(generated.compatibility_flags?.includes('nodejs_compat'),'nodejs_compat missing');
assert.ok(generated.compatibility_flags?.includes('global_fetch_strictly_public'),'global_fetch_strictly_public missing');

// Same config directory: preserve the adapter-generated relative paths and
// asset-routing settings. Never add routes, DNS, secrets, or access policies.
const prod={
  ...generated,
  name:WORKER,
  account_id:ACCOUNT,
  kv_namespaces:[...(generated.kv_namespaces||[]).filter(x=>x.binding!=='SESSION'),{binding:'SESSION',id:SESSION_KV}],
  keep_vars:true,
  workers_dev:false,
  preview_urls:false,
  observability:generated.observability||{enabled:true},
};
delete prod.route;
delete prod.routes;
fs.writeFileSync(PRODUCTION_CONFIG,JSON.stringify(prod,null,2)+'\n','utf8');
const homepage=fs.readFileSync('dist/client/index.html','utf8');
assert.ok(homepage.includes('09:00–19:00')&&!homepage.includes('09:00–21:00'),'Storefront hours incorrect');
assert.ok(homepage.includes('line.me/ti/p/~@webuy'),'LINE CTA missing from homepage');
const sitemap=fs.readFileSync('dist/client/sitemap-0.xml','utf8');
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(locs.length,1189,'Sitemap count regression');
assert.equal(new Set(locs).size,1189,'Sitemap duplicate');
const redirects=fs.readFileSync('dist/client/_redirects','utf8').split(/\r?\n/).filter(x=>x.startsWith('/'));
assert.ok(redirects.length>=261,'Missing legacy redirect rules');
const origins=new Set(redirects.map(x=>x.split(/\s+/)[0]));
assert.equal(origins.size,redirects.length,'Duplicate legacy redirects');
const head=fs.readFileSync('dist/client/_headers','utf8');
assert.doesNotMatch(head,/^\s*X-Robots-Tag:.*noindex/im,'Global noindex not allowed');
const robots=fs.readFileSync('dist/client/robots.txt','utf8');
for(const bot of ['Googlebot','Bingbot','OAI-SearchBot'])assert.ok(robots.includes('User-agent: '+bot),'Missing search bot: '+bot);
for(const bot of ['GPTBot','ClaudeBot','CCBot','Google-Extended'])
  assert.ok(!new RegExp('User-agent: '+bot+'\\s*\\nAllow:\\s*/','i').test(robots),'Origin robots contradicts Cloudflare Training policy: '+bot);
console.log('AMPHON_CLOUDFLARE_BUILD_QA_PASS',JSON.stringify({
  tested_sha:sha,worker:WORKER,generated_config:PRODUCTION_CONFIG,
  sitemap:locs.length,redirects:redirects.length,serviceAreas:921,
  storefront:'09:00-19:00',auto_deployed:false
}));
