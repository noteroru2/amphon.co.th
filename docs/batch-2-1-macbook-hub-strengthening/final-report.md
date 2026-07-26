# Batch 2.1 MacBook Hub Strengthening — Final Report

## สรุปผล

Verdict: **PASS WITH WARNING**

Batch 2.1 ทำให้ `/บริการ/รับซื้อ-macbook` เป็นเจ้าของ intent กว้างเชิง transactional ชัดขึ้น และเปลี่ยน `/blog/ขาย-macbook-มือสอง-อย่างไรให้ได้ราคาดี` ให้เป็น informational seller-preparation guide โดยคง URL เดิมไว้

ไม่มี redirect, noindex, canonical consolidation, slug change, service-area change หรือการสร้างหน้าใหม่

## สิ่งที่ปรับใน Hub

- Title, H1 และ description เน้น broad transactional intent
- Above-the-fold answer ระบุรุ่นที่รับ วิธีเริ่มประเมิน และเงื่อนไขราคาสุดท้าย
- เพิ่มวิธีดู About This Mac, System Information, Serial Number และ Model Axxxx
- คงและขยาย valuation factors: chip, RAM, SSD, screen size, Battery Cycle, display, body, ports, accessories, repair history และ Find My
- แยกหัวข้อ Intel กับ Apple Silicon
- ปรับตารางให้มี model/group, year, chip, screen size และข้อมูลที่ต้องส่ง
- ทำ process ให้ครบ 6 ขั้น
- คง 8 unique child destinations: Air, Pro, Intel, M1, M2, M3/M4, เครื่องเสีย และจอแตก
- คง visible FAQ และ FAQPage schema ผ่าน layout เดิม

## สิ่งที่ปรับใน seller guide

- เปลี่ยน Title/H1/description/main keyword ไปที่ `เตรียม MacBook ก่อนขาย`
- ขยายเป็นคู่มือ 14 หัวข้อ: model/year, Intel vs Apple Silicon, RAM/SSD, battery, display, keyboard/trackpad/ports, body/repair, accessories, photography, backup, Apple ID/Find My, data erase, sales-channel choice และ comparable quote review
- เพิ่ม checklist ก่อนส่งข้อมูล
- เหลือ CTA ไป Hub 1 จุด
- ลบลิงก์ location เดิมออก
- ไม่พยายามเป็นหน้ารับซื้อหรือหน้าราคา

## Internal links

- MacBook blogs ทั้ง 5 หน้าลิงก์เข้า Hub ด้วย anchors ตามบริบท
- Child pages ทั้ง 8 มีลิงก์กลับ Hub
- เพิ่ม modifier-specific links ใน Intel, M1, M2, M3/M4, เสีย และจอแตก
- Air และ Pro เดิม compliant อยู่แล้ว จึงไม่แก้โดยไม่จำเป็น

รายละเอียด before/after อยู่ใน `internal-links-before-after.csv`

## Structured data

- ใช้ schema architecture เดิมของ layout
- Hub FAQPage ตรงกับ FAQ ที่มองเห็นได้
- ไม่เพิ่ม rating/review ปลอม
- ไม่เพิ่ม `aggregateRating` หรือ review schema

## QA

Targeted built-output QA ของ 14 routes ผ่าน:

- route exists
- exactly one H1
- self-canonical
- title/description present
- no broken internal links
- no aggregateRating/review schema
- Hub มี 8 unique child destinations
- mobile table scroll region ทำงานและไม่มี page-level overflow

Warning:

1. `astro check` มี pre-existing error นอก scope ที่ `src/pages/วิธีการรับซื้อ.astro:104`
2. `astro build` prerender และ rearrange assets ครบ แต่ Windows process จบด้วย native exit `0xC0000409` หลัง log success
3. QA scripts เดิมบางตัวตีความ `dist/client` เป็น route prefix `/client` จึงรายงาน false positives
4. ไม่มี Query×Page GSC data จึงยังพิสูจน์ผล ranking/landing-page ไม่ได้

ดูหลักฐานเต็มใน `qa-report.md`

## Risk

- Ranking อาจแกว่งระยะสั้นหลังเปลี่ยน metadata และ intent ของ seller guide
- Child metadata ยังใช้คำ prefix `รับซื้อ MacBook + modifier` ซึ่งถูกต้องตาม intent แต่ควรติดตาม Query×Page ว่ามี URL switching หรือไม่
- Service-area near-duplicate risk 20 หน้ายังคงอยู่ เพราะอยู่นอก scope Batch 2.1
- หากแก้ tooling/build warning ภายหลัง ควรรัน sitemap และ full-site validators ซ้ำก่อน deploy

## Measurement plan

- 7 วัน: ตรวจ index coverage, canonical และ crawl anomalies ของ 14 target routes
- 28 วัน: เปรียบเทียบ impressions, clicks, CTR, position และ landing page
- 42–56 วัน: ประเมิน broad transactional queries ว่า Hub เป็น landing page หลักหรือไม่
- Export GSC แบบ Query×Page สำหรับคำ MacBook ก่อนตัดสินใจเรื่อง redirect/consolidation
- แยกผล MacBook cluster ออกจาก iPad/iPhone และรวมเฉพาะช่วงหลัง release

## Rollback

หาก Hub สูญเสีย clicks หรือ seller guide แย่ง broad transactional landing หลัง 42–56 วัน ให้ rollback เฉพาะ metadata/content/link mapping จาก commit ของ Batch 2.1 โดยไม่ย้อนการเปลี่ยนแปลง cluster อื่น

## การส่งมอบ

- Branch: `batch-2-1-macbook-hub-strengthening`
- Commit message ที่กำหนด: `seo: strengthen MacBook hub and clarify cluster intent`
- Merge: ไม่ทำ
- Deploy: ไม่ทำ
