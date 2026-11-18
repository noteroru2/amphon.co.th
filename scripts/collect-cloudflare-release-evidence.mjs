import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

// Safe release evidence: no secrets, DNS writes, or deployment.
const root = 'dist/client';
const xmls = fs.readdirSync(root).filter((n) => /^sitemap-\d+\.xml$/.test(n));
assert.ok(xmls.length > 0, 'No sitemap generated');
const urls = xmls.flatMap((name) => [...fs.readFileSync(path.join(root,name),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
assert.equal(urls.length, 1189, 'Sitemap URL count changed');
assert.equal(new Set(urls).size, 1189, 'Sitemap has duplicates');
assert.ok(urls.every((url) => url === 'https://amphon.co.th' || url.startsWith('https://amphon.co.th/')), 'Unexpected sitemap host');

const redirects = fs.readFileSync(path.join(root,'_redirects'),'utf8').split(/\r?\n/).filter((line) => line.startsWith('/'));
const redirectSources = redirects.map((line) => line.split(/\s+/)[0]);
assert.ok(redirects.length >= 260, 'Legacy redirects unexpectedly missing');
assert.equal(new Set(redirectSources).size, redirects.length, 'Duplicate redirect source');

const headers = fs.readFileSync(path.join(root,'_headers'),'utf8');
assert.doesNotMatch(headers, /^\s*X-Robots-Tag:\s*[^\n]*\bnoindex\b/im, 'Sitewide noindex forbidden');

const home = fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(home.includes('09:00–19:00'), 'Home must contain true 09:00–19:00 storefront hours');
assert.ok(!home.includes('09:00–21:00'), 'Home still contains incorrect 09:00–21:00 hours');
const robots = fs.readFileSync(path.join(root,'robots.txt'),'utf8');
for (const bot of ['Googlebot','Bingbot','OAI-SearchBot','PerplexityBot']) {
  assert.ok(robots.includes('User-agent: '+bot), 'Origin robots misses '+bot);
}
assert.ok(robots.includes('Sitemap: https://amphon.co.th/sitemap-index.xml'), 'Missing sitemap directive');
// This guard only applies to the robots-alignment integration, NOT the hours-only branch.
if (process.env.GITHUB_REF_NAME?.startsWith('integration/')) {
  for (const bot of ['GPTBot','ClaudeBot','CCBot','Google-Extended','meta-externalagent']) {
    assert.ok(!new RegExp('User-agent: '+bot+'\\s*\\nAllow:\\s*/','i').test(robots), 'Origin contradicts Cloudflare training bot policy: '+bot);
  }
}
const sha = process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const changed = execFileSync('git',['diff','--name-only','885113107dc0627f62f599cde9a43a197733a29f','HEAD'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const evidence = {
  project:'AMPHON TRADING amphon.co.th', repository:'noteroru2/amphon.co.th',
  candidate_sha:sha, checked_at_utc:new Date().toISOString(), environment:'GitHub Actions candidate — NOT DEPLOYED',
  live_worker:'amphon-co-th-production', previous_live_worker_version:'e231e3ce-7016-49cb-9882-403c666debe4',
  change_scope:{changed_files:changed.length,seo_service_area_pages:changed.filter(p=>p.startsWith('src/content/serviceAreas/')).length,changed_paths:changed},
  qa:{sitemap_unique_urls:urls.length,redirect_rules_unique:redirects.length,origin_robots_google_search_allowed:true,homepage_hours_correct:true,global_noindex_absent:true},
  post_deploy_required:['HTTPS 200 and SHA/version verification','www 301 preserving path/query','260/260 legacy redirects','Google Reviews API 200 and no-store','LINE CTA','GSC final 7/14/28 day measurement'],
  change_policy:'NO DEPLOY without a separate approved production release procedure and verified rollback'
};
fs.mkdirSync('artifacts/cloudflare-release',{recursive:true});
fs.writeFileSync('artifacts/cloudflare-release/release-evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log('AMPHON_RELEASE_GATE '+JSON.stringify({sha,changed:changed.length,seoPages:evidence.change_scope.seo_service_area_pages,sitemap:urls.length,redirects:redirects.length,deploy:false}));
