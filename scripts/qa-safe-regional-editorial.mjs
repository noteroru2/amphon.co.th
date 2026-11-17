/**
 * No-deploy regional editorial diff gate:
 * - Only the 71 immutable, GSC-prioritized source paths may change.
 * - Slug, service area, canonical-related frontmatter and indexes never change.
 * - Only body copy + factual updated date may change.
 * - No automatic deletion, redirect, sitemap, robots, geo-team claim or price.
 */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('docs/seo-evidence/editorial-cohort-16-and-57-2026-11-17.json','utf8'));
assert.equal(manifest.targets.length,71);
assert.equal(new Set(manifest.targets.map(t=>t.path)).size,71);
const allowed=new Set(manifest.targets.map(x=>x.path));
const exec=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:5e6});
const changed=exec('-c','core.quotePath=false','diff','--name-only','origin/release/cloudflare-production...HEAD')
 .trim().split('\n').filter(Boolean);
const sources=changed.filter(p=>p.startsWith('src/content/serviceAreas/'));
assert.ok(sources.every(p=>allowed.has(p)),'Editorial candidate modified non-reviewed area source');
const base=(p)=>exec('show','origin/release/cloudflare-production:'+p);
function split(md,p){
 const m=md.match(/^(---\r?\n[\s\S]*?\r?\n---)([\s\S]*)$/);
 assert.ok(m,'Frontmatter missing: '+p);
 const front=m[1].replace(/^updated:\s*.+$/gm,'updated: <REVIEW_DATE>');
 return {front,body:m[2]};
}
for(const p of sources){
 const before=split(base(p),p);
 const after=split(fs.readFileSync(p,'utf8'),p);
 assert.equal(after.front,before.front,'A frontmatter field other than updated changed: '+p);
 assert.notEqual(after.body,before.body,'No meaningful body change: '+p);
 assert.match(fs.readFileSync(p,'utf8'),/^updated:\s*"2026-11-17"$/m,'Edited page must mark real review date: '+p);
 assert.match(after.body,/LINE|@webuy/i,'Seller contact missing: '+p);
 assert.ok(after.body.trim().length>900,'Content became unhelpfully short: '+p);
 assert.doesNotMatch(after.body,/มีสาขาในจังหวัด(?!อุบลราชธานี)|ทีมงานประจำจังหวัด|รับเงินทันทีทุกกรณี|รับซื้อราคาสูงสุดแน่นอน|รับประกันว่ารับซื้อทุกรายการ|เคยซื้อจากลูกค้าในจังหวัดนี้แน่นอน/,'Unverified service or price promise: '+p);
}
console.log('AMPHON_REGIONAL_SAFE_EDIT_QA '+JSON.stringify({
 cohort:manifest.targets.length,modified_pages:sources.length,
 protected_clicked_in_cohort:manifest.targets.filter(x=>x.gsc_clicks>0).length,
 modified_clicked:sources.filter(p=>manifest.targets.find(t=>t.path===p)?.gsc_clicks>0).length,
 unchanged_pages:921-sources.length,
 changed_paths:sources
}));
