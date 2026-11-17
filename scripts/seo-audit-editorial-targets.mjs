/**
 * Prints the exact audit targets for editorial review, using *rendered* indexable
 * pages and actual GSC FINAL evidence. It makes no website changes.
 *
 * Run after:
 *  node scripts/cloudflare-builds-production-build.mjs
 *  node scripts/seo-gsc-quality-921.mjs
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/service-area-audit';
const rows=JSON.parse(fs.readFileSync(root+'/gsc-prioritized-921.json','utf8'));
const short=rows.filter(x=>x.source_chars<1700);
const shortSimilar=rows.filter(x=>x.source_flags.includes('SHORT_AND_SIMILAR'));
const both=rows.filter(x=>x.source_chars<1700 && x.source_flags.includes('SHORT_AND_SIMILAR'));
const union=new Map([...short,...shortSimilar].map(x=>[x.url,x]));
const family=new Map();
for(const x of union.values()){
 const group=family.get(x.service)||[];
 group.push(x);
 family.set(x.service,group);
}
const report={
 baselines:{indexable:rows.length,short_under_1700:short.length,short_and_similar:shortSimilar.length,intersection:both.length,distinct_targets:union.size},
 family_priority:[...family.entries()].map(([service,items])=>({service,total:items.length,traffic:items.filter(x=>x.gsc_clicks>0).length,short:items.filter(x=>x.source_chars<1700).length,short_similar:items.filter(x=>x.source_flags.includes('SHORT_AND_SIMILAR')).length,impressions:items.reduce((s,x)=>s+(x.gsc_impressions||0),0)})).sort((a,b)=>b.traffic-a.traffic||b.impressions-a.impressions||b.total-a.total),
 targets:[...union.values()].map(x=>({
   source:x.source_file,url:x.url,service:x.service,area:x.area,chars:x.source_chars,
   flags:x.source_flags,similarity:x.similarity,nearest:x.nearest,
   gsc_clicks:x.gsc_clicks,gsc_impressions:x.gsc_impressions,
   gsc_unknown:x.gsc_clicks===null,priority:x.review_action
 })).sort((a,b)=>(b.gsc_clicks||0)-(a.gsc_clicks||0)||(b.gsc_impressions||0)-(a.gsc_impressions||0)||a.chars-b.chars)
};
assert.equal(rows.length,921,'Cannot act on changed sitemap or rendered page count');
assert.equal(short.length,16,'Expected 16 short pages; re-audit before editing');
assert.equal(shortSimilar.length,57,'Expected 57 short/similar pages; re-audit before editing');
fs.writeFileSync(root+'/editorial-targets-16-and-57.json',JSON.stringify(report,null,2)+'\n');
console.log('AMPHON_EDITORIAL_TARGET_SUMMARY '+JSON.stringify(report.baselines));
console.log('AMPHON_EDITORIAL_TARGET_FAMILIES '+JSON.stringify(report.family_priority));
for(const x of report.targets)console.log('AMPHON_EDITORIAL_TARGET_ROW '+JSON.stringify(x));
console.log('AMPHON_EDITORIAL_REVIEW_ONLY No URLs changed, removed, redirected or noindexed');
