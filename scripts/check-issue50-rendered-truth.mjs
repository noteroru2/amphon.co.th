/**
 * P0 protection: single legally identified storefront and honest remote seller
 * intake across every indexable service×province URL. Does not alter indexability.
 */
import { collectBuiltPages, distDir, extractCanonical, normalizePathname, readText, walkFiles } from './lib/site-audit.mjs';
const pages=collectBuiltPages(),errors=[],checked=[];
const check=(a,msg)=>{if(!a)errors.push(msg);};
const sitemap=new Set();
for(const fn of walkFiles(distDir).filter(x=>/sitemap[^/]*\.xml$/.test(x)))
 for(const m of readText(fn).matchAll(/<loc>([^<]+)<\/loc>/g)){const p=normalizePathname(m[1]);if(p)sitemap.add(p);}
for(const [route,fn] of pages) {
 if(!route.startsWith('/รับซื้อ/'))continue;
 const html=readText(fn);
 check(sitemap.has(route),route+': missing sitemap');
 check(normalizePathname(extractCanonical(html))===route,route+': canonical changed');
 check(!/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html),route+': now noindex');
 check(html.includes('regional-intake-disclosure'),route+': truthful intake disclosure missing');
 check(html.includes('บริษัท อำพล เทรดดิ้ง จำกัด'),route+': legal operating company missing');
 check(html.includes('ชยางกูร 32')&&html.includes('09:00–19:00'),route+': correct location/hours missing');
 check(html.includes('LINE @webuy'),route+': LINE contact missing');
 check(html.includes('รับข้อความ ไม่ใช่เจ้าหน้าที่ตอบตลอด 24 ชั่วโมง'),route+': 24h message intake vs staffed response missing');
 check(html.includes('ยืนยันวิธีตรวจรับ'),route+': pickup promise not corrected');
 check(!html.includes('ชยางกูร 42'),route+': outdated Soi 42 text remains');
 checked.push(route);
}
check(checked.length===921,'expected 921 indexed service pages, found '+checked.length);
const out={pass:errors.length===0,checked:checked.length,errors:errors.slice(0,40),totalErrors:errors.length};
console.log('ISSUE50_RENDERED_STORE_TRUTH_QA '+JSON.stringify(out));
if(errors.length)process.exitCode=1;
