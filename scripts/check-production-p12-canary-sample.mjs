#!/usr/bin/env node
// P12: passive, no-write, PUBLIC HTTP canary observer for two proven 404s.
// Does not authorize a deployment or claim a canary when all requests hit old version.
const ORIGIN='https://amphon.co.th'
const routes=[
 {source:'/บริการ/รัปีงอกคอมบริษัท',dest:'/บริการ/รับซื้อคอมบริษัท'},
 {source:'/บริการ/รับซื้อมือถือ',dest:'/บริการ/รับซื้อโทรศัพท์มือสอง'},
]
const samples=80 // bounded load; no credentials, cookies, writes, or deploy permissions
const parallelism=4
const asPath=u=>new URL(u,ORIGIN).pathname
const encode=u=>new URL(u,ORIGIN).href
async function probe(rule,index){
 const url=encode(rule.source)+'?__amphon_p12_probe='+index
 try{
  const response=await fetch(url,{method:'GET',redirect:'manual',
    headers:{'Cache-Control':'no-cache',Accept:'text/html,*/*'},
    signal:AbortSignal.timeout(12000)})
  const where=response.headers.get('location')
  let target=null
  if(where){
   try{const dest=new URL(where,url);target={origin:dest.origin,path:dest.pathname}}catch{}
  }
  if(response.body)await response.body.cancel().catch(()=>{})
  const valid301=response.status===301&&target?.origin===ORIGIN&&
    target.path===asPath(rule.dest)
  return {source:rule.source,index,status:response.status,
    kind:valid301?'new_redirect':response.status===404?'old_404':'unexpected',
    bad_location:response.status===301&&!valid301,
    location_target:target}
 }catch(error){
  return {source:rule.source,index,status:null,kind:'unexpected',
    error:error?.name==='TimeoutError'?'TIMEOUT':'NETWORK_ERROR'}
 }
}
async function run(){
 const all=[]
 for(const rule of routes){
  for(let i=0;i<samples;i+=parallelism){
   all.push(...await Promise.all(Array.from({length:Math.min(parallelism,samples-i)},
     (_,k)=>probe(rule,i+k))))
  }
 }
 const results=routes.map(rule=>{
  const x=all.filter(v=>v.source===rule.source)
  return {source:rule.source,expected_destination:rule.dest,
   checked:x.length,new_redirect:x.filter(v=>v.kind==='new_redirect').length,
   old_404:x.filter(v=>v.kind==='old_404').length,
   unexpected:x.filter(v=>v.kind==='unexpected').length,
   bad_location:x.filter(v=>v.bad_location).length,
   example_bad:x.filter(v=>v.kind==='unexpected').slice(0,3)}
 })
 const unexpected=results.reduce((s,x)=>s+x.unexpected,0)
 const report={
   schema:'amphon.seo.live-canary-observation.p12.v1',
   observed_at:new Date().toISOString(),origin:ORIGIN,
   source_baseline_sha:'cb55117d641ea76cfa0e5d1cc9e55a8deb724caa',
   expected_new_release_sha:'ee6a8d6304d4cd06674236858924bcf5825e0b26',
   target_version_attested:false,actual_worker_version:null,
   sample_size_per_rule:samples,
   routes:results,total_checked:all.length,
   safe_first_hop_only:unexpected===0,
   saw_new_redirect_for_both:results.every(x=>x.new_redirect>0),
   candidate_min_samples_both:results.every(x=>x.new_redirect>=2),
   all_new_redirects:results.every(x=>x.new_redirect===samples),
   concluded_canary_traffic:false,
   production_verified:false,can_write_ledger:false,can_deploy:false,
   scope:'Probabilistic first-hop public HTTP observations; version identity and deployment percentages must be independently checked with authenticated Cloudflare API. All-new results only when 100% of requests are new version; sample is never a guarantee.'
 }
 process.stdout.write(JSON.stringify(report,null,2)+'\n')
 if(!report.safe_first_hop_only)process.exitCode=1
}
await run().catch(e=>{
 process.stdout.write(JSON.stringify({schema:'amphon.seo.live-canary-observation.p12.v1',safe_first_hop_only:false,production_verified:false,can_write_ledger:false,can_deploy:false,error:String(e?.message||e)})+'\n')
 process.exitCode=1
})
