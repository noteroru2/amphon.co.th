/**
 * Read-only, evidence-safe audit of service-area source and rendered indexable pages.
 * Emits CSV report artifacts. Never changes index/noindex/redirect/canonical.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, extractFirstH1, extractTitle, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';
const srcDir=path.join(process.cwd(),'src/content/serviceAreas'),outDir=path.join(process.cwd(),'artifacts/service-area-audit');
fs.mkdirSync(outDir,{recursive:true});
const files=fs.readdirSync(srcDir).filter(x=>x.endsWith('.md')).sort();
const built=collectBuiltPages(),sitemap=new Set();
for(const file of walkFiles(distDir).filter(x=>/sitemap[^/]*\.xml$/.test(x))){
 for(const m of readText(file).matchAll(/<loc>([^<]+)<\/loc>/g)){const p=normalizePathname(m[1]);if(p)sitemap.add(p);}
}
const fmField=(s,name)=>s.match(new RegExp('^'+name+':\\s*["\\x27]?([^\\r\\n"\\x27]+)','m'))?.[1]?.trim()||'';
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/!?\[[^\]]*\]\([^)]*\)/g,' ').replace(/[*_#>]/g,' ').replace(/\s+/g,' ').trim();
const provinceNames=['กาฬสินธุ์','ขอนแก่น','ชัยภูมิ','นครพนม','นครราชสีมา','บึงกาฬ','บุรีรัมย์','มหาสารคาม','มุกดาหาร','ยโสธร','ร้อยเอ็ด','ศรีสะเกษ','สกลนคร','สุรินทร์','หนองคาย','หนองบัวลำภู','อำนาจเจริญ','อุดรธานี','อุบลราชธานี','เลย'];
function shingles(s){
 for(const p of provinceNames)s=s.replaceAll(p,'_พื้นที่_');
 s=plain(s).toLowerCase().replace(/\s/g,'').slice(0,5000);
 const set=new Set();for(let i=0;i+9<s.length;i+=9)set.add(s.slice(i,i+9));return set;
}
function similarity(a,b){let k=0;for(const x of a)if(b.has(x))k++;return a.size+b.size?2*k/(a.size+b.size):0;}
const rows=files.map(file=>{
 const contents=fs.readFileSync(path.join(srcDir,file),'utf8').replace(/^\uFEFF/, ''); // 20 iPad Markdown sources contain a UTF-8 BOM
 const m=contents.match(/^---\r?\n([\s\S]*?)\r?\n---/),fm=m?.[1]||'',body=m?contents.slice(m[0].length):contents;
 const slug=fmField(fm,'slug')||file.slice(0,-3),service=fmField(fm,'serviceSlug'),area=fmField(fm,'areaSlug'),url='/รับซื้อ/'+slug;
 const builtFile=built.get(url),html=builtFile?readText(builtFile):'';
 const flags=[];
 if(!m)flags.push('BAD_FRONTMATTER');
 if(!service||!area)flags.push('MISSING_ENTITY_KEYS');
 if(plain(body).length<1700)flags.push('SHORT_CONTENT');
 if((body.match(/^## /gm)||[]).length<2)flags.push('FEW_SECTIONS');
 if((fm.match(/^\s*-\s*question:/gm)||[]).length<3)flags.push('FEW_FAQ');
 if(/มีสาขาในจังหวัด(?!อุบลราชธานี)|ทีมงานประจำจังหวัด|รับเงินทันทีทุกกรณี|รับซื้อราคาสูงสุดแน่นอน/.test(contents))flags.push('UNVERIFIED_LOCAL_OR_PRICE_CLAIM');
 if(!/อุบลราชธานี/.test(contents))flags.push('NO_STORE_LOCATION_DISCLOSURE');
 if(builtFile){
  if(normalizePathname(extractCanonical(html))!==url)flags.push('CANONICAL_MISMATCH');
  if((html.match(/<h1\b/gi)||[]).length!==1)flags.push('H1_COUNT');
  if(!extractTitle(html)||!extractFirstH1(html))flags.push('NO_TITLE_OR_H1');
  if(!sitemap.has(url))flags.push('MISSING_SITEMAP');
  if(/name=["']robots["'][^>]*noindex/i.test(html))flags.push('BUILT_NOINDEX');
 }else if(sitemap.has(url))flags.push('SITEMAP_WITHOUT_HTML');
 return {url,source_file:'src/content/serviceAreas/'+file,service,area,indexable:!!builtFile,in_sitemap:sitemap.has(url),draft:/^draft:\s*true/m.test(fm),source_chars:plain(body).length,faq:(fm.match(/^\s*-\s*question:/gm)||[]).length,h2:(body.match(/^## /gm)||[]).length,title:fmField(fm,'title'),description:fmField(fm,'description'),similarity:0,nearest:'',flags,_shingles:shingles(body)};
});
const groups=new Map();for(const r of rows.filter(x=>x.indexable)){const a=groups.get(r.service)||[];a.push(r);groups.set(r.service,a);}
for(const group of groups.values())for(const r of group){
 let max=0,nearest='';
 for(const other of group){if(other===r)continue;const sim=similarity(r._shingles,other._shingles);if(sim>max){max=sim;nearest=other.url;}}
 r.similarity=Number(max.toFixed(3));r.nearest=nearest;
 if(max>=0.87)r.flags.push('SIBLING_SIMILARITY_HEURISTIC');
 if(max>=0.75&&r.source_chars<3200)r.flags.push('SHORT_AND_SIMILAR');
}
for(const r of rows)delete r._shingles;
const active=rows.filter(r=>r.indexable);const flagCounts={};for(const r of active)for(const flag of r.flags)flagCounts[flag]=(flagCounts[flag]||0)+1;
const summary={source_pages:rows.length,rendered_pages:active.length,sitemap_pages:[...sitemap].filter(x=>x.startsWith('/รับซื้อ/')).length,excluded_sources:rows.length-active.length,families:groups.size,flagged_for_human_review:active.filter(x=>x.flags.length).length,flag_counts:flagCounts,warning:'Source-level signals only; NO URL may be removed, redirected or noindexed without GSC and external-link review'};
const fields=['url','source_file','service','area','indexable','in_sitemap','draft','source_chars','faq','h2','similarity','nearest','flags','title','description'];
const csv=list=>[fields.join(','),...list.map(r=>fields.map(f=>'"'+String(f==='flags'?r.flags.join('|'):r[f]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n';
fs.writeFileSync(path.join(outDir,'all-source-pages.csv'),csv(rows));
fs.writeFileSync(path.join(outDir,'indexable-921.csv'),csv(active));
fs.writeFileSync(path.join(outDir,'manual-review.csv'),csv(active.filter(r=>r.flags.length)));
fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify(summary,null,2));
console.log('AUDIT_SUMMARY '+JSON.stringify(summary));
console.log('MANUAL_REVIEW_SAMPLE '+JSON.stringify(active.filter(r=>r.flags.length).sort((a,b)=>b.flags.length-a.flags.length).slice(0,12).map(x=>({url:x.url,flags:x.flags,similarity:x.similarity}))));

const families=[...groups.entries()].map(([service,items])=>({
 service,
 pages:items.length,
 strong_similarity:items.filter(r=>r.similarity>=0.87).length,
 short_content:items.filter(r=>r.flags.includes('SHORT_CONTENT')).length,
 missing_store_in_source:items.filter(r=>r.flags.includes('NO_STORE_LOCATION_DISCLOSURE')).length,
 average_source_chars:Math.round(items.reduce((n,r)=>n+r.source_chars,0)/items.length)
})).sort((a,b)=>b.strong_similarity-a.strong_similarity);
console.log('TOP_DUPLICATE_FAMILIES '+JSON.stringify(families.slice(0,18)));
console.log('FRONTMATTER_REVIEW_SAMPLE '+JSON.stringify(active.filter(r=>r.flags.includes('BAD_FRONTMATTER')).slice(0,25).map(r=>r.source_file)));
console.log('EDITORIAL_HEURISTIC_NOTICE Source-only location mention does not prove absent store details in shared layout; similarity ignores province terms and is not evidence of a search penalty.');
if(summary.source_pages!==1020||summary.rendered_pages!==921||summary.sitemap_pages!==921){
 console.error('FAIL baseline 1020 source / 921 built/indexable differs; do not alter routes');
 process.exitCode=1;
}
