import fs from 'node:fs';
import assert from 'node:assert/strict';

const origin = 'https://amphon-co-th.noteroru2.workers.dev';
const cfg = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const exact = cfg.redirects.filter(x => x.source !== '/:path+/');

const out = { inspectedAt: new Date().toISOString(), origin, pages: [], slash: [], redirects: { tested: 0, passed: 0, mismatches: [] }, api: null, errors: [] };
async function request(route, body = false) {
  try {
    const res = await fetch(new URL(route, origin), {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'AMPHON-Cloudflare-Live-Preview-QA/1.0' },
    });
    return {
      status: res.status,
      location: res.headers.get('location') || '',
      robots: res.headers.get('x-robots-tag') || '',
      cache: res.headers.get('cache-control') || '',
      type: res.headers.get('content-type') || '',
      body: body ? (await res.text()).slice(0, 300000) : '',
    };
  } catch (e) { return { status: 0, error: String(e?.message || e) }; }
}
const normalize = v => {
  try {return decodeURIComponent(new URL(v, origin).pathname).replace(/\/+$/u, '') || '/';}
  catch{return 'INVALID';}
};
for (const route of ['/', '/about', '/contact', '/บริการ/รับซื้อโน๊ตบุ๊ค', '/บริการ/รับซื้อคอมพิวเตอร์', '/บริการ/รับซื้อ-macbook', '/robots.txt', '/llms.txt', '/sitemap-index.xml']) {
  const r=await request(route,true);
  const okStatus=r.status===200;
  const okNoindex=(r.robots||'').toLowerCase().includes('noindex');
  const canonical=(r.body||'').match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1]||'';
  const expectedCanonical = route === '/' ? 'https://amphon.co.th' : 'https://amphon.co.th'+route;
  const html=r.type.includes('text/html');
  const okCanonical=!html || canonical===expectedCanonical;
  out.pages.push({route,status:r.status,robots:r.robots,canonical:canonical||null,okStatus,okNoindex,okCanonical,error:r.error||null});
  if(!okStatus||!okNoindex||!okCanonical)out.errors.push('page '+route+' status/noindex/canonical mismatch');
}
for(const route of ['/about/','/contact/','/บริการ/รับซื้อโน๊ตบุ๊ค/','/บริการ/รับซื้อคอมพิวเตอร์/']){
 const r=await request(route);
 const match=r.status===308&&normalize(r.location)===normalize(route.slice(0,-1));
 out.slash.push({route,status:r.status,location:r.location,match,error:r.error||null});
 if(!match)out.errors.push('trailing-slash mismatch '+route);
}
const items=Array(exact.length);let cursor=0;
await Promise.all(Array.from({length:4},async()=>{
 while(cursor<exact.length){
  const i=cursor++;
  const e=exact[i];
  const r=await request(e.source);
  const expected=e.statusCode??(e.permanent?308:307);
  const match=r.status===expected && Boolean(r.location) && normalize(r.location)===normalize(e.destination);
  items[i]={route:e.source,actualStatus:r.status,expectedStatus:expected,actualLocation:r.location,expectedLocation:e.destination,match,error:r.error||null};
 }
}));
out.redirects={tested:exact.length,passed:items.filter(x=>x.match).length,mismatches:items.filter(x=>!x.match)};
if(out.redirects.mismatches.length)out.errors.push(out.redirects.mismatches.length+' legacy redirect mismatches');
const api=await request('/api/google-reviews',true);
out.api={status:api.status,robots:api.robots,cache:api.cache,type:api.type,unconfigured:api.body.includes('not_configured'),error:api.error||null};
const validGoogleReviews200 = (() => {
  if (api.status !== 200) return false;
  try {
    const data = JSON.parse(api.body);
    return typeof data.businessName === 'string' && data.businessName.trim().length > 0
      && typeof data.rating === 'number' && data.rating >= 0 && data.rating <= 5
      && Number.isInteger(data.reviewCount) && data.reviewCount >= 0
      && Array.isArray(data.reviews);
  } catch { return false; }
})();
// A public error code is safe to report; NEVER copy Google Reviews JSON,
// user content, API keys or Place IDs into CI artifacts/logs.
let errorCode = '';
if (api.status !== 200) {
  try {
    const body = JSON.parse(api.body);
    const allowed = new Set([
      'not_configured', 'access_denied', 'quota_exceeded',
      'upstream_error', 'upstream_timeout', 'network_error',
      'malformed_response', 'invalid_place',
    ]);
    errorCode = allowed.has(body.error) ? body.error : 'unknown_http_error';
  } catch { errorCode = api.status ? 'non_json_http_error' : 'network_error'; }
}
out.api = { status: api.status, robots: api.robots, cache: api.cache, type: api.type,
  validGoogleReviews200, errorCode, error: api.error || null };
if(!validGoogleReviews200||!api.cache.includes('no-store')||!api.robots.includes('noindex')) {
  out.errors.push('Google Reviews live API not HTTP 200/valid Google data/no-store/noindex');
}
fs.mkdirSync('artifacts/cloudflare-migration',{recursive:true});
fs.writeFileSync('artifacts/cloudflare-migration/live-preview-http-qa.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({origin,pass:out.errors.length===0,pages:out.pages,slash:out.slash,redirects:{tested:out.redirects.tested,passed:out.redirects.passed,mismatches:out.redirects.mismatches.slice(0,20)},api:out.api,errors:out.errors},null,2));
assert.equal(out.errors.length,0,out.errors.join('\n'));
