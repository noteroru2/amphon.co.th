/**
 * Protected-traffic editorial regression. Keeps 12 existing URL owner pages
 * indexable and preserves their pre-patch title/description for CTR protection.
 * Checks rendered HTML and the post-build 921 URL sitemap census.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, extractFirstH1, extractTitle, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';

const fixtures = [
  {
    "slug": "รับซื้อเครื่องใช้ไฟฟ้า-อุดรธานี",
    "clicks": 36,
    "impressions": 462,
    "title": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง อุดรธานี ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ใน อุดรธานี ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเครื่องใช้ไฟฟ้า\"",
    "areaSlug": "\"อุดรธานี\"",
    "baselineLength": 3355
  },
  {
    "slug": "รับซื้อเครื่องใช้ไฟฟ้า-ร้อยเอ็ด",
    "clicks": 29,
    "impressions": 284,
    "title": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ร้อยเอ็ด ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ใน ร้อยเอ็ด ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเครื่องใช้ไฟฟ้า\"",
    "areaSlug": "\"ร้อยเอ็ด\"",
    "baselineLength": 3180
  },
  {
    "slug": "รับซื้อเครื่องใช้ไฟฟ้า-ขอนแก่น",
    "clicks": 27,
    "impressions": 419,
    "title": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ขอนแก่น ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ใน ขอนแก่น ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเครื่องใช้ไฟฟ้า\"",
    "areaSlug": "\"ขอนแก่น\"",
    "baselineLength": 3096
  },
  {
    "slug": "รับซื้อเครื่องใช้ไฟฟ้า-หนองคาย",
    "clicks": 15,
    "impressions": 116,
    "title": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง หนองคาย ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ใน หนองคาย ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเครื่องใช้ไฟฟ้า\"",
    "areaSlug": "\"หนองคาย\"",
    "baselineLength": 3369
  },
  {
    "slug": "รับซื้อเครื่องใช้ไฟฟ้า-อุบลราชธานี",
    "clicks": 12,
    "impressions": 55,
    "title": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง อุบลราชธานี ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เครื่องใช้ไฟฟ้ามือสอง ใน อุบลราชธานี ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเครื่องใช้ไฟฟ้า\"",
    "areaSlug": "\"อุบลราชธานี\"",
    "baselineLength": 2982
  },
  {
    "slug": "รับซื้อทีวี-อุดรธานี",
    "clicks": 21,
    "impressions": 174,
    "title": "\"รับซื้อ ทีวีและโทรทัศน์ อุดรธานี ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ ทีวีและโทรทัศน์ ใน อุดรธานี ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อทีวี\"",
    "areaSlug": "\"อุดรธานี\"",
    "baselineLength": 1630
  },
  {
    "slug": "รับซื้อทีวี-ศรีสะเกษ",
    "clicks": 9,
    "impressions": 72,
    "title": "\"รับซื้อ ทีวีและโทรทัศน์ ศรีสะเกษ ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ ทีวีและโทรทัศน์ ใน ศรีสะเกษ ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อทีวี\"",
    "areaSlug": "\"ศรีสะเกษ\"",
    "baselineLength": 1630
  },
  {
    "slug": "รับซื้อทีวี-บุรีรัมย์",
    "clicks": 7,
    "impressions": 38,
    "title": "\"รับซื้อ ทีวีและโทรทัศน์ บุรีรัมย์ ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ ทีวีและโทรทัศน์ ใน บุรีรัมย์ ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อทีวี\"",
    "areaSlug": "\"บุรีรัมย์\"",
    "baselineLength": 1642
  },
  {
    "slug": "รับซื้อทีวี-สกลนคร",
    "clicks": 7,
    "impressions": 37,
    "title": "\"รับซื้อ ทีวีและโทรทัศน์ สกลนคร ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ ทีวีและโทรทัศน์ ใน สกลนคร ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อทีวี\"",
    "areaSlug": "\"สกลนคร\"",
    "baselineLength": 1606
  },
  {
    "slug": "รับซื้อเฟอร์นิเจอร์-อุบลราชธานี",
    "clicks": 29,
    "impressions": 222,
    "title": "\"รับซื้อ เฟอร์นิเจอร์มือสอง อุบลราชธานี ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เฟอร์นิเจอร์มือสอง ใน อุบลราชธานี ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเฟอร์นิเจอร์\"",
    "areaSlug": "\"อุบลราชธานี\"",
    "baselineLength": 2663
  },
  {
    "slug": "รับซื้อเฟอร์นิเจอร์-อุดรธานี",
    "clicks": 12,
    "impressions": 147,
    "title": "\"รับซื้อ เฟอร์นิเจอร์และของย้ายบ้าน อุดรธานี ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เฟอร์นิเจอร์และของย้ายบ้าน ใน อุดรธานี ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเฟอร์นิเจอร์\"",
    "areaSlug": "\"อุดรธานี\"",
    "baselineLength": 1761
  },
  {
    "slug": "รับซื้อเฟอร์นิเจอร์-ขอนแก่น",
    "clicks": 2,
    "impressions": 15,
    "title": "\"รับซื้อ เฟอร์นิเจอร์และของย้ายบ้าน ขอนแก่น ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ เฟอร์นิเจอร์และของย้ายบ้าน ใน ขอนแก่น ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "serviceSlug": "\"รับซื้อเฟอร์นิเจอร์\"",
    "areaSlug": "\"ขอนแก่น\"",
    "baselineLength": 1749
  }
];
const root=process.cwd(), pages=collectBuiltPages(),errs=[],metrics=[];
const check=(ok,message)=>{if(!ok)errs.push(message);};
const locs=new Set();
for(const file of walkFiles(distDir).filter(p=>/sitemap[^/]*\.xml$/.test(p)))
 for(const m of readText(file).matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const p=normalizePathname(m[1]);if(p)locs.add(p);
 }
check([...locs].filter(x=>x.startsWith('/รับซื้อ/')).length===921,'Changed existing 921 service-area URL count');
function field(fm,key){return fm.match(new RegExp('^'+key+':\\s*(.+)$','m'))?.[1]||'';}
function shingle(s){
 const provinces=['กาฬสินธุ์','ขอนแก่น','ชัยภูมิ','นครพนม','นครราชสีมา','บึงกาฬ','บุรีรัมย์','มหาสารคาม','มุกดาหาร','ยโสธร','ร้อยเอ็ด','ศรีสะเกษ','สกลนคร','สุรินทร์','หนองคาย','หนองบัวลำภู','อำนาจเจริญ','อุดรธานี','อุบลราชธานี','เลย'];
 for(const x of provinces)s=s.replaceAll(x,'_พื้นที่_');
 s=s.replace(/<[^>]*>/g,' ').replace(/!?\[[^\]]*\]\([^)]*\)/g,' ').replace(/[*_#>]/g,' ').replace(/\s+/g,' ').trim().toLowerCase().replace(/\s/g,'').slice(0,5000);
 const set=new Set();for(let i=0;i+9<s.length;i+=9)set.add(s.slice(i,i+9));return set;
}
function similarity(a,b){let n=0;for(const x of a)if(b.has(x))n++;return a.size+b.size?2*n/(a.size+b.size):0;}
for(const f of fixtures){
 const route='/รับซื้อ/'+f.slug;
 const filename=path.join(root,'src/content/serviceAreas',f.slug+'.md');
 const text=readText(filename),match=text.match(/^---\r?\n([\s\S]*?)\r?\n---/u),fm=match?.[1]||'';
 const body=match?text.slice(match[0].length):text, rendered=pages.get(route),html=rendered?readText(rendered):'';
 const m={route,clicks_28d:f.clicks,impressions_28d:f.impressions,oldLength:f.baselineLength,newLength:text.length,maxSimilarity:0};
 check(!!match,route+' frontmatter lost');
 for(const key of ['title','description','serviceSlug','areaSlug'])check(field(fm,key)===f[key],route+' '+key+' changed from protected baseline');
 check(field(fm,'slug')==='"'+f.slug+'"',route+' slug changed');
 check(text.length>=f.baselineLength+1350,route+' did not receive meaningful editorial addition');
 check(body.includes('## แนวทางตรวจเพิ่มเติมสำหรับ'),route+' missing unique buyer guide');
 check(body.includes('หมายเหตุ: เนื้อหานี้เป็นแนวทางช่วยเตรียมข้อมูล') && body.includes('ไม่ใช่หลักฐานการรับซื้อจริง'),route+' risk/evidence disclosure missing');
 check(body.includes('เจ้าหน้าที่ตอบตามคิว') && body.includes('24 ชั่วโมง'),route+' honest LINE availability missing');
 check(body.includes('ชยางกูร 32') && body.includes('09:00–19:00'),route+' owner verified NAP missing');
 check(!/รับถึงบ้านทุกจังหวัด|มีสาขาประจำจังหวัด|จ่ายเงินทันทีทุกกรณี/.test(body.replaceAll('ไม่มีสาขาประจำจังหวัด', '')),route+' unsupported geography or payment promise');
 check(!!rendered && locs.has(route),route+' not built or sitemap missing');
 if(html){
  check(normalizePathname(extractCanonical(html))===route,route+' canonical changed');
  check((html.match(/<h1\b/gi)||[]).length===1,route+' one H1 required');
  check(extractFirstH1(html)!==''&&extractTitle(html)!=='',route+' missing rendered headings/meta');
  check(!/name=["']robots["'][^>]*noindex/i.test(html),route+' indexability changed');
  check(html.includes('line.me/ti/p/~@webuy'),route+' LINE contact missing');
  check(html.includes('แนวทางตรวจเพิ่มเติม'),route+' rendered material not visible');
 }
 const group=f.slug.replace(/-[^-]+$/,'');
 const others=fs.readdirSync(path.dirname(filename)).filter(x=>x.startsWith(group+'-')&&x.endsWith('.md')&&x!==f.slug+'.md');
 const keyset=shingle(body);
 for(const fn of others){
  const other=readText(path.join(path.dirname(filename),fn)).replace(/^---\r?\n[\s\S]*?\r?\n---/u,'');
  m.maxSimilarity=Math.max(m.maxSimilarity,similarity(keyset,shingle(other)));
 }
 m.maxSimilarity=+m.maxSimilarity.toFixed(3);
 check(m.maxSimilarity<0.87,route+' still near-duplicate at '+m.maxSimilarity);
 metrics.push(m);
}
const clicks=fixtures.reduce((n,f)=>n+f.clicks,0),impressions=fixtures.reduce((n,f)=>n+f.impressions,0);
console.log('HIGH_TRAFFIC_BATCH_QA '+JSON.stringify({pass:errs.length===0,count:metrics.length,baselineGscClicks:clicks,baselineGscImpressions:impressions,errors:errs,metrics}));
if(errs.length)process.exitCode=1;
