/**
 * Compare immutable 71-page EDITORIAL BASELINE against rendered current content.
 * A former 16/57 flag disappearing is the intended result, not a QA failure.
 * GSC-missing means UNKNOWN (never automatically discard a page).
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='artifacts/service-area-audit';
const current=JSON.parse(fs.readFileSync(root+'/gsc-prioritized-921.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('docs/seo-evidence/editorial-cohort-16-and-57-2026-11-17.json','utf8'));
assert.equal(current.length,921,'Broken rendered/indexable site baseline');
assert.equal(baseline.targets.length,71,'Editorial cohort changed');
const map=new Map(current.map(x=>[x.source_file,x]));
const observed=baseline.targets.map(b=>{
 const now=map.get(b.path);
 assert.ok(now,'Reviewed regional page is missing from rendered indexable sitemap: '+b.path);
 return {path:b.path,url:b.url,service:b.service,area:b.area,
 original_flags:b.flags,original_chars:b.source_chars,original_similarity:b.similarity,
 now_chars:now.source_chars,now_flags:now.source_flags,now_similarity:now.similarity,
 gsc_clicks:now.gsc_clicks,gsc_impressions:now.gsc_impressions,gsc_unknown:now.gsc_clicks===null,
 short_fixed:b.flags.includes('SHORT_CONTENT')&&now.source_chars>=1700,
 short_similar_fixed:b.flags.includes('SHORT_AND_SIMILAR')&&!now.source_flags.includes('SHORT_AND_SIMILAR')
 };
});
const fam=new Map();
for(const r of observed){const arr=fam.get(r.service)||[];arr.push(r);fam.set(r.service,arr);}
const summarize=(rows)=>({
 source_pages:1020,indexable_pages:921,original_targets:71,
 original_short:baseline.baseline.short,original_short_and_similar:baseline.baseline.short_similar,
 original_overlap:baseline.baseline.overlap,
 current_short_all:current.filter(x=>x.source_chars<1700).length,
 current_short_similar_all:current.filter(x=>x.source_flags.includes('SHORT_AND_SIMILAR')).length,
 current_strong_similarity_all:current.filter(x=>x.similarity>=0.87).length,
 current_short_in_original:rows.filter(x=>x.now_chars<1700).length,
 current_short_similar_in_original:rows.filter(x=>x.now_flags.includes('SHORT_AND_SIMILAR')).length,
 current_strong_similarity_in_original:rows.filter(x=>x.now_similarity>=.87).length,
 original_clicked_pages:rows.filter(x=>x.gsc_clicks>0).length,
 clicked_pages_preserved:rows.filter(x=>x.gsc_clicks>0&&map.has(x.path)).length,
 notes:'Source-only heuristic, not Google ranking/penalty. A GSC-absent URL is UNKNOWN. URL/indexing/count preserved.'
});
const summary=summarize(observed);
const families=[...fam].map(([service,arr])=>({service,total:arr.length,clicked:arr.filter(x=>x.gsc_clicks>0).length,before_short:arr.filter(x=>x.original_flags.includes('SHORT_CONTENT')).length,after_short:arr.filter(x=>x.now_chars<1700).length,before_short_similar:arr.filter(x=>x.original_flags.includes('SHORT_AND_SIMILAR')).length,after_short_similar:arr.filter(x=>x.now_flags.includes('SHORT_AND_SIMILAR')).length,after_strong:arr.filter(x=>x.now_similarity>=0.87).length})).sort((a,b)=>b.after_strong-a.after_strong||b.after_short_similar-a.after_short_similar);
const out={summary,families,targets:observed};
fs.writeFileSync(root+'/editorial-targets-16-and-57.json',JSON.stringify(out,null,2)+'\n');
console.log('AMPHON_EDITORIAL_BEFORE_AFTER '+JSON.stringify(summary));
console.log('AMPHON_EDITORIAL_FAMILIES '+JSON.stringify(families));
for(const r of observed.filter(x=>x.now_chars<1700||x.now_similarity>=0.75))console.log('AMPHON_EDITORIAL_REMAINING '+JSON.stringify({file:r.path,similarity:r.now_similarity,flags:r.now_flags,old:r.original_similarity,gsc:[r.gsc_clicks,r.gsc_impressions]}));
console.log('AMPHON_EDITORIAL_SAFETY No URL/indexability changes; GSC missing is UNKNOWN');
