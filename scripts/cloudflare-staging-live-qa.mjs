/**
 * Read-only acceptance of the independent cf-test.amphon.co.th Worker.
 * Run ONLY after Owner has connected custom domain, SSL and runtime secrets.
 * Never fetches or logs a secret. Never changes Cloudflare or DNS.
 */
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';
import assert from 'node:assert/strict';

// Default to the final staging custom domain. Allow only the isolated
// Workers.dev staging hostname for pre-domain smoke tests.
const HOST=process.env.STAGING_HOST||'cf-test.amphon.co.th';
const ALLOWED_HOSTS=new Set(['cf-test.amphon.co.th','amphon-co-th-staging.noteroru2.workers.dev']);
if(!ALLOWED_HOSTS.has(HOST))throw Error('Refusing to inspect non-staging host: '+HOST);
const API_MUST_BE_CONFIGURED=process.env.STAGING_API_EXPECT_CONFIGURED!=='false';
const BASE='https://'+HOST;
const CANON='https://amphon.co.th';
const OUT='artifacts/cloudflare-migration/live-staging-acceptance.json';
const cfg=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const exact=cfg.redirects.filter(r=>r.source!=='/:path+/');
const report={checkedAt:new Date().toISOString(),staging:BASE,mode:'read-only',
  tls:null,sitemap:null,pages:{tested:0,passed:0,failed:[]},
  redirects:{tested:0,passed:0,bad:[]},slash:[],notFound:[],
  api:null,productionWww301:null,errors:[]};

function safePath(url){try{return decodeURIComponent(new URL(url,BASE).pathname).replace(/\/+$/u,'')||'/';}catch{return 'INVALID';}}
async function request(host,route,body=false) {
  try {
    const res=await fetch(new URL(route,host),{
      redirect:'manual',signal:AbortSignal.timeout(15000),
      headers:{'User-Agent':'AMPHON-Issue54-Staging-Acceptance/1.0'}
    });
    return {status:res.status,location:res.headers.get('location')||'',
      robots:res.headers.get('x-robots-tag')||'',
      cache:res.headers.get('cache-control')||'',
      type:res.headers.get('content-type')||'',
      body:body?(await res.text()).slice(0,5000000):''};
  }catch(error){return {status:0,error:String(error?.message||error)};}
}
async function inspectTls() {
  return await new Promise((resolve,reject)=>{
    const socket=tls.connect({host:HOST,port:443,servername:HOST,rejectUnauthorized:true,timeout:12000},
      ()=>{const c=socket.getPeerCertificate();const result={
        hostname:HOST,authorized:socket.authorized,
        validTo:c.valid_to||null,subjectAltName:c.subjectaltname||null,
        issuerOrganization:c.issuer?.O||null
      };socket.end();resolve(result);});
    socket.on('error',reject);
    socket.on('timeout',()=>{socket.destroy();reject(Error('TLS handshake timeout'));});
  });
}
function locs(xml){return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/giu)]
  .map(m=>m[1].trim().replaceAll('&amp;','&'));}
