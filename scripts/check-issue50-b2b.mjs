/**
 * Issue #50 B2B auction/company/lot trust regression.
 * Exact source baseline protects intent-bearing meta, sitemap and canonical.
 * The primary "รับเหมาประมูลอุปกรณ์ไอที" meta description is intentionally
 * corrected to remove an unsupported certified data management assertion.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectBuiltPages, distDir, extractCanonical, extractTitle, extractFirstH1, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';
const fixtures=[
  {
    "slug": "รับเหมาประมูลอุปกรณ์ไอที",
    "path": "src/content/services/รับเหมาประมูลอุปกรณ์ไอที.md",
    "route": "/บริการ/รับเหมาประมูลอุปกรณ์ไอที",
    "title": "\"รับเหมาประมูลอุปกรณ์ไอที (IT Bidding) คอมพิวเตอร์องค์กร\"",
    "description": "\"รับเหมาประมูลอุปกรณ์ไอที B2B โละคอมพิวเตอร์องค์กร เซิร์ฟเวอร์ เน็ตเวิร์ค ประเมินตามสภาพจริง ประเมินเบื้องต้นได้ พร้อมบริการจัดการข้อมูลด้วยขั้นตอนที่เป็นระบบและตรวจสอบย้อนหลังได้\"",
    "sourceBefore": 10602
  },
  {
    "slug": "รับประมูลคอมพิวเตอร์มือสอง",
    "path": "src/content/services/รับประมูลคอมพิวเตอร์มือสอง.md",
    "route": "/บริการ/รับประมูลคอมพิวเตอร์มือสอง",
    "title": "\"รับประมูลคอมพิวเตอร์มือสอง อุปกรณ์ไอทียกล็อตทั่วประเทศ\"",
    "description": "\"รับประมูลคอมพิวเตอร์มือสอง ครุภัณฑ์คอมพิวเตอร์ ซากอุปกรณ์ไอที และสินค้าไอทียกล็อตทั่วประเทศ ส่งรายการประเมินเบื้องต้นได้\"",
    "sourceBefore": 12630
  },
  {
    "slug": "รับซื้อคอมบริษัท",
    "path": "src/content/services/รับซื้อคอมบริษัท.md",
    "route": "/บริการ/รับซื้อคอมบริษัท",
    "title": "\"รับซื้อคอมบริษัท โน้ตบุ๊กพนักงาน และเครื่ององค์กรปลดระวาง\"",
    "description": "\"รับซื้อคอมบริษัทและโน้ตบุ๊กพนักงานเก่า บริษัทส่งรายการรุ่น จำนวน สเปก สภาพเครื่อง และสถานที่ตั้ง เพื่อประเมินราคาเบื้องต้นได้ทั่วประเทศ\"",
    "sourceBefore": 5884
  },
  {
    "slug": "รับซื้อคอมยกล็อต",
    "path": "src/content/services/รับซื้อคอมยกล็อต.md",
    "route": "/บริการ/รับซื้อคอมยกล็อต",
    "title": "\"รับซื้อคอมยกล็อต เหมาคอมพิวเตอร์และสินค้าไอทีหลายเครื่อง\"",
    "description": "\"รับซื้อคอมยกล็อตและสินค้าไอทีหลายเครื่อง บริษัทหรือร้านค้าส่ง Inventory List รุ่น จำนวน สภาพ และสถานที่ตั้ง เพื่อประเมินราคาเบื้องต้นได้\"",
    "sourceBefore": 4160
  },
  {
    "slug": "รับซื้อสินค้าไอทีบริษัท",
    "path": "src/content/services/รับซื้อสินค้าไอทีบริษัท.md",
    "route": "/บริการ/รับซื้อสินค้าไอทีบริษัท",
    "title": "\"รับซื้อสินค้าไอทีบริษัททั่วประเทศ ส่งรายการประเมินราคาเบื้องต้น\"",
    "description": "\"รับซื้อสินค้าไอทีบริษัทและองค์กร เช่น คอม โน้ตบุ๊ก จอ Printer UPS Network Server NAS มือถือ แท็บเล็ต และอุปกรณ์สำนักงานไอที ส่งรายการหรือรูปเพื่อประเมินราคาเบื้องต้นได้ มีหน้าร้านจริงที่อุบลราชธานี\"",
    "sourceBefore": 7514
  },
  {
    "slug": "รับซื้อคอมบริษัทปิดกิจการ",
    "path": "src/content/services/รับซื้อคอมบริษัทปิดกิจการ.md",
    "route": "/บริการ/รับซื้อคอมบริษัทปิดกิจการ",
    "title": "\"รับซื้อคอมบริษัทปิดกิจการ เคลียร์ออฟฟิศทั่วประเทศ\"",
    "description": "\"รับซื้อคอมบริษัทปิดกิจการ ปิดสาขา ย้ายออฟฟิศ หรือเคลียร์ทรัพย์สินไอทีทั่วประเทศ ส่งรูปหรือรายการเครื่องเพื่อประเมินราคาเบื้องต้นได้\"",
    "sourceBefore": 12228
  },
  {
    "slug": "รับเหมาประมูลอุปกรณ์ไอที-ชัยภูมิ",
    "path": "src/content/serviceAreas/รับเหมาประมูลอุปกรณ์ไอที-ชัยภูมิ.md",
    "route": "/รับซื้อ/รับเหมาประมูลอุปกรณ์ไอที-ชัยภูมิ",
    "title": "\"รับซื้อ อุปกรณ์ไอทีบริษัทและประมูล ชัยภูมิ ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ อุปกรณ์ไอทีบริษัทและประมูล ใน ชัยภูมิ ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "sourceBefore": 1769
  },
  {
    "slug": "รับเหมาประมูลอุปกรณ์ไอที-อุบลราชธานี",
    "path": "src/content/serviceAreas/รับเหมาประมูลอุปกรณ์ไอที-อุบลราชธานี.md",
    "route": "/รับซื้อ/รับเหมาประมูลอุปกรณ์ไอที-อุบลราชธานี",
    "title": "\"รับซื้อ อุปกรณ์ไอทีบริษัทและประมูล อุบลราชธานี ประเมินราคาฟรี นัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "description": "\"รับซื้อ อุปกรณ์ไอทีบริษัทและประมูล ใน อุบลราชธานี ประเมินราคาตามประเภท รุ่น สเปก สภาพ จำนวน และความต้องการตลาด ประเมินราคาฟรีผ่าน Line ชำระเงินหลังตรวจสอบสินค้าและตกลงราคาเรียบร้อยแล้ว มีบริการนัดรับหรือประสานขนส่งตามข้อตกลง\"",
    "sourceBefore": 1817
  }
];
const heading=[
 '## แยกงานประมูลตามสิทธิ์และขั้นตอนจริง',
 '## งานประมูลจริงต่างจากการเสนอขายล็อตคอมอย่างไร',
 '## ตัวอย่างแบ่งคอมบริษัทก่อนตีราคา',
 '## อย่าเหมาราคาคอมทุกเครื่องในล็อตเดียวกัน',
 '## เลือกหน้าให้ตรงความต้องการ',
 '## วันปิดสำนักงาน',
 '## สินทรัพย์ IT จากหลายสำนักงานและสิทธิ์เสนอขาย',
 '## ล็อตครุภัณฑ์องค์กรในจังหวัดที่มีหน้าร้านจริง'
];
const pages=collectBuiltPages(),errors=[],checks=[];
const check=(ok,m)=>{if(!ok)errors.push(m);};
const fmField=(s,k)=>s.match(new RegExp('^'+k+':\\s*(.*)$','m'))?.[1]||'';
const siteSitemap=new Set();
for(const f of walkFiles(distDir).filter(x=>/sitemap[^/]*\.xml$/.test(x)))
 for(const m of readText(f).matchAll(/<loc>([^<]+)<\/loc>/g)){let p=normalizePathname(m[1]);if(p)siteSitemap.add(p);}
check([...siteSitemap].filter(x=>x.startsWith('/รับซื้อ/')).length===921,'921 existing /รับซื้อ/ sitemap routes changed');
for(const [idx,f] of fixtures.entries()){
 const text=readText(path.join(process.cwd(),f.path));
 const fm=text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]||'';
 check(fmField(fm,'title')===f.title,f.path+': protected title changed');
 if(idx!==0)check(fmField(fm,'description')===f.description,f.path+': protected description changed');
 check(fmField(fm,'slug')==='"'+f.slug+'"',f.path+': slug changed');
 check(text.length>f.sourceBefore+450,f.path+': content not substantially improved');
 check(text.includes(heading[idx]),f.path+': missing unique B2B editorial guide');
 const built=pages.get(f.route),html=built?readText(built):'';
 check(Boolean(built),f.route+': page missing from build');
 check(siteSitemap.has(f.route),f.route+': sitemap entry missing');
 if(html){
  check(normalizePathname(extractCanonical(html))===f.route,f.route+': canonical changed');
  check((html.match(/<h1\b/gi)||[]).length===1,f.route+': expected 1x H1');
  check(Boolean(extractTitle(html))&&Boolean(extractFirstH1(html)),f.route+': meta/H1 absent');
  check(!/name=["']robots["'][^>]*noindex/i.test(html),f.route+': noindex inserted');
  check(html.includes('line.me/ti/p/~@webuy'),f.route+': LINE CTA missing');
  check(html.includes('ประมูล')||html.includes('Inventory List'),f.route+': B2B topic missing in output');
 }
 checks.push({route:f.route,source:text.length,rendered:!!built,canonical:extractCanonical(html)});
}
const auction=readText(path.join(process.cwd(),fixtures[0].path));
check(!auction.includes('องค์กรชั้นนำเลือก'), 'Unsourced industry-leading clients claim remains');
check(!auction.includes('เราจะทำการชำระเงินเต็มจำนวน'), 'Unverified upfront full-payment promise remains');
check(!auction.includes('เรานำไปจัดการรีไซเคิลและคัดแยกอย่างถูกวิธี'), 'Unverified recycling claim remains');
check(!auction.includes('เครือข่ายขนส่งครอบคลุมในการรับงานประมูลทั่วประเทศ'), 'Unverified nationwide bidding pickup guarantee remains');
check(auction.includes('ไม่ใช่รายงานผู้ประเมินทรัพย์สิน'), 'Must disclose proposal is not certified valuation');
check(auction.includes('ตัวอย่าง Inventory List'), 'Synthetic example required');
const out={pass:errors.length===0,count:fixtures.length,sitemapServiceAreas:921,errors,checks};
console.log('ISSUE50_B2B_AUDIT_QA '+JSON.stringify(out));
if(errors.length)process.exitCode=1;
