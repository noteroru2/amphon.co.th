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

const config=readText(path.join(process.cwd(),'src/config/site.ts'));
check(config.includes("legalName: 'บริษัท อำพล เทรดดิ้ง จำกัด'"), 'Canonical legal entity not correct');
check(config.includes("openingHours: ['Mo-Su 09:00-19:00']"), 'OpeningHours schema config must use 09-19');
check(config.includes("landmark: 'ติดปากซอยชยางกูร 32'"), 'Missing owner-verified Soi 32 landmark');
const contact=html('/contact');
const ubon=html('/รับซื้อ/รับซื้อโน๊ตบุ๊ค-อุบลราชธานี');
for(const [name,doc] of [['contact',contact],['ubon-notebook',ubon],['home',html('/')]]){
 check(doc.includes('09:00–19:00'),name+': must visibly disclose correct store hours');
 check(doc.includes('ชยางกูร 32'),name+': must disclose exact Soi 32 landmark');
 check(!doc.includes('ชยางกูร 42'),name+': wrong Soi 42 landmark remains');
}
check(contact.includes('24 ชั่วโมง') && contact.includes('@webuy'), '24h LINE contact must be distinct from 09-19 store');
check(contact.includes('เจ้าหน้าที่ตอบตามคิว'), '24h intake must not assert 24h staffed response');
check(about.includes('บริษัท อำพล เทรดดิ้ง จำกัด'), 'About must disclose confirmed legal entity');

/** Stronger gate: validate the *rendered* JSON-LD rather than source config alone. */
function jsonLdObjects(html,route){
 const nodes=[];
 for(const match of html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{
   const json=JSON.parse(match[1]);
   for(const node of Array.isArray(json)?json:[json]){
    if(Array.isArray(node['@graph']))nodes.push(...node['@graph']);
    else nodes.push(node);
   }
  }catch(e){check(false,route+': invalid JSON-LD '+String(e));}
 }
 check(nodes.length>0,route+': no rendered JSON-LD nodes');
 return nodes;
}
for(const route of ['/','/contact','/about','/บริการ/รับซื้อโน๊ตบุ๊ค','/บริการ/รับซื้อคอมพิวเตอร์','/บริการ/รับซื้อ-macbook']){
 const nodes=jsonLdObjects(html(route),route);
 const local=nodes.find(n=>Array.isArray(n['@type'])?n['@type'].includes('LocalBusiness'):n['@type']==='LocalBusiness');
 const org=nodes.find(n=>n['@type']==='Organization');
 check(Boolean(local),route+': missing LocalBusiness JSON-LD entity');
 check(Boolean(org),route+': missing Organization JSON-LD entity');
 if(org)check(org.legalName==='บริษัท อำพล เทรดดิ้ง จำกัด',route+': legalName not owner-confirmed');
 if(local){
  check(local.address?.streetAddress==='740/8 ถนนชยางกูร',route+': wrong storefront address');
  check(local.address?.addressRegion==='อุบลราชธานี',route+': storefront is not in Ubon');
  check(local.address?.postalCode==='34000',route+': invalid postal code');
  check(Boolean(local.hasMap),route+': hasMap missing');
  check((local.openingHoursSpecification||[]).some(x=>x.opens==='09:00'&&x.closes==='19:00'),route+': wrong store opening hours in rendered schema');
  check(!JSON.stringify(local).includes('"opens":"00:00"'),route+': 24h store claim');
  check(local.parentOrganization?.['@id']===org?.['@id'],route+': business is not linked to legal organization');
 }
}
console.log('BRAND_EVIDENCE_QA '+JSON.stringify({pass:!fail.length,errors:fail,guideRoutes:guide.map(x=>x[0])}));
if(fail.length)process.exitCode=1;
