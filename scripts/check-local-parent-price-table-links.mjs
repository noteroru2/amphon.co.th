/** P0: guard against province CTAs falsely promising removed parent price tables. */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';

const services=['รับซื้อทีวี','รับซื้อเฟอร์นิเจอร์','รับซื้อเครื่องใช้ไฟฟ้า'];
const provinces=['กาฬสินธุ์','ขอนแก่น','ชัยภูมิ','นครพนม','นครราชสีมา','บึงกาฬ','บุรีรัมย์','มหาสารคาม','มุกดาหาร','ยโสธร','ร้อยเอ็ด','ศรีสะเกษ','สกลนคร','สุรินทร์','หนองคาย','หนองบัวลำภู','อำนาจเจริญ','อุดรธานี','อุบลราชธานี','เลย'];
const pages=collectBuiltPages(),errors=[],sitemap=new Set(),checks=[];
for(const file of walkFiles(distDir).filter(x=>/sitemap[^/]*\.xml$/.test(x)))
 for(const match of readText(file).matchAll(/<loc>([^<]+)<\/loc>/g)){
  const u=normalizePathname(match[1]);if(u)sitemap.add(u);
 }
const serviceAreaCount=[...sitemap].filter(x=>x.startsWith('/รับซื้อ/')).length;
if(serviceAreaCount!==921)errors.push('Built 921 service-area URLs changed: '+serviceAreaCount);

for(const service of services)for(const area of provinces){
 const slug=service+'-'+area,route='/รับซื้อ/'+slug;
 const src=fs.readFileSync(path.join(process.cwd(),'src/content/serviceAreas',slug+'.md'),'utf8');
 const front=src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
 const htmlFile=pages.get(route),html=htmlFile?readText(htmlFile):'';
 const wrong=/\[[^\]\n]*ตารางราคาประเมิน[^\]\n]*\]\(\/บริการ\/รับซื้อ(?:ทีวี|เฟอร์นิเจอร์|เครื่องใช้ไฟฟ้า)\)/.test(src);
 if(wrong)errors.push(route+': CTA promises numeric buy-price table removed from parent');
 if(!front||!front[1].includes('slug: "'+slug+'"'))errors.push(route+': original slug missing');
 if(!src.includes('/บริการ/'+service))errors.push(route+': service parent link missing');
 if(!html||!sitemap.has(route))errors.push(route+': HTML/sitemap URL absent');
 if(html&&normalizePathname(extractCanonical(html))!==route)errors.push(route+': canonical changed');
 if(html&&/name=["']robots["'][^>]*noindex/i.test(html))errors.push(route+': noindex introduced');
 if(html&&!html.includes('line.me/ti/p/~@webuy'))errors.push(route+': LINE CTA missing');
 checks.push({route,hasFalsePriceTableCTA:wrong,hasHtml:Boolean(html)});
}
console.log('REGIONAL_PRICE_TABLE_LINK_QA '+JSON.stringify({pass:errors.length===0,checked:checks.length,serviceAreaCount,errors}));
if(errors.length)process.exitCode=1;
