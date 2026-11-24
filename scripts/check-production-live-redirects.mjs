#!/usr/bin/env node
// P10: Public read-only, fixed-origin parity for every original redirect.
// NO DNS, Worker, GitHub release, SQL, or ownership/approval mutation.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const ORIGIN='https://amphon.co.th'
const DYNAMIC_SOURCE='/:path+/'
const DYNAMIC_PROBE='/__amphon_p10_readonly_redirect_probe__/'
const MAX_CONCURRENCY=4

export function expectedRules(source=readFileSync(new URL('../vercel.json',import.meta.url),'utf8')){
  const config=JSON.parse(source)
  assert.ok(Array.isArray(config.redirects),'Missing original redirect registry')
  const rules=config.redirects.filter(r=>r.source!==DYNAMIC_SOURCE)
  assert.equal(rules.length,260,'Original 260 exact redirects must not drift')
  assert.equal(config.redirects.length,261,'Original dynamic redirect must be retained')
  assert.equal(config.redirects.filter(r=>r.source===DYNAMIC_SOURCE).length,1)
  assert.equal(new Set(rules.map(r=>r.source)).size,260,'Duplicate exact redirect origins')
  for(const r of rules)validateRule(r)
  return rules
}
function validateRule(r){
  assert.ok(r && typeof r.source==='string' && /^\/(?!\/)/.test(r.source),'Unsafe source path')
  assert.ok(!/[?#\\]/.test(r.source) && !/[*:{}]/.test(r.source),'Source must be an exact path')
  assert.ok(typeof r.destination==='string' && /^\/(?!\/)/.test(r.destination),'Unsafe redirect target')
  const source=new URL(r.source,ORIGIN),target=new URL(r.destination,ORIGIN)
  assert.equal(source.origin,ORIGIN,'Source escaped fixed origin')
  assert.equal(target.origin,ORIGIN,'Destination escaped fixed origin')
  assert.equal(source.search,'');assert.equal(source.hash,'')
  assert.equal(target.search,'');assert.equal(target.hash,'')
  assert.ok([301,308].includes(r.statusCode??(r.permanent?308:307)),'No temporary redirects expected')
}
function equalUrl(a,b){
  if(!a||!b)return false
  try{
    const x=new URL(a),y=new URL(b)
    const normal=p=>decodeURI(p)
    return x.origin===ORIGIN && y.origin===ORIGIN && normal(x.pathname)===normal(y.pathname) &&
      x.search===y.search && x.hash===y.hash
  }catch{return false}
}
async function inspect(source,expectedStatus,expectedDestination,fetcher){
  const requestUrl=new URL(source,ORIGIN).href
  // Validation prevents a redirect to another origin before calling fetch.
  assert.equal(new URL(requestUrl).origin,ORIGIN)
  try{
    const response=await fetcher(requestUrl,{
      method:'GET',redirect:'manual',signal:AbortSignal.timeout(15000),
      headers:{Accept:'text/html,application/xhtml+xml,*/*'}
    })
    const location=response.headers.get('location')||''
    const target=location?new URL(location,requestUrl).href:''
    const pass=response.status===expectedStatus&&equalUrl(target,new URL(expectedDestination,ORIGIN).href)
    if(response.body)await response.body.cancel().catch(()=>{})
    return {source,status:response.status,expected_status:expectedStatus,
      location:target||null,expected_location:new URL(expectedDestination,ORIGIN).href,pass}
  }catch(e){
    return {source,status:null,expected_status:expectedStatus,location:null,
      expected_location:new URL(expectedDestination,ORIGIN).href,pass:false,
      error:e?.name==='TimeoutError'?'TIMEOUT':'REQUEST_OR_LOCATION_FAILED'}
  }
}
export async function auditLiveRedirects({rules,fetcher=fetch,includeDynamic=true,now=new Date()}={}){
  assert.ok(Array.isArray(rules),'Exact redirect rules required')
  for(const r of rules)validateRule(r)
  const results=new Array(rules.length)
  let next=0
  async function consume(){
    while(next<rules.length){
      const index=next++
      const r=rules[index]
      results[index]=await inspect(r.source,r.statusCode??(r.permanent?308:307),r.destination,fetcher)
    }
  }
  await Promise.all(Array.from({length:Math.min(MAX_CONCURRENCY,rules.length)},()=>consume()))
  const dynamic=includeDynamic?await inspect(
    DYNAMIC_PROBE,308,DYNAMIC_PROBE.slice(0,-1),fetcher):null
  const failed=results.filter(x=>!x.pass)
  if(dynamic&&!dynamic.pass)failed.push(dynamic)
  return {
    schema:'amphon.seo.live-redirect-parity.v1',
    origin:ORIGIN,observed_at:now.toISOString(),source_registry:'vercel.json',
    mode:'PUBLIC_READ_ONLY',expected_exact:rules.length,checked_exact:results.length,
    passed_exact:results.length-results.filter(x=>!x.pass).length,
    failed_exact:results.filter(x=>!x.pass).length,
    dynamic_checked:Boolean(dynamic),dynamic_passed:dynamic?.pass??null,
    passed:failed.length===0, failures:failed,results,dynamic,
    production_verified:false,can_write_ledger:false,can_deploy:false,
    can_modify_dns:false,source_sha_attested:false,
    note:'Live public 1st-hop status/Location check only. Source provenance and owner branch exception require separate review.'
  }
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  try{
    const report=await auditLiveRedirects({rules:expectedRules()})
    process.stdout.write(JSON.stringify(report,null,2)+'\n')
    if(!report.passed)process.exitCode=1
  }catch(e){
    process.stdout.write(JSON.stringify({schema:'amphon.seo.live-redirect-parity.v1',
      passed:false,production_verified:false,can_deploy:false,error:String(e.message||e)})+'\n')
    process.exitCode=1
  }
}
