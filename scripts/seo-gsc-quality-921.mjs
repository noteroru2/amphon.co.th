/**
 * Read-only review of all built service×province pages. Never alters canonical,
 * noindex, redirects, copy or the production Worker. Run after Astro build and
 * scripts/audit-serviceareas-1020.mjs. Missing GSC rows mean UNKNOWN, not zero.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir='artifacts/service-area-audit';
const csv=path.join(dir,'all-source-pages.csv');
const evidence='docs/seo-evidence/gsc-amphon-final-pages-2026-10-18-to-11-14.json';
assert.ok(fs.existsSync(csv),'Run source/rendered quality audit first');
const snapshot=JSON.parse(fs.readFileSync(evidence,'utf8'));
assert.ok(snapshot.receipt_id&&snapshot.site_id==='amphon'&&snapshot.pages.length>300,'Missing fresh GSC page evidence');
function readCsv(s){
 let rows=[],row=[],cell='',inside=false;
 for(let i=0;i<s.length;i++){
   const ch=s[i];
   if(inside){if(ch==='"'&&s[i+1]==='"'){cell+='"';i++}else if(ch==='"')inside=false;else cell+=ch}
   else if(ch==='"')inside=true;
   else if(ch===','){row.push(cell);cell=''}
   else if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell=''}
   else cell+=ch;
 }
 if(cell||row.length){row.push(cell);rows.push(row)}
 const head=rows.shift();
 return rows.filter(z=>z.some(Boolean)).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??''])));
}
const source=readCsv(fs.readFileSync(csv,'utf8'));
const active=source.filter(r=>r.indexable==='true');
assert.equal(source.length,1020,'Source size drift');
assert.equal(active.length,921,'Indexable site structure changed: review before publishing');
const gsc=new Map(snapshot.pages.map(p=>[p.path,p]));
const groups=new Map();
const critical=new Set(['BAD_FRONTMATTER','MISSING_ENTITY_KEYS','CANONICAL_MISMATCH','H1_COUNT','NO_TITLE_OR_H1','MISSING_SITEMAP','BUILT_NOINDEX','SITEMAP_WITHOUT_HTML','UNVERIFIED_LOCAL_OR_PRICE_CLAIM']);
const rows=active.map(r=>{
 const g=gsc.get(r.url)||null;
 const flags=(r.flags||'').split('|').filter(Boolean);
 const short=Number(r.source_chars)<1700,sim=Number(r.similarity)>=0.87;
 const mediumSimilarity=flags.includes('SHORT_AND_SIMILAR');
 const risk=flags.filter(f=>critical.has(f)).length*8+(short?3:0)+(sim?3:0)+(mediumSimilarity?3:0)+(sim&&Number(r.source_chars)<3200?3:0);
 const action=g&&g.clicks>0?'PROTECT_EXISTING_ORGANIC_TRAFFIC':g&&g.impressions>=50?'REVIEW_INTENT_AND_CTR':risk>=8?'REVIEW_CLAIMS_OR_THIN_CONTENT':risk>=3?'EDITORIAL_DUPLICATE_REVIEW':g?'MONITOR_LOW_GSC_IMPRESSIONS':'MONITOR_GSC_UNOBSERVED';
 const entry={url:r.url,source_file:r.source_file,service:r.service,area:r.area,source_chars:+r.source_chars,h2:+r.h2,faq:+r.faq,similarity:+r.similarity,nearest:r.nearest,source_flags:flags.filter(f=>f!=='NO_STORE_LOCATION_DISCLOSURE'),store_location_in_source:!flags.includes('NO_STORE_LOCATION_DISCLOSURE'),gsc_clicks:g?g.clicks:null,gsc_impressions:g?g.impressions:null,gsc_position:g?g.position:null,review_action:action,heuristic_risk:risk};
 const items=groups.get(r.service)||[];items.push(entry);groups.set(r.service,items);
 return entry;
});
const families=[...groups.entries()].map(([service,items])=>({service,pages:items.length,gsc_pages:items.filter(x=>x.gsc_impressions!==null).length,with_clicks:items.filter(x=>x.gsc_clicks>0).length,strong_similarity:items.filter(x=>x.similarity>=0.87).length,short_content:items.filter(x=>x.source_chars<1700).length,impressions_reported:items.reduce((s,x)=>s+(x.gsc_impressions||0),0),source_only_location_missing:items.filter(x=>!x.store_location_in_source).length})).sort((a,b)=>b.strong_similarity-a.strong_similarity||b.short_content-a.short_content);
rows.sort((a,b)=>(b.gsc_clicks||0)-(a.gsc_clicks||0)||(b.gsc_impressions||0)-(a.gsc_impressions||0)||b.heuristic_risk-a.heuristic_risk);
const actions=Object.fromEntries([...new Set(rows.map(x=>x.review_action))].map(k=>[k,rows.filter(x=>x.review_action===k).length]));
const summary={source:1020,indexable:921,excluded:99,service_families:families.length,gsc_receipt:snapshot.receipt_id,gsc_period:[snapshot.start_date,snapshot.end_date],gsc_reported_indexable:rows.filter(x=>x.gsc_clicks!==null).length,gsc_protected_clicked:rows.filter(x=>x.gsc_clicks>0).length,gsc_unobserved_unknown:rows.filter(x=>x.gsc_clicks===null).length,strong_similarity:rows.filter(x=>x.similarity>=0.87).length,short_content:rows.filter(x=>x.source_chars<1700).length,short_and_similar:rows.filter(x=>x.source_flags.includes('SHORT_AND_SIMILAR')).length,review_actions:actions,notice:'Editorial heuristics only: no penalty claim; GSC-missing is UNKNOWN; store location may come from shared layout; no automatic URL removals.'};
fs.mkdirSync(dir,{recursive:true});
for(const [name,v] of [['gsc-prioritized-summary.json',summary],['gsc-prioritized-families.json',families],['gsc-prioritized-921.json',rows]])fs.writeFileSync(path.join(dir,name),JSON.stringify(v,null,2)+'\n');
let md=['# AMPHON 921-service-page human content audit','',summary.notice,'GSC FINAL '+summary.gsc_period.join(' to ')+' receipt '+summary.gsc_receipt,'','## Summary',JSON.stringify(summary,null,2),'','## Most similar content families','| Group | Pages | Similar >=0.87 | Short | Organic clicks pages | GSC impressions |','|---|---:|---:|---:|---:|---:|',...families.slice(0,40).map(f=>'| '+f.service+' | '+f.pages+' | '+f.strong_similarity+' | '+f.short_content+' | '+f.with_clicks+' | '+f.impressions_reported+' |'),'','## Protect traffic first','| URL | Clicks | Impressions | Risk |','|---|---:|---:|---:|',...rows.filter(x=>x.gsc_clicks>0).slice(0,60).map(x=>'| '+x.url+' | '+x.gsc_clicks+' | '+x.gsc_impressions+' | '+x.heuristic_risk+' |'),'','No URLs were changed. Human/editorial review requires actual evidence and a fresh GSC/indexing check before consolidation.'];
fs.writeFileSync(path.join(dir,'gsc-prioritized-human-review.md'),md.join('\n')+'\n');
console.log('AMPHON_921_GSC_CONTENT_REVIEW '+JSON.stringify({summary,top_families:families.slice(0,10)}));
