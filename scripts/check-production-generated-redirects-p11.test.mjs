import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {inspectManifest,verifyGeneratedExtras} from './check-production-generated-redirects-p11.mjs'
const origin='https://amphon.co.th'
const baseline=readFileSync(new URL('../vercel.json',import.meta.url),'utf8')
const cfg=JSON.parse(baseline)
const film=new Set(['/บริการ/รับซื้อกล้องฟิลัม','/บริการ/รับซื้อกล้องฟีล์ม','/บริการ/รับซื้อกล้องฟิล์ล'])
const original=cfg.redirects.filter(x=>x.source!=='/:path+/').map(x=>
 (film.has(x.source)?encodeURI(x.source):x.source)+' '+x.destination+' '+(x.statusCode??(x.permanent?308:307))
)
assert.equal(original.length,260)
const extras=[
 '/__amp_p11_example_a /dest-a 301',
 '/__amp_p11_example_b /dest-b 308'
]
const manifest=[...original,'/*/ /:splat 308',...extras].join('\n')
const fake=(url,opts)=>{
 assert.equal(opts.method,'GET')
 assert.equal(opts.redirect,'manual')
 assert.ok(url.startsWith(origin+'/'))
 if(url.endsWith('/__amp_p11_example_a'))return Promise.resolve(new Response(null,{status:301,headers:{Location:'/dest-a'}}))
 if(url.endsWith('/__amp_p11_example_b'))return Promise.resolve(new Response(null,{status:308,headers:{Location:'/dest-b'}}))
 throw Error('unexpected URL')
}
test('identify exactly two additional adapter redirect rules',()=>{
 const r=inspectManifest(manifest,baseline)
 assert.equal(r.total,263)
 assert.equal(r.extras.length,2)
 assert.deepEqual(r.extras.map(x=>x.source),['/__amp_p11_example_a','/__amp_p11_example_b'])
})
test('pass two extra live redirects only with correct status and Location',async()=>{
 const r=await verifyGeneratedExtras({manifest,vercel:baseline,fetcher:fake})
 assert.equal(r.passed,true)
 assert.equal(r.extras_passed,2)
 assert.equal(r.production_verified,false)
 assert.equal(r.can_write_ledger,false)
 assert.equal(r.can_deploy,false)
})
test('HTTP 302 instead of 301 fails',async()=>{
 const bad=async(url,opts)=>url.endsWith('_a')
  ?new Response(null,{status:302,headers:{Location:'/dest-a'}}):fake(url,opts)
 const r=await verifyGeneratedExtras({manifest,vercel:baseline,fetcher:bad})
 assert.equal(r.passed,false)
 assert.equal(r.extras_failed,1)
})
test('off-origin Location and wildcard extra cannot be incorrectly certified',async()=>{
 const external=async(url,opts)=>url.endsWith('_a')
  ?new Response(null,{status:301,headers:{Location:'https://evil.example/dest-a'}}):fake(url,opts)
 const r=await verifyGeneratedExtras({manifest,vercel:baseline,fetcher:external})
 assert.equal(r.extras_failed,1)
 const wild=manifest.replace('/__amp_p11_example_b','/wild/*')
 const report=await verifyGeneratedExtras({manifest:wild,vercel:baseline,fetcher:fake})
 assert.equal(report.passed,false)
 assert.equal(report.extras_failed,1)
})
test('unexpected count, missing source rule, or duplicate source fails closed',()=>{
 assert.throws(()=>inspectManifest([...manifest.split('\n'),'/extra /dest 301'].join('\n'),baseline),/263/)
 assert.throws(()=>inspectManifest(manifest.replace(original[0],'/other /place 308'),baseline),/Original rule changed/)
 assert.throws(()=>inspectManifest(manifest.replace('/__amp_p11_example_b','/__amp_p11_example_a'),baseline),/duplicates/)
})
test('CI is fixed to source SHA and cannot deploy',()=>{
 const wf=readFileSync(new URL('../.github/workflows/production-generated-redirect-parity-p11-readonly.yml',import.meta.url),'utf8')
 assert.match(wf,/cb55117d641ea76cfa0e5d1cc9e55a8deb724caa/)
 assert.match(wf,/permissions:\s*\n  contents: read/)
 assert.match(wf,/npm ci --no-fund/)
 assert.match(wf,/astro build --config astro.config.cloudflare.production.mjs/)
 assert.doesNotMatch(wf,/wrangler deploy|supabase db push|pull-requests: write|deploy-pages/)
})
