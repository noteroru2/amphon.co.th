/**
 * NO MUTATION: snapshot DNS answers, TLS and active Vercel endpoints.
 * Never writes Cloudflare DNS or Worker routes and never calls a deploy API.
 * Source of truth for record type/proxy/TTL remains Cloudflare Zone Dashboard;
 * public DNS may flatten CNAMEs and Vercel's API may report A records.
 */
import dns from 'node:dns/promises';
import tls from 'node:tls';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const apex='amphon.co.th',www='www.amphon.co.th',stage='cf-test.amphon.co.th';
const outFile='artifacts/cloudflare-migration/precutover-readonly-dns.json';
const report={observedAt:new Date().toISOString(),approvedCutover:false,domains:{},http:{},errors:[],warnings:[]};

async function lookup(fn,...args){
  try{return await fn(...args);}catch(e){return {error:e.code||e.message};}
}
async function request(host,route,body=false){
  try{
    const r=await fetch(new URL(route,'https://'+host),{redirect:'manual',signal:AbortSignal.timeout(15000)});
    const text=body?(await r.text()).slice(0,160000):'';
    return {status:r.status,robots:r.headers.get('x-robots-tag')||'',location:r.headers.get('location')||'',
      contentType:r.headers.get('content-type')||'',cacheControl:r.headers.get('cache-control')||'',body:text};
  }catch(e){return {status:0,error:String(e?.message||e)};}
}
async function inspectTls(host){
  return new Promise((resolve,reject)=>{
    const socket=tls.connect({host,port:443,servername:host,rejectUnauthorized:true,timeout:10000},()=>{
      const cert=socket.getPeerCertificate();
      const result={valid:true,authorized:socket.authorized,validTo:cert.valid_to||null,
        subjectAltName:cert.subjectaltname||null,issuer:cert.issuer?.O||null};
      socket.end();resolve(result);
    });
    socket.once('error',reject);
    socket.once('timeout',()=>{socket.destroy();reject(new Error('TLS timeout'));});
  });
}
try{
  const hosts=[apex,www,stage];
  await Promise.all(hosts.map(async host=>{
    report.domains[host]={
      A:await lookup(dns.resolve4,host,{ttl:true}),
      AAAA:await lookup(dns.resolve6,host,{ttl:true}),
      CNAME:await lookup(dns.resolveCname,host),
      TLS:await inspectTls(host).catch(e=>({valid:false,error:e.message})),
    };
  }));
  report.authoritativeNameservers=await lookup(dns.resolveNs,apex);
  const [root,redirect,staging,api]=await Promise.all([
    request(apex,'/',true),request(www,'/about?utm_source=amphon-cutover-preflight'),
    request(stage,'/',true),request(stage,'/api/google-reviews',true),
  ]);
  const canonical=(html)=>html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1]||null;
  report.http.apex={status:root.status,robots:root.robots,canonical:canonical(root.body)};
  report.http.www={status:redirect.status,location:redirect.location};
  report.http.staging={status:staging.status,robots:staging.robots,canonical:canonical(staging.body)};
  let reviews;
  try{
    const j=JSON.parse(api.body||'');
    if(api.status===200){
      reviews={valid:typeof j.businessName==='string'&&Number.isInteger(j.reviewCount)&&Array.isArray(j.reviews),
        rating:j.rating,reviewCount:j.reviewCount};
    }else{
      // ONLY a whitelisted PUBLIC error identifier, NEVER body, place_id,
      // key, review author/text or arbitrary upstream response.
      const allowed=new Set(['not_configured','upstream_error','upstream_timeout',
        'quota_exceeded','access_denied','network_error','invalid_place']);
      reviews={valid:false,publicErrorCode:allowed.has(j.error)?j.error:'unknown_failure'};
    }
  }catch{reviews={valid:false,publicErrorCode:api.status===0?'network_error':'non_json_failure'};}
  report.http.stagingApi={status:api.status,robots:api.robots,cacheControl:api.cacheControl,...reviews};

  if(root.status!==200||/noindex/i.test(root.robots)||!String(report.http.apex.canonical).startsWith('https://amphon.co.th'))
    report.errors.push('Vercel apex is not 200/indexable/canonical');
  if(redirect.status!==301||redirect.location!=='https://amphon.co.th/about?utm_source=amphon-cutover-preflight')
    report.errors.push('Current www→apex 301/path/query has changed');
  if(staging.status!==200||!/noindex/i.test(staging.robots))
    report.errors.push('Staging site is not 200/noindex');
  if(api.status!==200||!reviews.valid||!/no-store/i.test(api.cacheControl))
    report.errors.push('Staging Google Reviews API not valid');
  if(hosts.some(host=>report.domains[host].TLS.valid!==true))
    report.errors.push('One of current hostname TLS checks failed');
  if(!Array.isArray(report.authoritativeNameservers)||!report.authoritativeNameservers.every(x=>x.includes('cloudflare.com')))
    report.warnings.push('Nameservers need Cloudflare zone/dashboard confirmation');
  report.warnings.push('Public DNS cannot prove Cloudflare proxied flag/record ID, validate dashboard snapshot before change.');
  console.log(JSON.stringify({pass:report.errors.length===0,observedAt:report.observedAt,
    authoritativeNameservers:report.authoritativeNameservers,domains:report.domains,
    http:report.http,errors:report.errors,warnings:report.warnings},null,2));
  assert.equal(report.errors.length,0,report.errors.join('\n'));
}finally{
  fs.mkdirSync(path.dirname(outFile),{recursive:true});
  fs.writeFileSync(outFile,JSON.stringify(report,null,2)+'\n');
}
