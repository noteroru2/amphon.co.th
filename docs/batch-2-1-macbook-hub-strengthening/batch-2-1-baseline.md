# Batch 2.1 MacBook Hub Strengthening — Baseline

วันที่ตรวจ: 2026-07-26

Branch: `batch-2-1-macbook-hub-strengthening`

Starting commit: `7ada4a2 feat(seo): expand iPad model identification guide with Axxxx tables`

## ข้อมูลตั้งต้น

อ่านรายงานจาก `docs/batch-2-macbook-cannibalization-audit/` ครบ 7 ไฟล์:

1. `macbook-cluster-inventory.csv`
2. `macbook-page-query-map.csv`
3. `macbook-title-h1-duplicates.csv`
4. `macbook-internal-link-audit.csv`
5. `macbook-gsc-landing-page-audit.csv`
6. `macbook-consolidation-candidates.csv`
7. `macbook-cannibalization-final-report.md`

Baseline เดิมครอบคลุม 67 URL: Hub 1, series 2, chip 4, condition 2, province 32, service-area 20, blog 5 และ Apple Hub 1 หน้า

## ปัญหาที่ Batch 2.1 รับมาจัดการ

- Confirmed on-page intent conflict 1 กลุ่ม: `/บริการ/รับซื้อ-macbook` กับ `/blog/ขาย-macbook-มือสอง-อย่างไรให้ได้ราคาดี`
- Hub มี 224 impressions, 1 click, CTR 0.45% และ average position 44.87 ในชุด GSC 6 เดือน
- Seller guide เดิมบางมาก: audit ประเมินประมาณ 95 คำ; ตัวนับ whitespace token ใน baseline นี้ได้ 46 token
- Hub เดิมมีเนื้อหาหลักหลายส่วนแล้ว แต่ยังขาดหัวข้อระบุรุ่น/ปี/สเปกที่ชัด, ตารางรุ่นที่มีปีและขนาดจอ, การแยก Intel กับ Apple Silicon แบบเป็นหัวข้อ และ process มีเพียง 5 ขั้น
- MacBook blogs ทั้ง 5 หน้า link เข้า Hub แล้ว แต่ anchor หลายหน้าซ้ำคำกว้าง `รับซื้อ MacBook`
- Air และ Pro มีลิงก์กลับ Hub และ modifier links อยู่แล้ว
- Intel, M1, M2, M3/M4, เครื่องเสีย และจอแตกมีลิงก์กลับ Hub แต่ไม่มี modifier-specific cross-links ใน body
- ไม่มี orphan ใน modeled internal-link graph
- ไม่มีหลักฐานเพียงพอสำหรับ redirect, noindex หรือ canonical consolidation

## ข้อจำกัดของข้อมูล GSC

ไฟล์ GSC แยก Query และ Page เป็นคนละ dimension มี 23 MacBook query rows และ 21 MacBook page rows แต่ไม่มี Query×Page export ดังนั้นยังพิสูจน์ actual ranking URL, URL switching หรือ SERP cannibalization หลังปรับไม่ได้ ผลเชิง organic ต้องติดตามต่อหลัง release 28–56 วันด้วย Query×Page data

## Scope ที่กำหนด

แตะเฉพาะ:

- MacBook Hub
- seller guide ที่ชน intent
- MacBook blogs อีก 4 หน้าเพื่อปรับ anchor
- child services 6 หน้าที่ขาด modifier-specific cross-links
- รายงาน Batch 2.1

ไม่แตะ:

- 20 MacBook service-area pages
- province pages
- iPad/iPhone cluster
- slug, redirect, noindex และ canonical implementation
- layout/schema architecture
- package/dependency

## สถานะ `generate-audit.mjs`

- Path จริง: `C:\Users\User\.codex\visualizations\2026\07\25\019f98c4-75d3-7583-8a7f-2daa5b2c267a\macbook-audit\generate-audit.mjs`
- ขนาดที่ตรวจพบ: 49,299 bytes
- สถานะ Git: อยู่นอก repository ของโปรเจกต์ และ parent directory ไม่ใช่ Git repository
- ประเภท: report-only audit utility
- Runtime dependency: ไม่จำเป็นต่อการ build หรือ runtime ของเว็บไซต์
- การดำเนินการใน Batch 2.1: ไม่แก้ ไม่ย้าย และไม่ลบ

## Baseline source metrics

| หน้า | Approx. whitespace tokens ก่อน | Hub links ก่อน | Child-link occurrences ก่อน |
|---|---:|---:|---:|
| MacBook Hub | 836 | 0 | 11 |
| MacBook Air | 143 | 1 | 5 |
| MacBook Pro | 166 | 1 | 5 |
| MacBook Intel | 131 | 1 | 0 |
| MacBook M1 | 116 | 1 | 0 |
| MacBook M2 | 113 | 1 | 0 |
| MacBook M3/M4 | 136 | 1 | 0 |
| MacBook เสีย | 100 | 1 | 0 |
| MacBook จอแตก | 98 | 1 | 0 |
| Seller guide | 46 | 1 | 0 |
| Price guide | 492 | 1 | 0 |
| Battery Cycle guide | 439 | 2 | 0 |
| Apple ID / Find My guide | 430 | 2 | 0 |
| Wipe-before-sale guide | 533 | 2 | 0 |

หมายเหตุ: ตัวเลขนี้เป็นตัวนับ whitespace token สำหรับเทียบ before/after ภายในชุดเดียวกัน ไม่ใช่ Thai linguistic word count
