/**
 * Safety regression for first content-quality batch in Server / UPS / Network.
 * No URL, canonical, indexability, redirect, schema or sitemap policy mutation.
 * Strictly checks full rendered HTML, not only frontmatter text.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, extractFirstH1, extractTitle, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';
const kinds={server:['บุรีรัมย์','มหาสารคาม','อุดรธานี','นครราชสีมา'],ups:['นครราชสีมา','อุดรธานี','อุบลราชธานี','ขอนแก่น'],network:['สุรินทร์','อุดรธานี','ร้อยเอ็ด','ขอนแก่น']};
const stems={server:'รับซื้อ-server',ups:'รับซื้อ-ups',network:'รับซื้ออุปกรณ์-network'};
const pages=collectBuiltPages(), errors=[],checks=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg);};
const sitemap=new Set();
for(const filename of walkFiles(distDir).filter(x=>/sitemap[^/]*\.xml$/.test(x)))
 for(const match of readText(filename).matchAll(/<loc>([^<]+)<\/loc>/g)){
  const p=normalizePathname(match[1]);if(p)sitemap.add(p);
 }
const parentServices=new Map(),pass=[];
for(const [kind,areas] of Object.entries(kinds)){
 for(const area of areas){
  const slug=stems[kind]+'-'+area,route='/รับซื้อ/'+slug,file=path.join(process.cwd(),'src/content/serviceAreas',slug+'.md');
  check(fs.existsSync(file),'Source does not exist: '+slug);
  if(!fs.existsSync(file))continue;
  const src=readText(file),renderedPath=pages.get(route),html=renderedPath?readText(renderedPath):'';
  const body=src.replace(/^---\r?\n[\s\S]*?\r?\n---/,'');
  const data={route,chars:src.length,h2:(body.match(/^## /gm)||[]).length,hasHtml:!!renderedPath,canonical:extractCanonical(html)};
  checks.push(data);
  check(src.includes('slug: "'+slug+'"'),slug+': slug changed');
  check(src.includes('areaSlug: "'+area+'"'),slug+': areaSlug changed');
  check(src.length>=3100,slug+': insufficient unique explanation');
  check(data.h2>=6,slug+': sections missing');
  check(body.includes('LINE [@webuy]') && body.includes('24 ชั่วโมง'),slug+': honest LINE channel missing');
  check(body.includes('เจ้าหน้าที่ตอบตามคิว'),slug+': staffed response incorrectly described');
  check(body.includes('อุบลราชธานี') && body.includes('ชยางกูร 32'),slug+': Ubon storefront truth missing');
  check(!body.includes('ไม่ได้หมายความว่ามีสาขา') || body.includes('ไม่มีหน้าร้าน'),slug+': redundant branch language');
  check(!/จ่ายเงินทันทีทุกกรณี|มีสาขาในจังหวัด|รับถึงบ้านทุกจังหวัด|การันตีราคา|ราคาสูงสุดแน่นอน/.test(body),slug+': unsupported promise');
  check(renderedPath!==undefined,route+': emitted page missing');
  if(html){
    check(normalizePathname(extractCanonical(html))===route,route+': canonical not self');
    check(sitemap.has(route),route+': not in sitemap');
    check((html.match(/<h1\b/gi)||[]).length===1,route+': expected one H1');
    check(Boolean(extractTitle(html)) && Boolean(extractFirstH1(html)),route+': missing title or H1');
    check(/name=["']robots["'][^>]*content=["'][^"']*index, follow/i.test(html) || /index, follow/.test(html),route+': no index/follow');
    check(!/<meta[^>]+name=["']robots["'][^>]+content=["']noindex/i.test(html),route+': noindex');
    check(html.includes('line.me/ti/p/~@webuy'),route+': line CTA missing');
    check(html.includes('ไม่ใช่ประวัติรายการรับซื้อ'),route+': disclaimer on examples missing');
  }
  const group=parentServices.get(kind)||[];group.push({route,body});parentServices.set(kind,group);
  pass.push(route);
 }
}
for(const [kind,group] of parentServices){
 const tokenSet=body=>{
   let s=body.replace(/(?:บุรีรัมย์|มหาสารคาม|อุดรธานี|นครราชสีมา|อุบลราชธานี|ขอนแก่น|สุรินทร์|ร้อยเอ็ด)/g,'_จังหวัด_').replace(/\s/g,'');
   const set=new Set();for(let i=0;i+12<=s.length;i+=12)set.add(s.slice(i,i+12));return set;
 };
 const shingles=group.map(x=>tokenSet(x.body));
 for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
   const a=shingles[i],b=shingles[j];let common=0;for(const x of a)if(b.has(x))common++;
   const sim=2*common/(a.size+b.size);
   check(sim<0.87,kind+': excessive content overlap '+group[i].route+' / '+group[j].route+' = '+sim.toFixed(3));
 }
}
const baseCount=[...sitemap].filter(x=>x.startsWith('/รับซื้อ/')).length;
check(baseCount===921,'Indexable service×area URL count changed from 921: '+baseCount);
console.log('SERVER_UPS_NETWORK_BATCH_QA '+JSON.stringify({pass:!errors.length,errors,urlsChecked:pass.length,sitemapServiceAreaCount:baseCount,checks}));
if(errors.length)process.exitCode=1;
