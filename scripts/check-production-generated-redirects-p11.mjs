#!/usr/bin/env node
// P11: Extract the *actual generated* Astro + Vercel redirect manifest and
// probe only the adapter-added rules on the public Production domain.
// Read-only GET; no release certification, deploy, DNS, DB or tokens.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const ORIGIN='https://amphon.co.th'
const MANIFEST=new URL('../dist/client/_redirects',import.meta.url)
const BASELINE=new URL('../vercel.json',import.meta.url)
const EXCEPTIONAL_FILM=new Set([
 '/บริการ/รับซื้อกล้องฟิลัม',
 '/บริการ/รับซื้อกล้องฟีล์ม',
 '/บริการ/รับซื้อกล้องฟิล์ล'
])
function allRules(text) {
 const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&x.startsWith('/')&&!x.startsWith('//'))
 return lines.map(line=>{
  const parts=line.split(/\s+/)
  assert.equal(parts.length,3,'Expected exactly three _redirects fields')
  assert.ok(/^\d{3}$/.test(parts[2]),'Non-numeric redirect status')
  return {source:parts[0],destination:parts[1],status:Number(parts[2])}
 })
}
export function inspectManifest(manifest,vercel){
 const baseline=JSON.parse(vercel)
 assert.equal(baseline.redirects.length,261,'Source registry unexpectedly changed')
 const src=baseline.redirects.filter(x=>x.source!=='/:path+/')
 assert.equal(src.length,260,'Exact source-count drift')
 const rules=allRules(manifest)
 assert.equal(rules.length,263,'Expected 263 generated redirect lines')
 assert.equal(new Set(rules.map(x=>x.source)).size,263,'Generated source duplicates')
 const expected=src.map(r=>({
   source:EXCEPTIONAL_FILM.has(r.source)?encodeURI(r.source):r.source,
   destination:r.destination,status:r.statusCode??(r.permanent?308:307)
 }))
 for(const x of expected){
  assert.ok(rules.some(r=>r.source===x.source &&
    r.destination===x.destination&&r.status===x.status),
    'Original rule changed: '+x.source)
 }
 const dynamic={source:'/*/',destination:'/:splat',status:308}
 assert.ok(rules.some(x=>JSON.stringify(x)===JSON.stringify(dynamic)),
  'Original dynamic catch-all changed')
 const baselineNames=new Set([...expected.map(x=>x.source),dynamic.source])
 const extras=rules.filter(r=>!baselineNames.has(r.source))
 assert.equal(extras.length,2,'Not exactly two adapter-added rules')
 return {total:rules.length,baseline_exact:260,baseline_dynamic:1,extras}
}
function concreteSource(rule){
 // For extra static mappings only; do not claim wildcard parity from 1 probe.
 if(!/^\/(?!\/)/.test(rule.source)||/[\*\{\}:?]/.test(rule.source))
  return null
 const u=new URL(rule.source,ORIGIN)
 if(u.origin!==ORIGIN||u.search||u.hash) return null
 return u
}
function expectedTarget(rule){
 // Cloudflare supports :splat for dynamic, but we only verify exact extras.
 if(!/^\/(?!\/)/.test(rule.destination)||/[\*\{\}:?]/.test(rule.destination))
  return null
 const target=new URL(rule.destination,ORIGIN)
 if(target.origin!==ORIGIN) return null
 return target
}
function canonicalUrl(u){return u?.href||null}
export async function verifyGeneratedExtras({manifest,vercel,fetcher=fetch,at=new Date()}={}){
 const checked=inspectManifest(manifest,vercel)
 const results=[]
 for(const rule of checked.extras){
  const from=concreteSource(rule),to=expectedTarget(rule)
  if(!from||!to||![200,301,302,303,307,308].includes(rule.status)){
   results.push({...rule,pass:false,error:'NON_LITERAL_OR_UNSAFE_RULE_REQUIRES_SEPARATE_REVIEW'})
   continue
  }
  try{
   const response=await fetcher(from.href,{
     method:'GET',redirect:'manual',
     headers:{Accept:'text/html,application/xhtml+xml,*/*'},
     signal:AbortSignal.timeout(15000)
   })
   const raw=response.headers.get('location')||''
   const location=raw?new URL(raw,from).href:null
   const expected=rule.status===200?null:to.href
   const pass=response.status===rule.status && (
     rule.status===200?!location:location===expected)
   if(response.body)await response.body.cancel().catch(()=>{})
   results.push({...rule,status:response.status,location,expected_location:expected,pass})
  }catch(e){
   results.push({...rule,status:null,pass:false,
     error:e?.name==='TimeoutError'?'TIMEOUT':'LIVE_REQUEST_FAILED'})
  }
 }
 return {
   schema:'amphon.seo.generated-live-redirects.p11.v1',
   origin:ORIGIN,observed_at:at.toISOString(),
   source_build_commit:'ee6a8d6304d4cd06674236858924bcf5825e0b26',
   generated_rules:checked.total,baseline_exact:checked.baseline_exact,
   baseline_dynamic:checked.baseline_dynamic,extras:results,
   extras_checked:results.length,extras_passed:results.filter(x=>x.pass).length,
   extras_failed:results.filter(x=>!x.pass).length,
   passed:results.length===2&&results.every(x=>x.pass),
   production_verified:false,can_write_ledger:false,can_deploy:false,
   source_sha_attested:false,
   note:'Live exact first-hop HTTP proof only for two adapter-generated rules; no blanket release approval.'
 }
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try {
  const report=await verifyGeneratedExtras({
   manifest:readFileSync(MANIFEST,'utf8'),vercel:readFileSync(BASELINE,'utf8')})
  process.stdout.write(JSON.stringify(report,null,2)+'\n')
  if(!report.passed)process.exitCode=1
 }catch(e){
  process.stdout.write(JSON.stringify({
   schema:'amphon.seo.generated-live-redirects.p11.v1',
   passed:false,production_verified:false,can_write_ledger:false,can_deploy:false,
   error:String(e?.message||e)},null,2)+'\n')
  process.exitCode=1
 }
}
