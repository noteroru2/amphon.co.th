/** P0 — exact-source, rendered SEO and service-truth checks for three parent pages. */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, extractTitle, extractFirstH1, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';

const fixtures=[
 {slug:'รับซื้อทีวี',category:['OLED','พาเนล','รีโมต','ไม่รับประกัน','LINE @webuy']},
 {slug:'รับซื้อเฟอร์นิเจอร์',category:['ชั้นอาคาร','ขนย้าย','ไม่รับประกัน','LINE @webuy']},
 {slug:'รับซื้อเครื่องใช้ไฟฟ้า',category:['สารทำความเย็น','ช่าง','ไม่รับประกัน','LINE @webuy']}
];
const errors=[],pages=collectBuiltPages(),sitemap=new Set();
for(const file of walkFiles(distDir).filter(x=>/sitemap[^/]*\.xml$/.test(x)))
 for(const m of readText(file).matchAll(/<loc>([^<]+)<\/loc>/g)){
  const p=normalizePathname(m[1]);if(p)sitemap.add(p);
 }
const serviceAreaCount=[...sitemap].filter(x=>x.startsWith('/รับซื้อ/')).length;
if(serviceAreaCount!==921)errors.push('Service-area sitemap changed from 921: '+serviceAreaCount);
const results=[];
for(const {slug,category} of fixtures){
 const raw=fs.readFileSync(path.join(process.cwd(),'src/content/services',slug+'.md'),'utf8');
 const front=raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
 const route='/บริการ/'+slug,renderedPath=pages.get(route),html=renderedPath?readText(renderedPath):'';
 const chk=(yes,msg)=>{if(!yes)errors.push(slug+': '+msg)};
 chk(Boolean(front),'missing frontmatter');
 chk(new RegExp('^slug: "'+slug+'"$','m').test(front?.[1]||''),'slug changed');
 chk(new RegExp('^mainKeyword: "'+slug+'"$','m').test(front?.[1]||''),'primary keyword changed');
 chk(/^draft: false$/m.test(front?.[1]||''),'draft/index intent changed');
 chk(/^updated: "2026-11-18"$/m.test(front?.[1]||''),'updated date missing');
 for(const fact of ['บริษัท อำพล เทรดดิ้ง จำกัด','740/8','อุบลราชธานี','09:00–19:00','LINE @webuy','24 ชั่วโมง','เจ้าหน้าที่ตอบตามคิว'])
  chk(raw.includes(fact),'missing verified store truth: '+fact);
 for(const fact of category)chk(raw.includes(fact),'missing product-specific guidance: '+fact);
 chk(!/\|[^\n]*?\d[\d,]*\s*[-–]\s*\d[\d,]*\s*\+?\s*บาท/.test(raw),'unverified numeric offer table remains');
 chk(!/รับถึงหน้าประตูบ้าน|ทีมขนย้ายให้ฟรี|บริการถอดแอร์ฟรี\s*[:—]|ภายใน 30 นาที|ตอบกลับภายใน 1–2 ชั่วโมง|รถบรรทุกพร้อมเข้าเคลียร์|ราคาสูงกว่าร้านทั่วไป/.test(raw),'unsupported unconditional service/price promise');
 chk(Boolean(renderedPath)&&sitemap.has(route),'rendered route missing from sitemap');
 if(html){
  chk(normalizePathname(extractCanonical(html))===route,'canonical changed');
  chk((html.match(/<h1\b/gi)||[]).length===1,'H1 count not 1');
  chk(Boolean(extractTitle(html))&&Boolean(extractFirstH1(html)),'title/H1 absent');
  chk(!/name=["']robots["'][^>]*noindex/i.test(html),'noindex introduced');
  chk(html.includes('line.me/ti/p/~@webuy'),'rendered LINE CTA missing');
  chk(html.includes('09:00–19:00'),'storefront hours missing rendered');
 }
 results.push({route,source_chars:raw.length,has_html:Boolean(html),in_sitemap:sitemap.has(route),canonical:extractCanonical(html)});
}
console.log('P0_PARENT_SERVICE_TRUTH_QA '+JSON.stringify({pass:errors.length===0,checked:results.length,serviceAreaCount,errors,results}));
if(errors.length)process.exitCode=1;