try{
  assert.equal(new URL(BASE).hostname,HOST);
  const cert=await inspectTls();
  report.tls=cert;
  assert.equal(cert.authorized,true,'Staging TLS certificate not trusted');

  const index=await request(BASE,'/sitemap-index.xml',true);
  if(index.status!==200)report.errors.push('Staging sitemap-index.xml expected 200 got '+index.status);
  const idxLocs=locs(index.body);
  if(!idxLocs.some(x=>x===CANON+'/sitemap-0.xml')) report.errors.push('Staging sitemap index must use canonical production domain');
  const [stageMap,prodMap]=await Promise.all([
    request(BASE,'/sitemap-0.xml',true),
    request(CANON,'/sitemap-0.xml',true),
  ]);
  const st=locs(stageMap.body),pr=locs(prodMap.body);
  report.sitemap={stageStatus:stageMap.status,productionStatus:prodMap.status,
    stageUrls:st.length,productionUrls:pr.length,
    missing:pr.filter(u=>!st.includes(u)).slice(0,20),
    extra:st.filter(u=>!pr.includes(u)).slice(0,20)};
  if(stageMap.status!==200||prodMap.status!==200||st.length<1000||st.length!==pr.length
    ||report.sitemap.missing.length||report.sitemap.extra.length){
    report.errors.push('Staging sitemap does not match Production URL set');
  }

  const pathSet=new Set(['/', '/about','/contact','/robots.txt','/llms.txt',
    '/บริการ/รับซื้อโน๊ตบุ๊ค','/บริการ/รับซื้อคอมบริษัท',
    '/บริการ/รับเหมาประมูลอุปกรณ์ไอที','/พื้นที่ให้บริการ/ภูเก็ต']);
  for(const loc of st){try{pathSet.add(new URL(loc).pathname);}catch{}}
  const routes=[...pathSet];
  let cursor=0;const checked=Array(routes.length);
  await Promise.all(Array.from({length:7},async()=>{
    while(cursor<routes.length){
      const i=cursor++,route=routes[i];
      const r=await request(BASE,route,true);
      const okNoindex=/\bnoindex\b/i.test(r.robots||'');
      const canonical=r.type?.includes('text/html')
        ? r.body.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1] : null;
      const expected=CANON+(route==='/'?'':decodeURIComponent(route));
      const okCanonical=!r.type?.includes('text/html')||canonical===expected;
      const ok=r.status===200 && okNoindex && okCanonical;
      checked[i]={route,status:r.status,noindex:okNoindex,canonicalOk:okCanonical,ok};
    }
  }));
  report.pages={tested:routes.length,passed:checked.filter(x=>x.ok).length,
    failed:checked.filter(x=>!x.ok).slice(0,25)};
  if(report.pages.passed!==report.pages.tested)report.errors.push('Some staging pages are not 200/noindex/canonical');

  cursor=0;const red=Array(exact.length);
  await Promise.all(Array.from({length:6},async()=>{
    while(cursor<exact.length){
      const i=cursor++,rule=exact[i],r=await request(BASE,rule.source);
      const expected=rule.statusCode??(rule.permanent?308:307);
      red[i]={route:rule.source,got:r.status,ok:r.status===expected&&safePath(r.location)===safePath(rule.destination)};
    }
  }));
  report.redirects={tested:exact.length,passed:red.filter(x=>x.ok).length,bad:red.filter(x=>!x.ok).slice(0,25)};
  if(report.redirects.passed!==260)report.errors.push('Staging has mismatched exact legacy redirects');

  for(const route of ['/about/','/contact/','/บริการ/รับซื้อโน๊ตบุ๊ค/']){
    const r=await request(BASE,route);
    const ok=r.status===308&&safePath(r.location)===safePath(route);
    report.slash.push({route,status:r.status,ok});
    if(!ok)report.errors.push('Staging trailing slash mismatch '+route);
  }
  for(const route of ['/__amphon_staging_missing_54__','/บริการ/__missing_54__']){
    const r=await request(BASE,route);
    const ok=r.status===404&&/noindex/i.test(r.robots||'');
    report.notFound.push({route,status:r.status,ok});
    if(!ok)report.errors.push('Staging 404 noindex mismatch '+route);
  }

  const api=await request(BASE,'/api/google-reviews',true);
  let valid=false,publicData=null;
  if(api.status===200){
    try{
      const j=JSON.parse(api.body);
      valid=typeof j.businessName==='string'&&j.businessName.trim().length>0
        &&typeof j.rating==='number'&&Number.isInteger(j.reviewCount)
        &&Array.isArray(j.reviews);
      publicData=valid?{rating:j.rating,reviewCount:j.reviewCount,reviews:j.reviews.length}:null;
    }catch{}
  }
  // NEVER log the API body, review text, API key or Place ID.
  // Before runtime Secrets are configured on the NEW staging Worker, its
  // fail-closed 503 not_configured response is expected. This is NOT a GO
  // signal for custom-domain or production cutover. The cf-test gate still
  // requires real Google Places HTTP 200 valid public data.
  let unconfigured=false;
  if(api.status===503){
    try{unconfigured=JSON.parse(api.body).error==='not_configured';}catch{}
  }
  report.api={status:api.status,valid,noindex:/noindex/i.test(api.robots||''),
    noStore:/no-store/i.test(api.cache||''),publicData,unconfigured,
    configuredRequired:API_MUST_BE_CONFIGURED};
  const apiPass=API_MUST_BE_CONFIGURED ? api.status===200&&valid :
    (api.status===200&&valid)||(api.status===503&&unconfigured);
  if(!apiPass||!report.api.noindex||!report.api.noStore)
    report.errors.push('Staging Google Reviews API contract failed: status/no-store/noindex');

  const www=await request('https://www.amphon.co.th','/about?utm_source=cf-staging-qa');
  let location=null,ok=false;
  try{
    location=new URL(www.location,'https://www.amphon.co.th');
    ok=www.status===301 && location.protocol==='https:'
      &&location.hostname==='amphon.co.th' &&location.pathname==='/about'
      &&location.searchParams.get('utm_source')==='cf-staging-qa';
  }catch{}
  report.productionWww301={status:www.status,ok,verifiedOn:'CURRENT VERCEL ONLY; NOT Cloudflare custom domain'};
  if(!ok)report.errors.push('Current Vercel www to apex 301 is not preserving path/query');

  console.log(JSON.stringify({pass:report.errors.length===0,tls:report.tls,
    sitemap:report.sitemap,pages:report.pages,
    redirects:report.redirects,slash:report.slash,notFound:report.notFound,
    api:report.api,productionWww301:report.productionWww301,errors:report.errors},null,2));
  assert.equal(report.errors.length,0,report.errors.join('\n'));
}finally{
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n','utf8');
}
