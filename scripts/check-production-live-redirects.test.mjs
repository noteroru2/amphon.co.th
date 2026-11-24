import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {auditLiveRedirects,expectedRules} from './check-production-live-redirects.mjs'

const ORIGIN='https://amphon.co.th'
const rules=[
 {source:'/บริการ/รับซื้อกล้องฟิลัม',destination:'/'+encodeURIComponent('บริการ')+'/'+encodeURIComponent('รับซื้อกล้องฟิล์ม'),permanent:true},
 {source:'/old-computer',destination:'/services/computer',permanent:true}
]
const response=(status,location='')=>new Response(null,{status,headers:location?{Location:location}:{}})
const goodFetch=async(url,options)=>{
 assert.equal(options.method,'GET')
 assert.equal(options.redirect,'manual')
 assert.ok(url.startsWith(ORIGIN+'/'))
 if(url.endsWith('__amphon_p10_readonly_redirect_probe__/'))
   return response(308,'/__amphon_p10_readonly_redirect_probe__')
 const rule=rules.find(x=>new URL(x.source,ORIGIN).href===url)
 if(!rule)throw Error('unexpected test route')
 return response(308,new URL(rule.destination,ORIGIN).href)
}
test('load exactly 260 original immutable exact paths and 1 dynamic rule',()=>{
 const found=expectedRules()
 assert.equal(found.length,260)
 assert.ok(found.some(x=>x.source===rules[0].source))
})
test('pass two first-hop 308s and dynamic redirect, without release attestation',async()=>{
 const result=await auditLiveRedirects({rules,fetcher:goodFetch})
 assert.equal(result.passed,true,JSON.stringify(result.failures))
 assert.equal(result.passed_exact,2)
 assert.equal(result.failed_exact,0)
 assert.equal(result.dynamic_passed,true)
 assert.equal(result.production_verified,false)
 assert.equal(result.can_write_ledger,false)
 assert.equal(result.can_deploy,false)
 assert.equal(result.can_modify_dns,false)
 assert.equal(result.source_sha_attested,false)
})
test('302 and wrong location are not accepted as a permanent redirect',async()=>{
 let calls=0
 const fetcher=async(url,opts)=>{
  calls++
  if(url.endsWith('__amphon_p10_readonly_redirect_probe__/'))
   return response(308,'/__amphon_p10_readonly_redirect_probe__')
  return calls===1?response(302,new URL(rules[0].destination,ORIGIN).href):
    response(308,'https://external.example/redirect')
 }
 const report=await auditLiveRedirects({rules,fetcher})
 assert.equal(report.passed,false)
 assert.equal(report.failed_exact,2)
 assert.equal(report.failures.length,2)
})
test('reject external origins, query/fragment mutations and wildcard source',async()=>{
 for(const bad of [
  {source:'//evil.example/path',destination:'/safe',permanent:true},
  {source:'/old?secret=1',destination:'/safe',permanent:true},
  {source:'/old',destination:'https://external.example/safe',permanent:true},
  {source:'/old/:path',destination:'/safe',permanent:true},
  {source:'/old',destination:'/safe',statusCode:302}
 ])await assert.rejects(()=>auditLiveRedirects({rules:[bad],fetcher:goodFetch}),/Unsafe|exact path|No temporary|Unexpected|Destination/i)
})
test('manual QA workflow cannot deploy or write source and is fixed to release branch',()=>{
 const yaml=readFileSync(new URL('../.github/workflows/production-live-redirect-parity-readonly.yml',import.meta.url),'utf8')
 const script=readFileSync(new URL('./check-production-live-redirects.mjs',import.meta.url),'utf8')
 assert.match(yaml,/pull_request:/)
 assert.match(yaml,/release\/cloudflare-unified-astro7-20261118/)
 assert.match(yaml,/contents: read/)
 assert.match(yaml,/upload-artifact@/)
 assert.doesNotMatch(yaml,/wrangler (?:deploy|versions deploy)|supabase db push|pull-requests: write/)
 assert.doesNotMatch(script,/method:'POST'|method:'PATCH'|method:'PUT'|method:'DELETE'/)
})
