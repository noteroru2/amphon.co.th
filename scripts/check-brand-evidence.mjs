/**
 * PR release gate: brand identity and three buying-guide evidence sections.
 * No verification of actual private transaction histories is implied.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, normalizePathname, extractCanonical, readText } from './lib/site-audit.mjs';
const pages=collectBuiltPages(),fail=[];
const check=(ok,msg)=>{if(!ok)fail.push(msg);};
const html=route=>{const f=pages.get(route);check(Boolean(f),'Missing built route: '+route);return f?readText(f):'';};
const guide=[
 ['/บริการ/รับซื้อโน๊ตบุ๊ค','หลักฐานหน้าร้านและวิธีตรวจสเปก','amphon-trading-storefront-ubon.webp'],
 ['/บริการ/รับซื้อคอมพิวเตอร์','หลักฐานหน้าร้านและวิธีแยกมูลค่าชิ้นส่วนคอม','amphon-trading-shop-showroom.webp'],
 ['/บริการ/รับซื้อ-macbook','หลักฐานสถานที่และเกณฑ์ตรวจ MacBook','amphon-trading-storefront-ubon.webp'],
];
for(const [route,heading,photo] of guide){
 const page=html(route);
 check(page.includes(heading),route+': evidence heading missing');
 check(page.includes(photo),route+': published storefront photo missing');
 check(page.includes('ไม่ใช่') && page.includes('ข้อมูล'),route+': explicit evidence limitation missing');
 check(normalizePathname(extractCanonical(page))===route,route+': canonical changed');
}
const about=html('/about');
for(const domain of ['webuy.in.th','buyhubthai.com','shop.amphon.co.th','amphontd.com'])check(about.includes(domain),'About does not disclose '+domain);
check(!about.includes('ลูกค้ากว่าร้อยราย'), 'Unsourced customer count remains on About');
check(!about.includes('ใหญ่และน่าเชื่อถือที่สุด'), 'Unsourced largest trust claim remains on About');
const llmsPath=path.join(distDir,'llms.txt');
check(fs.existsSync(llmsPath),'Missing public llms.txt');
if(fs.existsSync(llmsPath)){
 const content=readText(llmsPath);
 check(content.length<14000,'LLMS discovery guide should be concise');
 check(content.includes('56 หน้า'),'LLMS guide must identify 56 city/province hubs');
 check(content.includes('อุบลราชธานี'),'LLMS guide must disclose actual physical store');
 check(!content.includes('20 จังหวัดภาคอีสาน'),'Old 20-province fact must be removed');
 check(content.includes('WEBUY HUB'),'Sister-channel identity missing');
}
console.log('BRAND_EVIDENCE_QA '+JSON.stringify({pass:!fail.length,errors:fail,guideRoutes:guide.map(x=>x[0])}));
if(fail.length)process.exitCode=1;
