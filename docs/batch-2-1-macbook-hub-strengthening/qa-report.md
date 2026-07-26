# Batch 2.1 QA Report

วันที่ตรวจ: 2026-07-26

Verdict: **PASS WITH WARNING**

## Targeted technical QA — PASS

- ตรวจ built HTML 14 routes: Hub 1, child services 8 และ blogs 5
- ทุก target route มีไฟล์ `index.html`
- ทุก target route มี Title และ meta description
- ทุก target routeมี H1 เท่ากับ 1
- ทุก target route self-canonical ถูกต้อง
- ไม่พบ broken internal link จาก 14 target routes
- Hub มี 8 unique MacBook child destinations อยู่ในเกณฑ์ 8–14
- child pages ทั้ง 8 มีลิงก์กลับ Hub
- Intel, M1, M2, M3/M4, เสีย และจอแตกมี modifier-specific cross-links หลังปรับ
- seller guide มี Hub CTA เพียง 1 ลิงก์ และไม่มีลิงก์ไปหน้า location
- MacBook blogs ทั้ง 5 หน้ามีลิงก์เข้า Hub ด้วย contextual anchor
- Hub มี 2 ตาราง และมี `.table-scroll` wrapper
- JSON-LD ของ Hub มี FAQPage จาก visible FAQ เดิม
- ไม่พบ `aggregateRating` หรือ review schema ใน target routes
- ไม่เปลี่ยน slug, redirect, noindex หรือ canonical code path
- ไม่แตะ service-area, iPad หรือ iPhone files

## Responsive/browser QA — PASS

ทดสอบ built HTML ผ่าน local static server:

- Desktop viewport 1440×1000: ไม่มี document-level horizontal overflow
- Mobile viewport requested 390×844 (browser content width 375px): ไม่มี document-level horizontal overflow
- ตารางบนมือถือ: wrapper `overflow-x: auto`, client width 351px, scroll width 560px และมี aria-label
- ตรวจภาพ top section บน desktop และ mobile แล้ว ไม่พบข้อความล้น การ์ดทับกัน หรือ CTA หลุด viewport
- ตรวจภาพตาราง mobile แล้ว ตารางอยู่ภายใน scroll region และมีข้อความแนะนำให้เลื่อนซ้าย–ขวา

Screenshot artifacts:

- `C:\Users\User\.codex\visualizations\2026\07\25\019f98c4-75d3-7583-8a7f-2daa5b2c267a\macbook-hub-desktop-top.png`
- `C:\Users\User\.codex\visualizations\2026\07\25\019f98c4-75d3-7583-8a7f-2daa5b2c267a\macbook-hub-mobile-top.png`
- `C:\Users\User\.codex\visualizations\2026\07\25\019f98c4-75d3-7583-8a7f-2daa5b2c267a\macbook-hub-mobile-table.png`

## Astro check — WARNING (pre-existing out-of-scope error)

`astro check` sync content and generated types successfully แต่จบด้วย 1 TypeScript error ที่ `src/pages/วิธีการรับซื้อ.astro:104`: array ที่มี `null` ไม่ตรงกับ `Record<string, unknown>[]`

ข้อผิดพลาดนี้อยู่นอก MacBook scope และไฟล์ดังกล่าวไม่ได้ถูกแก้ใน Batch 2.1 จึงไม่แก้ข้าม scope

ผลรวม: 1 error, 0 warnings, 46 hints โดย hints อยู่ในไฟล์เดิมของโปรเจกต์

## Production build — WARNING (environment/process exit)

`astro build`:

- content sync ผ่าน
- type generation ผ่าน
- server entrypoints ผ่าน
- prerender target routes รวม MacBook ทั้ง 14 หน้าได้ครบ
- log ถึง `Rearranging server assets... ✓ Completed`
- stderr ว่าง
- หลังขั้นดังกล่าว process จบด้วย Windows native exit `-1073740791` (`0xC0000409`)

แม้ process exit ไม่เป็นศูนย์ แต่ built HTML ที่ได้ถูกเปิดใน browser และผ่าน targeted QA ด้าน route, canonical, H1, links, schema และ responsive ตามรายการด้านบน

## Existing project QA scripts — WARNING

- `qa:redirect-chain`: PASS, 10 sample paths, no loops/chains
- `qa:duplicate-headings`: PASS, 1,186 built pages, no duplicate titles/H1s
- `qa:sitemap`: รายงาน PASS แต่ตรวจ 0 sitemap files เพราะ build process ไม่ถึง artifact หลัง native exit จึงไม่ถือเป็นหลักฐาน sitemap ที่สมบูรณ์
- `qa:internal-404`: FAIL จาก script มอง server output prefix `/client` เป็น route ทำให้รายงาน missing จำนวนมาก
- `validate:seo`: FAIL จากสาเหตุเดียวกัน โดยคาด canonical เป็น `/client/...`
- `qa:claim-risk`: FAIL 1 จุดใน `src/content/services/รับซื้อโทรศัพท์เสีย.md:145` ซึ่งอยู่นอก scope

Targeted checker ที่ map `dist/client` กลับเป็น production route ตรวจ self-canonical และ internal targets ของ 14 หน้าแล้วผ่านทั้งหมด

## Sitemap/canonical source verification

- `@astrojs/sitemap` ยังอยู่ใน Astro config เดิม
- ไม่มีการแก้ route generation หรือ sitemap filters
- ไม่มีการแก้ slug/canonical implementation
- target route ทั้ง 14 หน้า prerender ได้และ self-canonical ถูกต้องใน built HTML
- เนื่องจาก native process exit ทำให้ไม่มี sitemap artifact สำหรับ end-to-end assertion จัดเป็น warning ไม่ใช่ pass เต็ม

## Content regression

- Seller guide เพิ่มจาก 46 เป็น 468 whitespace tokens
- Hub เพิ่มจาก 836 เป็น 922 whitespace tokens
- Hub มี 6-step process
- Hub มี model/year/chip/screen-size table
- Hub มีวิธีดู About This Mac, System Information, Serial Number และ Model Axxxx
- Hub แยกหัวข้อ Intel กับ Apple Silicon
- ไม่เพิ่มหน้าใหม่และไม่เพิ่ม package

## ข้อจำกัดเชิง SEO

ไม่มี Query×Page GSC export จึงยังพิสูจน์ไม่ได้ว่า Google เปลี่ยน landing URL หรือหยุด URL switching แล้ว ต้องติดตามหลัง release 28–56 วัน
