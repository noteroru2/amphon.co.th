/**
 * 2026-11-11 issue #50 regional quality batch, GSC-first exact
 * source baseline, self-canonical and 921 sitemap regression.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, extractTitle, extractFirstH1, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';
const fixtures=[
  {
    "slug": "รับซื้อ-ups-สกลนคร",
    "clicks": 0,
    "impressions": 5,
    "title": "\"รับซื้อ UPS และเครื่องสำรองไฟ สกลนคร ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ UPS และเครื่องสำรองไฟ ใน สกลนคร ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-ups\"",
    "area": "\"สกลนคร\"",
    "before": 1660
  },
  {
    "slug": "รับซื้อ-ups-มหาสารคาม",
    "clicks": 0,
    "impressions": 3,
    "title": "\"รับซื้อ UPS และเครื่องสำรองไฟ มหาสารคาม ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ UPS และเครื่องสำรองไฟ ใน มหาสารคาม ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-ups\"",
    "area": "\"มหาสารคาม\"",
    "before": 1696
  },
  {
    "slug": "รับซื้อ-ups-ยโสธร",
    "clicks": 0,
    "impressions": 2,
    "title": "\"รับซื้อ UPS และเครื่องสำรองไฟ ยโสธร ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ UPS และเครื่องสำรองไฟ ใน ยโสธร ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-ups\"",
    "area": "\"ยโสธร\"",
    "before": 1648
  },
  {
    "slug": "รับซื้อ-ups-ชัยภูมิ",
    "clicks": 0,
    "impressions": 2,
    "title": "\"รับซื้อ UPS และเครื่องสำรองไฟ ชัยภูมิ ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ UPS และเครื่องสำรองไฟ ใน ชัยภูมิ ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-ups\"",
    "area": "\"ชัยภูมิ\"",
    "before": 1672
  },
  {
    "slug": "รับซื้อ-ups-บุรีรัมย์",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ UPS และเครื่องสำรองไฟ บุรีรัมย์ ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ UPS และเครื่องสำรองไฟ ใน บุรีรัมย์ ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-ups\"",
    "area": "\"บุรีรัมย์\"",
    "before": 1696
  },
  {
    "slug": "รับซื้อ-ups-มุกดาหาร",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ UPS และเครื่องสำรองไฟ มุกดาหาร ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ UPS และเครื่องสำรองไฟ ใน มุกดาหาร ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-ups\"",
    "area": "\"มุกดาหาร\"",
    "before": 1684
  },
  {
    "slug": "รับซื้อ-server-ร้อยเอ็ด",
    "clicks": 0,
    "impressions": 2,
    "title": "\"รับซื้อ Server และตู้ Rack ร้อยเอ็ด ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ Server และตู้ Rack ใน ร้อยเอ็ด ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้อ-server\"",
    "area": "\"ร้อยเอ็ด\"",
    "before": 1669
  },
  {
    "slug": "รับซื้ออุปกรณ์-network-ยโสธร",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ อุปกรณ์ Network และ Switch ยโสธร ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ อุปกรณ์ Network และ Switch ใน ยโสธร ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "service": "\"รับซื้ออุปกรณ์-network\"",
    "area": "\"ยโสธร\"",
    "before": 1737
  },
  {
    "slug": "รับซื้อคอมบริษัท-นครพนม",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ คอมบริษัท นครพนม ประเมินราคาเบื้องต้น\"",
    "description": "\"รับซื้อ คอมบริษัท ในนครพนม ประเมินราคาฟรี ส่งรูปเช็กราคาได้ ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว ติดต่อ Line @webuy โทร 0642579353\"",
    "service": "\"รับซื้อคอมบริษัท\"",
    "area": "\"นครพนม\"",
    "before": 5150
  },
  {
    "slug": "รับซื้อคอมบริษัท-มุกดาหาร",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ คอมบริษัท มุกดาหาร ประเมินราคาเบื้องต้น\"",
    "description": "\"รับซื้อ คอมบริษัท ในมุกดาหาร ประเมินราคาฟรี ส่งรูปเช็กราคาได้ ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว ติดต่อ Line @webuy โทร 0642579353\"",
    "service": "\"รับซื้อคอมบริษัท\"",
    "area": "\"มุกดาหาร\"",
    "before": 5141
  },
  {
    "slug": "รับซื้อคอมบริษัท-ยโสธร",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ คอมบริษัท ยโสธร ประเมินราคาเบื้องต้น\"",
    "description": "\"รับซื้อ คอมบริษัท ในยโสธร ประเมินราคาฟรี ส่งรูปเช็กราคาได้ ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว ติดต่อ Line @webuy โทร 0642579353\"",
    "service": "\"รับซื้อคอมบริษัท\"",
    "area": "\"ยโสธร\"",
    "before": 5105
  },
  {
    "slug": "รับซื้อคอมบริษัท-สกลนคร",
    "clicks": 0,
    "impressions": 1,
    "title": "\"รับซื้อ คอมบริษัท สกลนคร ประเมินราคาเบื้องต้น\"",
    "description": "\"รับซื้อ คอมบริษัท ในสกลนคร ประเมินราคาฟรี ส่งรูปเช็กราคาได้ ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว ติดต่อ Line @webuy โทร 0642579353\"",
    "service": "\"รับซื้อคอมบริษัท\"",
    "area": "\"สกลนคร\"",
    "before": 5301
  }
];
const pages=collectBuiltPages(),errors=[],checks=[];
const check=(condition,msg)=>{if(!condition)errors.push(msg);};
const fmField=(front,key)=>front.match(new RegExp('^'+key+':\\s*(.+)$','m'))?.[1]||'';
const sitemap=new Set();
for(const file of walkFiles(distDir).filter(p=>/sitemap[^/]*\.xml$/.test(p)))
 for(const m of readText(file).matchAll(/<loc>([^<]+)<\/loc>/g)){const u=normalizePathname(m[1]);if(u)sitemap.add(u);}
const serviceCount=[...sitemap].filter(x=>x.startsWith('/รับซื้อ/')).length;
check(serviceCount===921,'Existing 921 service pages changed: '+serviceCount);
const provinces=['กาฬสินธุ์','ขอนแก่น','ชัยภูมิ','นครพนม','นครราชสีมา','บึงกาฬ','บุรีรัมย์','มหาสารคาม','มุกดาหาร','ยโสธร','ร้อยเอ็ด','ศรีสะเกษ','สกลนคร','สุรินทร์','หนองคาย','หนองบัวลำภู','อำนาจเจริญ','อุดรธานี','อุบลราชธานี','เลย'];
function tokens(body){
 for(const p of provinces)body=body.replaceAll(p,'_พื้นที่_');
 body=body.replace(/<[^>]*>/g,' ').replace(/!?\[[^\]]*\]\([^)]*\)/g,' ').replace(/[*_#>]/g,' ').replace(/\s+/g,'').slice(0,5000).toLowerCase();
 const a=new Set();for(let i=0;i+9<body.length;i+=9)a.add(body.slice(i,i+9));return a;
}
function similarity(a,b){let hit=0;for(const x of a)if(b.has(x))hit++;return a.size+b.size?2*hit/(a.size+b.size):0;}
for(const f of fixtures){
 const srcPath=path.join(process.cwd(),'src/content/serviceAreas',f.slug+'.md');
 const src=readText(srcPath),m=src.match(/^---\r?\n([\s\S]*?)\r?\n---/),front=m?.[1]||'',body=m?src.slice(m[0].length):src;
 const route='/รับซื้อ/'+f.slug,fp=pages.get(route),html=fp?readText(fp):'';
 check(Boolean(m),route+': missing frontmatter');
 for(const [k,v] of [['title',f.title],['description',f.description],['serviceSlug',f.service],['areaSlug',f.area]])
  check(fmField(front,k)===v,route+': protected '+k+' changed');
 check(fmField(front,'slug')==='"'+f.slug+'"',route+': protected slug changed');
 check(src.length>f.before+(f.slug.startsWith('รับซื้อคอมบริษัท')?900:340),route+': insufficient original editorial detail');
 check(body.includes('## วิธีประเมิน'),route+': unique product guide missing');
 check(body.includes('ชยางกูร 32')&&body.includes('09:00–19:00'),route+': verified storefront not disclosed');
 check(body.includes('เจ้าหน้าที่ตอบตามคิวงาน')&&body.includes('24 ชั่วโมง'),route+': 24-hour LINE message intake not distinguished');
 check(body.includes('ไม่ใช่ประวัติการรับซื้อจริง'),route+': unsupported real-case claims not disclaimed');
 check(!body.includes('ชยางกูร 42')&&!/รับถึงบ้านทุกจังหวัด|รับประกันราคาสูงสุด/.test(body),route+': unsupported guarantee');
 check(Boolean(fp)&&sitemap.has(route),route+': built/indexable route missing');
 if(html){
  check(normalizePathname(extractCanonical(html))===route,route+': canonical mismatch');
  check((html.match(/<h1\b/gi)||[]).length===1,route+': H1 count changed');
  check(Boolean(extractTitle(html))&&Boolean(extractFirstH1(html)),route+': missing title or H1');
  check(!/name=["']robots["'][^>]*noindex/i.test(html),route+': noindex introduced');
  check(html.includes('line.me/ti/p/~@webuy'),route+': LINE CTA missing');
  check(html.includes('วิธีประเมิน'),route+': new guide not visible');
 }
 const group=f.slug.replace(/-[^-]+$/,'');
 const others=fs.readdirSync(path.dirname(srcPath)).filter(x=>x.startsWith(group+'-')&&x.endsWith('.md')&&x!==f.slug+'.md');
 const a=tokens(body),max=others.reduce((best,p)=>{
  const other=readText(path.join(path.dirname(srcPath),p)).replace(/^---\r?\n[\s\S]*?\r?\n---/,'');
  return Math.max(best,similarity(a,tokens(other)));
 },0);
 // Existing corporate pages are already long and differentiated; enforce
 // no new high-dup risk for all 12 URL candidate pages.
 check(max<0.87,route+': sibling near-duplicate '+max.toFixed(3));
 checks.push({route,baselineImpressions:f.impressions,oldChars:f.before,newChars:src.length,maxSiblingSimilarity:+max.toFixed(3)});
}
const result={pass:errors.length===0,urls:checks.length,gscReportedClicks:fixtures.reduce((s,f)=>s+f.clicks,0),gscReportedImpressions:fixtures.reduce((s,f)=>s+f.impressions,0),sitemapServiceAreaCount:serviceCount,errors,checks};
console.log('ISSUE50_GSC_REGIONAL_QA '+JSON.stringify(result));
if(errors.length)process.exitCode=1;
